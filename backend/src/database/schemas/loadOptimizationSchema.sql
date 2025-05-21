-- 부하 최적화 관련 테이블 구조

-- 상태 값을 위한 ENUM 생성
CREATE TYPE load_optimization_status AS ENUM ('PENDING', 'APPLIED', 'REJECTED');

-- 1. 부하 최적화 헤더 테이블
CREATE TABLE load_optimization_header (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    threshold FLOAT NOT NULL DEFAULT 80,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    status load_optimization_status NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP NULL,
    applied_by VARCHAR(100) NULL,
    
    CONSTRAINT FK_LoadOptHeader_Project FOREIGN KEY (project_id) 
    REFERENCES projects(id)
);

-- 디테일 상태를 위한 ENUM 생성
CREATE TYPE load_optimization_detail_status AS ENUM ('PENDING', 'APPLIED', 'REJECTED', 'MODIFIED');

-- 2. 부하 최적화 상세 테이블
CREATE TABLE load_optimization_detail (
    id SERIAL PRIMARY KEY,
    optimization_id INT NOT NULL,
    task_id INT NOT NULL,
    current_resource_id INT NOT NULL,
    suggested_resource_id INT NOT NULL,
    overload_date DATE NOT NULL,
    expected_load_reduction FLOAT NOT NULL,
    reason VARCHAR(500) NULL,
    sequence INT NOT NULL,
    status load_optimization_detail_status NOT NULL DEFAULT 'PENDING',
    
    CONSTRAINT FK_LoadOptDetail_Header FOREIGN KEY (optimization_id) 
    REFERENCES load_optimization_header(id),
    CONSTRAINT FK_LoadOptDetail_Task FOREIGN KEY (task_id) 
    REFERENCES tasks(id),
    CONSTRAINT FK_LoadOptDetail_CurrentResource FOREIGN KEY (current_resource_id) 
    REFERENCES resources(id),
    CONSTRAINT FK_LoadOptDetail_SuggestedResource FOREIGN KEY (suggested_resource_id) 
    REFERENCES resources(id)
);

-- 3. 부하 최적화 적용 테이블
CREATE TABLE load_optimization_applied (
    id SERIAL PRIMARY KEY,
    optimization_id INT NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100) NOT NULL,
    modifications_count INT NOT NULL,
    
    CONSTRAINT FK_LoadOptApplied_Header FOREIGN KEY (optimization_id) 
    REFERENCES load_optimization_header(id)
);

-- 적용 상태 엔터티 생성
CREATE TYPE load_optimization_applied_status AS ENUM ('SUCCESS', 'FAILED');

-- 4. 부하 최적화 적용 상세 테이블
CREATE TABLE load_optimization_applied_detail (
    id SERIAL PRIMARY KEY,
    applied_id INT NOT NULL,
    task_id INT NOT NULL,
    old_resource_id INT NOT NULL,
    new_resource_id INT NOT NULL,
    status load_optimization_applied_status NOT NULL,
    message VARCHAR(500) NULL,
    
    CONSTRAINT FK_LoadOptAppliedDetail_Applied FOREIGN KEY (applied_id) 
    REFERENCES load_optimization_applied(id),
    CONSTRAINT FK_LoadOptAppliedDetail_Task FOREIGN KEY (task_id) 
    REFERENCES tasks(id),
    CONSTRAINT FK_LoadOptAppliedDetail_OldResource FOREIGN KEY (old_resource_id) 
    REFERENCES resources(id),
    CONSTRAINT FK_LoadOptAppliedDetail_NewResource FOREIGN KEY (new_resource_id) 
    REFERENCES resources(id)
);

-- 허용하는 재분배 상태를 위한 ENUM 생성
CREATE TYPE task_redistribution_status AS ENUM ('PENDING', 'APPLIED', 'REJECTED');

-- 5. 작업 재분배 헤더 테이블
CREATE TABLE task_redistribution_header (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    balance_score FLOAT NOT NULL,
    status task_redistribution_status NOT NULL DEFAULT 'PENDING',
    applied_at TIMESTAMP NULL,
    applied_by VARCHAR(100) NULL,
    
    CONSTRAINT FK_TaskRedistHeader_Project FOREIGN KEY (project_id) 
    REFERENCES projects(id)
);

