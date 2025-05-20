-- 부하 최적화 관련 저장 프로시저

-- 1. 리소스별 일별 부하 계산 및 저장 프로시저
CREATE PROCEDURE usp_CalculateAndSaveResourceDailyLoad
    @StartDate DATE,
    @EndDate DATE,
    @ProjectId INT = NULL,
    @ResourceIds NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 임시 테이블 생성
    CREATE TABLE #ResourceDailyLoad (
        ResourceId INT,
        Date DATE,
        Load FLOAT,
        Capacity FLOAT,
        TaskCount INT
    );
    
    -- 날짜 범위 생성
    DECLARE @DateTable TABLE (Date DATE);
    DECLARE @CurrentDate DATE = @StartDate;
    
    WHILE @CurrentDate <= @EndDate
    BEGIN
        INSERT INTO @DateTable VALUES (@CurrentDate);
        SET @CurrentDate = DATEADD(day, 1, @CurrentDate);
    END;
    
    -- 리소스 ID 필터링
    DECLARE @Resources TABLE (Id INT);
    
    IF @ResourceIds IS NULL
    BEGIN
        -- 모든 리소스 또는 프로젝트 리소스
        IF @ProjectId IS NULL
            INSERT INTO @Resources SELECT id FROM resources WHERE is_active = 1;
        ELSE
            INSERT INTO @Resources 
            SELECT DISTINCT r.id 
            FROM resources r
            JOIN tasks t ON r.id = t.resource_id
            WHERE t.project_id = @ProjectId AND r.is_active = 1;
    END
    ELSE
    BEGIN
        -- 지정된 리소스만
        INSERT INTO @Resources
        SELECT value FROM STRING_SPLIT(@ResourceIds, ',');
    END;
    
    -- 리소스별 날짜별 부하 계산
    INSERT INTO #ResourceDailyLoad (ResourceId, Date, Load, Capacity, TaskCount)
    SELECT 
        r.Id AS ResourceId,
        d.Date,
        -- 부하 계산: 해당 날짜의 총 작업량(시간) / 리소스 일일 용량(시간) * 100
        ISNULL(
            (SELECT 
                SUM(
                    CASE 
                        -- 주말에는 주말용량 사용, 평일에는 일반용량 사용
                        WHEN DATEPART(WEEKDAY, d.Date) IN (1, 7) -- 토, 일
                            THEN 
                                CASE 
                                    WHEN t.work_on_weekend = 1 
                                        THEN t.effort / DATEDIFF(day, t.start_date, t.end_date) + 1
                                    ELSE 0
                                END
                        ELSE 
                            t.effort / 
                            (
                                -- 작업 기간 중 평일 수 계산
                                SELECT COUNT(*) 
                                FROM @DateTable dt
                                WHERE dt.Date BETWEEN t.start_date AND t.end_date
                                AND DATEPART(WEEKDAY, dt.Date) NOT IN (1, 7) -- 주말 제외
                            )
                    END
                ) / 
                CASE 
                    WHEN DATEPART(WEEKDAY, d.Date) IN (1, 7) -- 토, 일
                        THEN ISNULL(res.weekend_capacity, 0)
                    ELSE ISNULL(res.daily_capacity, 8)
                END * 100
            FROM tasks t
            JOIN resources res ON t.resource_id = res.id
            WHERE 
                t.resource_id = r.Id AND 
                d.Date BETWEEN t.start_date AND t.end_date AND
                t.is_deleted = 0
            ), 0) AS Load,
        -- 용량 설정
        CASE 
            WHEN DATEPART(WEEKDAY, d.Date) IN (1, 7) -- 토, 일
                THEN ISNULL(res.weekend_capacity, 0)
            ELSE ISNULL(res.daily_capacity, 8)
        END AS Capacity,
        -- 작업 수 계산
        ISNULL(
            (SELECT COUNT(*)
            FROM tasks t
            WHERE 
                t.resource_id = r.Id AND 
                d.Date BETWEEN t.start_date AND t.end_date AND
                t.is_deleted = 0
            ), 0) AS TaskCount
    FROM 
        @Resources r
        CROSS JOIN @DateTable d
        JOIN resources res ON r.Id = res.id;
    
    -- 기존 데이터 삭제 (해당 기간, 해당 리소스)
    DELETE FROM resource_daily_load
    WHERE 
        date BETWEEN @StartDate AND @EndDate AND
        resource_id IN (SELECT Id FROM @Resources);
    
    -- 새 데이터 삽입
    INSERT INTO resource_daily_load (resource_id, date, load, capacity, task_count, created_at)
    SELECT 
        ResourceId,
        Date,
        Load,
        Capacity,
        TaskCount,
        GETDATE()
    FROM #ResourceDailyLoad;
    
    -- 임시 테이블 삭제
    DROP TABLE #ResourceDailyLoad;
    
    -- 처리된 행 수 반환
    SELECT @@ROWCOUNT AS ProcessedRows;
