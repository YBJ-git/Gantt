,
    @AppliedBy UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TaskList TABLE (TaskId UNIQUEIDENTIFIER);
    
    -- 작업 ID 문자열을 테이블로 변환
    INSERT INTO @TaskList
    SELECT value FROM STRING_SPLIT(@TaskIds, ',');
    
    -- 시뮬레이션 조회
    DECLARE @Reassignments NVARCHAR(MAX);
    SELECT @Reassignments = Reassignments
    FROM LoadOptimizationSimulations
    WHERE Id = @SimulationId AND Status = 'completed';
    
    IF @Reassignments IS NULL
    BEGIN
        RAISERROR('Simulation not found or not in completed status', 16, 1);
        RETURN;
    END
    
    -- 트랜잭션 시작
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 재할당 적용
        DECLARE @ReassignmentTable TABLE (
            TaskId UNIQUEIDENTIFIER,
            ResourceId UNIQUEIDENTIFIER
        );
        
        -- JSON에서 데이터 추출
        INSERT INTO @ReassignmentTable
        SELECT 
            JSON_VALUE(value, '$.taskId') AS TaskId,
            JSON_VALUE(value, '$.toResourceId') AS ResourceId
        FROM OPENJSON(@Reassignments)
        WHERE JSON_VALUE(value, '$.taskId') IN (SELECT TaskId FROM @TaskList);
        
        -- 작업 재할당
        UPDATE Tasks
        SET 
            AssigneeId = rt.ResourceId,
            UpdatedAt = GETUTCDATE(),
            UpdatedBy = @AppliedBy
        FROM 
            Tasks t
            INNER JOIN @ReassignmentTable rt ON t.Id = rt.TaskId;
        
        -- 시뮬레이션 상태 업데이트
        UPDATE LoadOptimizationSimulations
        SET 
            Status = 'applied',
            AppliedAt = GETUTCDATE(),
            AppliedBy = @AppliedBy
        WHERE 
            Id = @SimulationId;
        
        -- 트랜잭션 완료
        COMMIT;
        
        -- 결과 반환
        SELECT COUNT(*) AS ReassignedTasks FROM @ReassignmentTable;
    END TRY
    BEGIN CATCH
        -- 오류 발생 시 롤백
        ROLLBACK;
        
        -- 오류 정보 반환
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH
END
GO