-- 할당 타입과 상태를 위한 ENUM 생성
CREATE TYPE assignment_type AS ENUM ('FIXED', 'SUGGESTED');

-- 6. 작업 재분배 상세 테이블
CREATE TABLE task_redistribution_detail (
    id SERIAL PRIMARY KEY,
    redistribution_id INT NOT NULL,
    task_id INT NOT NULL,
    resource_id INT NOT NULL,
    assignment_type assignment_type NOT NULL,
    status task_redistribution_status NOT NULL DEFAULT 'PENDING',
    
    CONSTRAINT FK_TaskRedistDetail_Header FOREIGN KEY (redistribution_id) 
    REFERENCES task_redistribution_header(id),
    CONSTRAINT FK_TaskRedistDetail_Task FOREIGN KEY (task_id) 
    REFERENCES tasks(id),
    CONSTRAINT FK_TaskRedistDetail_Resource FOREIGN KEY (resource_id) 
    REFERENCES resources(id)
);

-- 차트 상태를 위한 ENUM 생성
CREATE TYPE balance_status AS ENUM ('BALANCED', 'UNBALANCED');

-- 7. 재분배 리소스 통계 테이블
CREATE TABLE redistribution_resource_stats (
    id SERIAL PRIMARY KEY,
    redistribution_id INT NOT NULL,
    resource_id INT NOT NULL,
    task_count INT NOT NULL,
    task_count_change INT NOT NULL,
    balance_status balance_status NOT NULL,
    
    CONSTRAINT FK_RedistResourceStats_Header FOREIGN KEY (redistribution_id) 
    REFERENCES task_redistribution_header(id),
    CONSTRAINT FK_RedistResourceStats_Resource FOREIGN KEY (resource_id) 
    REFERENCES resources(id)
);

-- 8. 리소스 일별 부하 기록 테이블
CREATE TABLE resource_daily_load (
    id SERIAL PRIMARY KEY,
    resource_id INT NOT NULL,
    date DATE NOT NULL,
    load FLOAT NOT NULL,
    capacity FLOAT NOT NULL,
    task_count INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT FK_ResourceDailyLoad_Resource FOREIGN KEY (resource_id) 
    REFERENCES resources(id),
    CONSTRAINT UQ_ResourceDailyLoad UNIQUE (resource_id, date)
);

-- 9. 부하 예측 헤더 테이블
CREATE TABLE load_prediction_header (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL,
    team_id INT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    new_tasks_count INT NOT NULL,
    avg_load_before FLOAT NOT NULL,
    avg_load_after FLOAT NOT NULL,
    load_difference FLOAT NOT NULL,
    
    CONSTRAINT FK_LoadPredictionHeader_Project FOREIGN KEY (project_id) 
    REFERENCES projects(id),
    CONSTRAINT FK_LoadPredictionHeader_Team FOREIGN KEY (team_id) 
    REFERENCES teams(id)
);

-- 10. 부하 예측 작업 테이블
CREATE TABLE load_prediction_tasks (
    id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    resource_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    effort FLOAT NOT NULL,
    description VARCHAR(500) NULL,
    
    CONSTRAINT FK_LoadPredictionTasks_Header FOREIGN KEY (prediction_id) 
    REFERENCES load_prediction_header(id),
    CONSTRAINT FK_LoadPredictionTasks_Resource FOREIGN KEY (resource_id) 
    REFERENCES resources(id)
);

-- 11. 부하 예측 리소스 차이 테이블
CREATE TABLE load_prediction_resource_diff (
    id SERIAL PRIMARY KEY,
    prediction_id INT NOT NULL,
    resource_id INT NOT NULL,
    avg_load_diff FLOAT NOT NULL,
    max_load_diff FLOAT NOT NULL,
    overloaded_days_before INT NOT NULL,
    overloaded_days_after INT NOT NULL,
    
    CONSTRAINT FK_LoadPredictionDiff_Header FOREIGN KEY (prediction_id) 
    REFERENCES load_prediction_header(id),
    CONSTRAINT FK_LoadPredictionDiff_Resource FOREIGN KEY (resource_id) 
    REFERENCES resources(id),
    CONSTRAINT UQ_LoadPredictionResourceDiff UNIQUE (prediction_id, resource_id)
);