END;
GO

-- 2. 부하 최적화 추천 조회 저장 프로시저
CREATE PROCEDURE usp_GetLoadOptimizationRecommendations
    @OptimizationId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 헤더 정보 조회
    SELECT 
        h.id,
        h.project_id AS ProjectId,
        p.name AS ProjectName,
        h.start_date AS StartDate,
        h.end_date AS EndDate,
        h.threshold,
        h.created_at AS CreatedAt,
        h.created_by AS CreatedBy,
        h.status,
        h.applied_at AS AppliedAt,
        h.applied_by AS AppliedBy
    FROM 
        load_optimization_header h
        JOIN projects p ON h.project_id = p.id
    WHERE 
        h.id = @OptimizationId;
    
    -- 추천 상세 조회
    SELECT 
        d.id,
        d.task_id AS TaskId,
        t.name AS TaskName,
        d.current_resource_id AS CurrentResourceId,
        cr.name AS CurrentResourceName,
        d.suggested_resource_id AS SuggestedResourceId,
        sr.name AS SuggestedResourceName,
        d.overload_date AS OverloadDate,
        d.expected_load_reduction AS ExpectedLoadReduction,
        d.reason,
        d.sequence,
        d.status
    FROM 
        load_optimization_detail d
        JOIN tasks t ON d.task_id = t.id
        JOIN resources cr ON d.current_resource_id = cr.id
        JOIN resources sr ON d.suggested_resource_id = sr.id
    WHERE 
        d.optimization_id = @OptimizationId
    ORDER BY 
        d.sequence;
END;
GO

-- 3. 부하 최적화 적용 프로시저
CREATE PROCEDURE usp_ApplyLoadOptimization
    @OptimizationId INT,
    @UserId NVARCHAR(100),
    @ModificationsXml XML
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @Now DATETIME = GETDATE();
        DECLARE @ModificationsCount INT = 0;
        DECLARE @AppliedId INT;
        
        -- 부하 최적화 헤더 상태 업데이트
        UPDATE load_optimization_header
        SET 
            status = 'APPLIED',
            applied_at = @Now,
            applied_by = @UserId
        WHERE 
            id = @OptimizationId AND
            status = 'PENDING';
            
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('유효하지 않은 최적화 ID이거나 이미 적용된 최적화입니다.', 16, 1);
        END;
        
        -- XML에서 수정 사항 추출
        CREATE TABLE #Modifications (
            TaskId INT,
            OldResourceId INT,
            NewResourceId INT,
            Status NVARCHAR(20),
            Message NVARCHAR(500)
        );
        
        INSERT INTO #Modifications (TaskId, OldResourceId, NewResourceId, Status, Message)
        SELECT
            Mod.value('(TaskId)[1]', 'INT') AS TaskId,
            Mod.value('(OldResourceId)[1]', 'INT') AS OldResourceId,
            Mod.value('(NewResourceId)[1]', 'INT') AS NewResourceId,
            'PENDING',
            NULL
        FROM @ModificationsXml.nodes('/Modifications/Modification') AS T(Mod);
        
        SET @ModificationsCount = @@ROWCOUNT;
        
        -- 적용 헤더 저장
        INSERT INTO load_optimization_applied (
            optimization_id,
            applied_at,
            applied_by,
            modifications_count
        ) VALUES (
            @OptimizationId,
            @Now,
            @UserId,
            @ModificationsCount
        );
        
        SET @AppliedId = SCOPE_IDENTITY();
        
        -- 각 작업의 리소스 변경 처리
        DECLARE @TaskId INT;
        DECLARE @OldResourceId INT;
        DECLARE @NewResourceId INT;
        
        DECLARE task_cursor CURSOR FOR
        SELECT TaskId, OldResourceId, NewResourceId
        FROM #Modifications;
        
        OPEN task_cursor;
        FETCH NEXT FROM task_cursor INTO @TaskId, @OldResourceId, @NewResourceId;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- 작업의 리소스 변경
            BEGIN TRY
                UPDATE tasks
                SET 
                    resource_id = @NewResourceId,
                    modified_at = @Now,
                    modified_by = @UserId
                WHERE 
                    id = @TaskId AND
                    resource_id = @OldResourceId;
                
                IF @@ROWCOUNT > 0
                BEGIN
                    -- 성공 상태 업데이트
                    UPDATE #Modifications
                    SET 
                        Status = 'SUCCESS',
                        Message = '작업 리소스 변경 성공'
                    WHERE 
                        TaskId = @TaskId AND
                        OldResourceId = @OldResourceId;
                    
                    -- 부하 최적화 상세 상태 업데이트
                    UPDATE load_optimization_detail
                    SET status = 'APPLIED'
                    WHERE 
                        optimization_id = @OptimizationId AND
                        task_id = @TaskId AND
                        suggested_resource_id = @NewResourceId;
                END
                ELSE
                BEGIN
                    -- 실패 상태 업데이트 (작업이 다른 리소스에 이미 할당됨)
                    UPDATE #Modifications
                    SET 
                        Status = 'FAILED',
                        Message = '작업이 예상된 리소스에 할당되어 있지 않거나 이미 변경되었습니다.'
                    WHERE 
                        TaskId = @TaskId AND
                        OldResourceId = @OldResourceId;
                END;
            END TRY
            BEGIN CATCH
                -- 오류 상태 업데이트
                UPDATE #Modifications
                SET 
                    Status = 'FAILED',
                    Message = ERROR_MESSAGE()
                WHERE 
                    TaskId = @TaskId AND
                    OldResourceId = @OldResourceId;
            END CATCH;
            
            FETCH NEXT FROM task_cursor INTO @TaskId, @OldResourceId, @NewResourceId;
        END;
        
        CLOSE task_cursor;
        DEALLOCATE task_cursor;
        
        -- 적용 상세 저장
        INSERT INTO load_optimization_applied_detail (
            applied_id,
            task_id,
            old_resource_id,
            new_resource_id,
            status,
            message
        )
        SELECT
            @AppliedId,
            TaskId,
            OldResourceId,
            NewResourceId,
            Status,
            Message
        FROM #Modifications;
        
        -- 임시 테이블 삭제
        DROP TABLE #Modifications;
        
        -- 결과 반환
        SELECT @AppliedId AS AppliedId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 오류 정보 반환
        SELECT
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END;
GO

-- 4. 리소스 부하 이력 조회 저장 프로시저
CREATE PROCEDURE usp_GetResourceLoadHistory
    @ResourceId INT,
    @StartDate DATE,
    @EndDate DATE,
    @Interval NVARCHAR(10) = 'DAY' -- DAY, WEEK, MONTH
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Interval = 'DAY'
    BEGIN
        -- 일별 데이터 반환
        SELECT
            resource_id AS ResourceId,
            date AS Date,
            load AS Load,
            capacity AS Capacity,
            task_count AS TaskCount,
            CASE
                WHEN load > 100 THEN 'OVERLOAD'
                WHEN load > 80 THEN 'HIGH'
                WHEN load >= 30 THEN 'NORMAL'
                ELSE 'UNDERUTILIZED'
            END AS Status
        FROM
            resource_daily_load
        WHERE
            resource_id = @ResourceId AND
            date BETWEEN @StartDate AND @EndDate
        ORDER BY
            date;
    END
    ELSE IF @Interval = 'WEEK'
    BEGIN
        -- 주별 데이터 계산 및 반환
        WITH WeeklyData AS (
            SELECT
                resource_id AS ResourceId,
                -- 주의 시작일 계산 (월요일 기준)
                DATEADD(DAY, -(DATEPART(WEEKDAY, date) + 5) % 7, date) AS WeekStartDate,
                load,
                capacity,
                task_count
            FROM
                resource_daily_load
            WHERE
                resource_id = @ResourceId AND
                date BETWEEN @StartDate AND @EndDate
        )
        SELECT
            ResourceId,
            WeekStartDate,
            DATEADD(DAY, 6, WeekStartDate) AS WeekEndDate,
            AVG(load) AS AvgLoad,
            MAX(load) AS MaxLoad,
            AVG(capacity) AS AvgCapacity,
            MAX(task_count) AS MaxTaskCount,
            CASE
                WHEN AVG(load) > 100 THEN 'OVERLOAD'
                WHEN AVG(load) > 80 THEN 'HIGH'
                WHEN AVG(load) >= 30 THEN 'NORMAL'
                ELSE 'UNDERUTILIZED'
            END AS Status
        FROM
            WeeklyData
        GROUP BY
            ResourceId, WeekStartDate
        ORDER BY
            WeekStartDate;
    END
    ELSE IF @Interval = 'MONTH'
    BEGIN
        -- 월별 데이터 계산 및 반환
        WITH MonthlyData AS (
            SELECT
                resource_id AS ResourceId,
                DATEFROMPARTS(YEAR(date), MONTH(date), 1) AS MonthStartDate,
                load,
                capacity,
                task_count
            FROM
                resource_daily_load
            WHERE
                resource_id = @ResourceId AND
                date BETWEEN @StartDate AND @EndDate
        )
        SELECT
            ResourceId,
            MonthStartDate,
            EOMONTH(MonthStartDate) AS MonthEndDate,
            AVG(load) AS AvgLoad,
            MAX(load) AS MaxLoad,
            AVG(capacity) AS AvgCapacity,
            MAX(task_count) AS MaxTaskCount,
            CASE
                WHEN AVG(load) > 100 THEN 'OVERLOAD'
                WHEN AVG(load) > 80 THEN 'HIGH'
                WHEN AVG(load) >= 30 THEN 'NORMAL'
                ELSE 'UNDERUTILIZED'
            END AS Status
        FROM
            MonthlyData
        GROUP BY
            ResourceId, MonthStartDate
        ORDER BY
            MonthStartDate;
    END
    ELSE
    BEGIN
        RAISERROR('유효하지 않은 간격입니다. DAY, WEEK, MONTH 중 하나를 사용하세요.', 16, 1);
    END;
END;
GO

-- 5. 부하 예측 저장 프로시저
CREATE PROCEDURE usp_SaveLoadPrediction
    @ProjectId INT,
    @TeamId INT = NULL,
    @StartDate DATE,
    @EndDate DATE,
    @AvgLoadBefore FLOAT,
    @AvgLoadAfter FLOAT,
    @LoadDifference FLOAT,
    @UserId NVARCHAR(100),
    @TasksXml XML,
    @ResourceDiffsXml XML
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @Now DATETIME = GETDATE();
        DECLARE @PredictionId INT;
        DECLARE @NewTasksCount INT = 0;
        
        -- XML에서 작업 데이터 추출
        CREATE TABLE #Tasks (
            TaskName NVARCHAR(200),
            ResourceId INT,
            StartDate DATE,
            EndDate DATE,
            Effort FLOAT,
            Description NVARCHAR(500)
        );
        
        INSERT INTO #Tasks (TaskName, ResourceId, StartDate, EndDate, Effort, Description)
        SELECT
            Task.value('(TaskName)[1]', 'NVARCHAR(200)'),
            Task.value('(ResourceId)[1]', 'INT'),
            Task.value('(StartDate)[1]', 'DATE'),
            Task.value('(EndDate)[1]', 'DATE'),
            Task.value('(Effort)[1]', 'FLOAT'),
            Task.value('(Description)[1]', 'NVARCHAR(500)')
        FROM @TasksXml.nodes('/Tasks/Task') AS T(Task);
        
        SET @NewTasksCount = @@ROWCOUNT;
        
        -- XML에서 리소스 부하 차이 데이터 추출
        CREATE TABLE #ResourceDiffs (
            ResourceId INT,
            AvgLoadDiff FLOAT,
            MaxLoadDiff FLOAT,
            OverloadedDaysBefore INT,
            OverloadedDaysAfter INT
        );
        
        INSERT INTO #ResourceDiffs (ResourceId, AvgLoadDiff, MaxLoadDiff, OverloadedDaysBefore, OverloadedDaysAfter)
        SELECT
            Diff.value('(ResourceId)[1]', 'INT'),
            Diff.value('(AvgLoadDiff)[1]', 'FLOAT'),
            Diff.value('(MaxLoadDiff)[1]', 'FLOAT'),
            Diff.value('(OverloadedDaysBefore)[1]', 'INT'),
            Diff.value('(OverloadedDaysAfter)[1]', 'INT')
        FROM @ResourceDiffsXml.nodes('/ResourceDiffs/ResourceDiff') AS T(Diff);
        
        -- 예측 헤더 저장
        INSERT INTO load_prediction_header (
            project_id,
            team_id,
            start_date,
            end_date,
            created_at,
            created_by,
            new_tasks_count,
            avg_load_before,
            avg_load_after,
            load_difference
        ) VALUES (
            @ProjectId,
            @TeamId,
            @StartDate,
            @EndDate,
            @Now,
            @UserId,
            @NewTasksCount,
            @AvgLoadBefore,
            @AvgLoadAfter,
            @LoadDifference
        );
        
        SET @PredictionId = SCOPE_IDENTITY();
        
        -- 예측 작업 저장
        INSERT INTO load_prediction_tasks (
            prediction_id,
            task_name,
            resource_id,
            start_date,
            end_date,
            effort,
            description
        )
        SELECT
            @PredictionId,
            TaskName,
            ResourceId,
            StartDate,
            EndDate,
            Effort,
            Description
        FROM #Tasks;
        
        -- 리소스별 부하 차이 저장
        INSERT INTO load_prediction_resource_diff (
            prediction_id,
            resource_id,
            avg_load_diff,
            max_load_diff,
            overloaded_days_before,
            overloaded_days_after
        )
        SELECT
            @PredictionId,
            ResourceId,
            AvgLoadDiff,
            MaxLoadDiff,
            OverloadedDaysBefore,
            OverloadedDaysAfter
        FROM #ResourceDiffs;
        
        -- 임시 테이블 삭제
        DROP TABLE #Tasks;
        DROP TABLE #ResourceDiffs;
        
        -- 결과 반환
        SELECT @PredictionId AS PredictionId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 오류 정보 반환
        SELECT
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END;
GO

-- 6. 시스템 부하 요약 조회 저장 프로시저
CREATE PROCEDURE usp_GetSystemLoadSummary
    @ProjectId INT = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 날짜 범위 설정 (기본값: 최근 30일 + 향후 60일)
    IF @StartDate IS NULL
        SET @StartDate = DATEADD(DAY, -30, CAST(GETDATE() AS DATE));
        
    IF @EndDate IS NULL
        SET @EndDate = DATEADD(DAY, 60, CAST(GETDATE() AS DATE));
    
    -- 프로젝트별 리소스 ID 조회
    DECLARE @ResourceIds TABLE (ResourceId INT);
    
    IF @ProjectId IS NOT NULL
    BEGIN
        INSERT INTO @ResourceIds
        SELECT DISTINCT r.id
        FROM resources r
        JOIN tasks t ON r.id = t.resource_id
        WHERE t.project_id = @ProjectId
        AND r.is_active = 1;
    END
    ELSE
    BEGIN
        INSERT INTO @ResourceIds
        SELECT id FROM resources
        WHERE is_active = 1;
    END;
    
    -- 리소스별 부하 요약 조회
    WITH ResourceLoadSummary AS (
        SELECT
            r.id AS ResourceId,
            r.name AS ResourceName,
            r.type AS ResourceType,
            AVG(rdl.load) AS AvgLoad,
            MAX(rdl.load) AS MaxLoad,
            COUNT(CASE WHEN rdl.load > 100 THEN 1 END) AS OverloadedDays,
            COUNT(CASE WHEN rdl.load > 80 AND rdl.load <= 100 THEN 1 END) AS HighLoadDays,
            COUNT(CASE WHEN rdl.load >= 30 AND rdl.load <= 80 THEN 1 END) AS NormalDays,
            COUNT(CASE WHEN rdl.load < 30 THEN 1 END) AS UnderutilizedDays,
            COUNT(*) AS TotalDays
        FROM
            resources r
            JOIN @ResourceIds ri ON r.id = ri.ResourceId
            LEFT JOIN resource_daily_load rdl ON r.id = rdl.resource_id
                AND rdl.date BETWEEN @StartDate AND @EndDate
        GROUP BY
            r.id, r.name, r.type
    )
    
    -- 시스템 부하 요약
    SELECT
        -- 시스템 부하 요약
        AVG(rls.AvgLoad) AS SystemAvgLoad,
        MAX(rls.MaxLoad) AS SystemMaxLoad,
        COUNT(CASE WHEN rls.AvgLoad > 100 THEN 1 END) AS OverloadedResources,
        COUNT(CASE WHEN rls.AvgLoad > 80 AND rls.AvgLoad <= 100 THEN 1 END) AS HighLoadResources,
        COUNT(CASE WHEN rls.AvgLoad >= 30 AND rls.AvgLoad <= 80 THEN 1 END) AS OptimalResources,
        COUNT(CASE WHEN rls.AvgLoad < 30 THEN 1 END) AS UnderutilizedResources,
        COUNT(*) AS TotalResources,
        
        -- 부하 균형 통계
        STDEV(rls.AvgLoad) AS LoadStdDev,
        CASE 
            WHEN STDEV(rls.AvgLoad) / NULLIF(AVG(rls.AvgLoad), 0) > 0.5 THEN 'UNBALANCED'
            WHEN STDEV(rls.AvgLoad) / NULLIF(AVG(rls.AvgLoad), 0) > 0.3 THEN 'MODERATE'
            ELSE 'BALANCED'
        END AS BalanceStatus,
        
        -- 건강도 점수 (0-100, 높을수록 좋음)
        CAST(100 * (
            -- 균형도 (30%): 표준편차가 낮을수록 높은 점수
            0.3 * (1 - STDEV(rls.AvgLoad) / NULLIF(AVG(rls.AvgLoad), 0) * 2) +
            -- 적정부하 리소스 비율 (40%)
            0.4 * (COUNT(CASE WHEN rls.AvgLoad >= 30 AND rls.AvgLoad <= 80 THEN 1 END) / NULLIF(COUNT(*), 0)) +
            -- 과부하 리소스 부재 (20%)
            0.2 * (1 - COUNT(CASE WHEN rls.AvgLoad > 100 THEN 1 END) / NULLIF(COUNT(*), 0)) +
            -- 저부하 리소스 비율 감소 (10%)
            0.1 * (1 - COUNT(CASE WHEN rls.AvgLoad < 30 THEN 1 END) / NULLIF(COUNT(*), 0))
        ) AS DECIMAL(5,2)) AS SystemHealthScore
    FROM
        ResourceLoadSummary rls;
    
    -- 리소스별 부하 요약
    SELECT
        ResourceId,
        ResourceName,
        ResourceType,
        CAST(AvgLoad AS DECIMAL(5,2)) AS AvgLoad,
        CAST(MaxLoad AS DECIMAL(5,2)) AS MaxLoad,
        OverloadedDays,
        HighLoadDays,
        NormalDays,
        UnderutilizedDays,
        TotalDays,
        CAST(OverloadedDays * 100.0 / NULLIF(TotalDays, 0) AS DECIMAL(5,2)) AS OverloadedDaysPercent,
        CAST((OverloadedDays + HighLoadDays) * 100.0 / NULLIF(TotalDays, 0) AS DECIMAL(5,2)) AS HighLoadDaysPercent,
        CAST(NormalDays * 100.0 / NULLIF(TotalDays, 0) AS DECIMAL(5,2)) AS OptimalDaysPercent,
        CAST(UnderutilizedDays * 100.0 / NULLIF(TotalDays, 0) AS DECIMAL(5,2)) AS UnderutilizedDaysPercent,
        CASE
            WHEN AvgLoad > 100 THEN 'OVERLOAD'
            WHEN AvgLoad > 80 THEN 'HIGH'
            WHEN AvgLoad >= 30 THEN 'OPTIMAL'
            ELSE 'UNDERUTILIZED'
        END AS Status,
        -- 리소스 건강도 점수 (0-100, 높을수록 좋음)
        CAST(100 * (
            -- 적정부하 일수 비율 (50%)
            0.5 * (NormalDays / NULLIF(TotalDays, 0)) +
            -- 과부하 일수 부재 (30%)
            0.3 * (1 - OverloadedDays / NULLIF(TotalDays, 0)) +
            -- 저부하 일수 비율 감소 (20%)
            0.2 * (1 - UnderutilizedDays / NULLIF(TotalDays, 0))
        ) AS DECIMAL(5,2)) AS ResourceHealthScore
    FROM
        ResourceLoadSummary
    ORDER BY
        AvgLoad DESC;
END;
GO