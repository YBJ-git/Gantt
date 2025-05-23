const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// PostgreSQL 연결 설정
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'myproject_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres'
});

// 테이블 생성 및 더미 데이터 삽입
async function setupDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('PostgreSQL 데이터베이스에 연결되었습니다.');
        
        // 트랜잭션 시작
        await client.query('BEGIN');
        
        // 기존 테이블 삭제 (종속성 순서대로)
        const dropTables = [
            'DROP TABLE IF EXISTS workload_data CASCADE',
            'DROP TABLE IF EXISTS task_comments CASCADE',
            'DROP TABLE IF EXISTS task_history CASCADE',
            'DROP TABLE IF EXISTS resource_assignments CASCADE',
            'DROP TABLE IF EXISTS task_dependencies CASCADE',
            'DROP TABLE IF EXISTS tasks CASCADE',
            'DROP TABLE IF EXISTS projects CASCADE',
            'DROP TABLE IF EXISTS resource_skills CASCADE',
            'DROP TABLE IF EXISTS skills CASCADE',
            'DROP TABLE IF EXISTS resources CASCADE',
            'DROP TABLE IF EXISTS resource_types CASCADE',
            'DROP TABLE IF EXISTS departments CASCADE'
        ];
        
        for (const dropQuery of dropTables) {
            await client.query(dropQuery);
        }
        
        // 1. Departments (부서) 테이블
        await client.query(`
            CREATE TABLE departments (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Resource Types (리소스 유형) 테이블
        await client.query(`
            CREATE TABLE resource_types (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Resources (리소스) 테이블
        await client.query(`
            CREATE TABLE resources (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE,
                phone VARCHAR(50),
                location VARCHAR(255),
                department_id INTEGER REFERENCES departments(id),
                type_id INTEGER REFERENCES resource_types(id),
                capacity DECIMAL(5,2) DEFAULT 40.0,
                utilization DECIMAL(5,2) DEFAULT 0.0,
                cost_rate DECIMAL(10,2) DEFAULT 0.0,
                available_from DATE,
                available_to DATE,
                description TEXT,
                profile_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Skills (기술/역량) 테이블
        await client.query(`
            CREATE TABLE skills (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                category VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Resource Skills (리소스-기술 연결) 테이블
        await client.query(`
            CREATE TABLE resource_skills (
                id SERIAL PRIMARY KEY,
                resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
                skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
                proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(resource_id, skill_id)
            )
        `);

        // 6. Projects (프로젝트) 테이블
        await client.query(`
            CREATE TABLE projects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                status VARCHAR(20) CHECK(status IN ('planned', 'active', 'completed', 'on_hold')) DEFAULT 'planned',
                progress DECIMAL(5,2) DEFAULT 0.0 CHECK (progress BETWEEN 0 AND 100),
                budget DECIMAL(15,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Tasks (작업) 테이블
        await client.query(`
            CREATE TABLE tasks (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                workload DECIMAL(5,2) DEFAULT 0.0,
                status VARCHAR(20) CHECK(status IN ('planned', 'in-progress', 'completed', 'delayed')) DEFAULT 'planned',
                priority VARCHAR(10) CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
                progress DECIMAL(5,2) DEFAULT 0.0 CHECK (progress BETWEEN 0 AND 100),
                estimated_hours DECIMAL(5,2),
                actual_hours DECIMAL(5,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. Task Dependencies (작업 의존성) 테이블
        await client.query(`
            CREATE TABLE task_dependencies (
                id SERIAL PRIMARY KEY,
                predecessor_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
                successor_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
                dependency_type VARCHAR(20) CHECK(dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')) DEFAULT 'finish_to_start',
                lag_days INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(predecessor_id, successor_id)
            )
        `);

        // 9. Resource Assignments (리소스 할당) 테이블
        await client.query(`
            CREATE TABLE resource_assignments (
                id SERIAL PRIMARY KEY,
                task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
                resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
                project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
                allocation_percentage DECIMAL(5,2) DEFAULT 100.0 CHECK (allocation_percentage BETWEEN 0 AND 100),
                start_date DATE,
                end_date DATE,
                assigned_hours DECIMAL(5,2),
                actual_hours DECIMAL(5,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 10. Task History (작업 이력) 테이블
        await client.query(`
            CREATE TABLE task_history (
                id SERIAL PRIMARY KEY,
                task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
                action_type VARCHAR(50) NOT NULL,
                details TEXT,
                changed_by VARCHAR(255),
                changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                old_values JSONB,
                new_values JSONB
            )
        `);

        // 11. Task Comments (작업 댓글) 테이블
        await client.query(`
            CREATE TABLE task_comments (
                id SERIAL PRIMARY KEY,
                task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
                user_name VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 12. Workload Data (부하 데이터) 테이블
        await client.query(`
            CREATE TABLE workload_data (
                id SERIAL PRIMARY KEY,
                resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                workload_hours DECIMAL(5,2) DEFAULT 0.0,
                capacity_hours DECIMAL(5,2) DEFAULT 8.0,
                utilization_percentage DECIMAL(5,2) DEFAULT 0.0,
                project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(resource_id, date)
            )
        `);

        // 인덱스 생성
        await client.query('CREATE INDEX idx_resources_department ON resources(department_id)');
        await client.query('CREATE INDEX idx_resources_type ON resources(type_id)');
        await client.query('CREATE INDEX idx_tasks_project ON tasks(project_id)');
        await client.query('CREATE INDEX idx_tasks_status ON tasks(status)');
        await client.query('CREATE INDEX idx_resource_assignments_task ON resource_assignments(task_id)');
        await client.query('CREATE INDEX idx_resource_assignments_resource ON resource_assignments(resource_id)');
        await client.query('CREATE INDEX idx_workload_data_resource_date ON workload_data(resource_id, date)');

        console.log('모든 테이블이 성공적으로 생성되었습니다.');
        
        // 더미 데이터 삽입
        await insertDummyData(client);
        
        // 트랜잭션 커밋
        await client.query('COMMIT');
        console.log('데이터베이스 설정이 완료되었습니다!');
        
    } catch (err) {
        // 트랜잭션 롤백
        await client.query('ROLLBACK');
        console.error('데이터베이스 설정 오류:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

async function insertDummyData(client) {
    console.log('더미 데이터 삽입 시작...');

    // 1. Departments 더미 데이터
    const departments = [
        ['개발팀', '소프트웨어 개발 및 유지보수'],
        ['디자인팀', 'UI/UX 디자인 및 브랜딩'],
        ['QA팀', '품질 보증 및 테스트'],
        ['마케팅팀', '마케팅 및 홍보'],
        ['기획팀', '프로젝트 기획 및 관리'],
        ['인프라팀', '시스템 인프라 및 DevOps'],
        ['데이터팀', '데이터 분석 및 사이언스'],
        ['영업팀', '영업 및 고객 관리'],
        ['HR팀', '인사 및 채용'],
        ['재무팀', '재무 및 회계 관리']
    ];

    for (const [name, description] of departments) {
        await client.query(
            'INSERT INTO departments (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
            [name, description]
        );
    }

    // 2. Resource Types 더미 데이터
    const resourceTypes = [
        ['개발자', '소프트웨어 개발 전문가'],
        ['디자이너', 'UI/UX 및 그래픽 디자인 전문가'],
        ['QA 엔지니어', '소프트웨어 품질 보증 전문가'],
        ['프로젝트 매니저', '프로젝트 관리 전문가'],
        ['데이터 사이언티스트', '데이터 분석 및 머신러닝 전문가'],
        ['시스템 엔지니어', '시스템 인프라 관리 전문가'],
        ['마케팅 스페셜리스트', '마케팅 및 홍보 전문가'],
        ['세일즈 매니저', '영업 및 고객 관리 전문가'],
        ['비즈니스 애널리스트', '비즈니스 분석 전문가'],
        ['테크니컬 라이터', '기술 문서 작성 전문가']
    ];

    for (const [name, description] of resourceTypes) {
        await client.query(
            'INSERT INTO resource_types (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
            [name, description]
        );
    }

    // 3. Skills 더미 데이터
    const skills = [
        ['JavaScript', 'Frontend'],
        ['React', 'Frontend'],
        ['Vue.js', 'Frontend'],
        ['Angular', 'Frontend'],
        ['Node.js', 'Backend'],
        ['Python', 'Backend'],
        ['Java', 'Backend'],
        ['C#', 'Backend'],
        ['PHP', 'Backend'],
        ['Ruby', 'Backend'],
        ['SQL', 'Database'],
        ['MongoDB', 'Database'],
        ['PostgreSQL', 'Database'],
        ['MySQL', 'Database'],
        ['Redis', 'Database'],
        ['Docker', 'DevOps'],
        ['Kubernetes', 'DevOps'],
        ['AWS', 'Cloud'],
        ['Azure', 'Cloud'],
        ['GCP', 'Cloud'],
        ['Figma', 'Design'],
        ['Adobe XD', 'Design'],
        ['Photoshop', 'Design'],
        ['Illustrator', 'Design'],
        ['Sketch', 'Design'],
        ['Selenium', 'Testing'],
        ['Jest', 'Testing'],
        ['Cypress', 'Testing'],
        ['JUnit', 'Testing'],
        ['Postman', 'Testing']
    ];

    for (const [name, category] of skills) {
        await client.query(
            'INSERT INTO skills (name, category) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
            [name, category]
        );
    }

    // 4. Resources 더미 데이터
    const resources = [
        ['홍길동', 'hong@example.com', '010-1234-5678', '서울', 1, 1, 40.0, 85.0, 100000, '2025-05-01', '2025-12-31', '프론트엔드 개발 전문가. 웹 애플리케이션 개발 경험 5년.'],
        ['김철수', 'kim@example.com', '010-2345-6789', '부산', 1, 1, 40.0, 45.0, 90000, '2025-05-01', '2025-09-30', '백엔드 개발자. Java 및 Spring 프레임워크 전문.'],
        ['박지원', 'park@example.com', '010-3456-7890', '서울', 1, 1, 40.0, 110.0, 95000, '2025-05-01', '2025-12-31', '풀스택 개발자. 데이터베이스 설계 및 최적화 전문.'],
        ['이지은', 'lee@example.com', '010-4567-8901', '서울', 2, 2, 40.0, 75.0, 85000, '2025-05-01', '2025-10-31', 'UI/UX 디자이너. 사용자 경험 중심 디자인 전문가.'],
        ['최민수', 'choi@example.com', '010-5678-9012', '서울', 2, 2, 40.0, 60.0, 80000, '2025-05-01', '2025-08-31', '그래픽 디자이너. 브랜딩 및 마케팅 자료 디자인 전문.'],
        ['정영희', 'jung@example.com', '010-6789-0123', '인천', 3, 3, 40.0, 95.0, 85000, '2025-05-01', '2025-12-31', 'QA 엔지니어. 자동화 테스트 및 품질 관리 전문가.'],
        ['강민호', 'kang@example.com', '010-7890-1234', '대구', 1, 1, 40.0, 70.0, 88000, '2025-05-01', '2025-11-30', '백엔드 개발자. Python 및 Django 전문.'],
        ['윤서연', 'yoon@example.com', '010-8901-2345', '서울', 2, 2, 40.0, 55.0, 82000, '2025-05-01', '2025-09-15', 'UX 디자이너. 모바일 앱 디자인 전문.'],
        ['임태현', 'lim@example.com', '010-9012-3456', '광주', 3, 3, 40.0, 80.0, 87000, '2025-05-01', '2025-12-31', 'QA 엔지니어. 수동 테스트 및 테스트 계획 전문.'],
        ['조혜린', 'cho@example.com', '010-0123-4567', '서울', 4, 4, 40.0, 65.0, 120000, '2025-05-01', '2025-12-31', '프로젝트 매니저. 애자일 방법론 및 팀 관리 전문.']
    ];

    for (const resource of resources) {
        await client.query(
            `INSERT INTO resources 
            (name, email, phone, location, department_id, type_id, capacity, utilization, cost_rate, available_from, available_to, description) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (email) DO NOTHING`,
            resource
        );
    }

    // 5. Resource Skills 더미 데이터
    const resourceSkills = [
        [1, 1, 5], [1, 2, 5], [1, 11, 4], [1, 16, 3],
        [2, 7, 5], [2, 11, 4], [2, 13, 4], [2, 16, 3],
        [3, 6, 5], [3, 11, 5], [3, 14, 4], [3, 15, 4],
        [4, 21, 5], [4, 22, 4], [4, 25, 3],
        [5, 23, 5], [5, 24, 4], [5, 25, 3],
        [6, 26, 5], [6, 28, 4], [6, 30, 4],
        [7, 6, 5], [7, 11, 4], [7, 14, 4],
        [8, 21, 4], [8, 22, 5], [8, 25, 3],
        [9, 26, 4], [9, 29, 4], [9, 30, 3],
        [10, 1, 3], [10, 11, 3], [10, 16, 4]
    ];

    for (const [resourceId, skillId, proficiency] of resourceSkills) {
        await client.query(
            `INSERT INTO resource_skills (resource_id, skill_id, proficiency_level) 
            VALUES ($1, $2, $3)
            ON CONFLICT (resource_id, skill_id) DO NOTHING`,
            [resourceId, skillId, proficiency]
        );
    }

    // 6. Projects 더미 데이터
    const projects = [
        ['웹사이트 리뉴얼', '회사 공식 웹사이트 전면 리뉴얼 프로젝트', '2025-05-01', '2025-08-31', 'active', 65.0, 50000000],
        ['모바일 앱 개발', '신규 모바일 애플리케이션 개발', '2025-06-01', '2025-12-31', 'active', 30.0, 80000000],
        ['데이터 분석 시스템', '내부 데이터 분석 시스템 구축', '2025-05-15', '2025-10-31', 'active', 45.0, 30000000],
        ['레거시 시스템 마이그레이션', '기존 시스템의 클라우드 마이그레이션', '2025-07-01', '2026-03-31', 'planned', 0.0, 120000000],
        ['AI 챗봇 개발', '고객 서비스용 AI 챗봇 개발', '2025-08-01', '2025-11-30', 'planned', 0.0, 25000000],
        ['CRM 시스템 업그레이드', '기존 CRM 시스템 기능 확장', '2025-04-01', '2025-07-31', 'active', 80.0, 15000000],
        ['보안 시스템 강화', '전사 보안 시스템 업그레이드', '2025-06-15', '2025-09-15', 'active', 25.0, 35000000],
        ['데이터웨어하우스 구축', '빅데이터 분석을 위한 DW 구축', '2025-09-01', '2026-02-28', 'planned', 0.0, 60000000],
        ['모바일 앱 리디자인', '기존 앱의 UI/UX 개선', '2025-05-20', '2025-08-20', 'active', 40.0, 20000000],
        ['API 플랫폼 개발', '외부 연동을 위한 API 플랫폼', '2025-07-15', '2025-12-15', 'planned', 0.0, 45000000]
    ];

    for (const project of projects) {
        await client.query(
            `INSERT INTO projects 
            (name, description, start_date, end_date, status, progress, budget) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            project
        );
    }

    // 7. Tasks 더미 데이터
    const tasks = [
        ['프론트엔드 개발', '웹사이트의 사용자 인터페이스 및 프론트엔드 기능 개발.', 1, '2025-05-10', '2025-05-20', 37.0, 'in-progress', 'high', 65.0, 40.0, 30.0],
        ['백엔드 개발', '웹사이트 백엔드 API 및 데이터베이스 연동 개발.', 1, '2025-05-12', '2025-05-25', 18.0, 'in-progress', 'medium', 30.0, 50.0, 20.0],
        ['DB 모델링', '데이터베이스 스키마 및 모델 설계.', 1, '2025-05-08', '2025-05-15', 45.0, 'completed', 'high', 100.0, 40.0, 40.0],
        ['UI/UX 디자인', '웹사이트 전체 디자인 및 사용자 경험 설계', 1, '2025-05-05', '2025-05-18', 32.0, 'completed', 'high', 100.0, 35.0, 35.0],
        ['테스트 자동화', '웹사이트 기능 테스트 자동화 구축', 1, '2025-05-25', '2025-06-05', 28.0, 'planned', 'medium', 0.0, 30.0, 0.0],
        ['모바일 화면 설계', '모바일 앱 메인 화면 설계', 2, '2025-06-01', '2025-06-15', 25.0, 'in-progress', 'high', 20.0, 30.0, 8.0],
        ['사용자 인증 시스템', '모바일 앱 로그인/회원가입 기능', 2, '2025-06-10', '2025-06-25', 35.0, 'planned', 'high', 0.0, 40.0, 0.0],
        ['푸시 알림 기능', '모바일 푸시 알림 시스템 개발', 2, '2025-07-01', '2025-07-15', 20.0, 'planned', 'medium', 0.0, 25.0, 0.0],
        ['데이터 수집 모듈', '외부 데이터 수집 및 정제 모듈', 3, '2025-05-15', '2025-06-01', 40.0, 'in-progress', 'high', 50.0, 45.0, 25.0],
        ['분석 대시보드', '데이터 분석 결과 시각화 대시보드', 3, '2025-06-05', '2025-06-20', 35.0, 'planned', 'medium', 0.0, 40.0, 0.0],
        ['보고서 생성 기능', '분석 결과 자동 보고서 생성', 3, '2025-06-15', '2025-07-05', 30.0, 'planned', 'medium', 0.0, 35.0, 0.0],
        ['클라우드 아키텍처 설계', '시스템 클라우드 마이그레이션 아키텍처', 4, '2025-07-01', '2025-07-20', 45.0, 'planned', 'high', 0.0, 50.0, 0.0]
    ];

    for (const task of tasks) {
        await client.query(
            `INSERT INTO tasks 
            (name, description, project_id, start_date, end_date, workload, status, priority, progress, estimated_hours, actual_hours) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            task
        );
    }

    // 8. Task Dependencies 더미 데이터
    const taskDependencies = [
        [4, 1, 'finish_to_start', 0],
        [3, 2, 'finish_to_start', 0],
        [1, 5, 'finish_to_start', 2],
        [2, 5, 'finish_to_start', 2],
        [6, 7, 'finish_to_start', 0],
        [9, 10, 'finish_to_start', 3],
        [10, 11, 'finish_to_start', 0]
    ];

    for (const [predecessorId, successorId, dependencyType, lagDays] of taskDependencies) {
        await client.query(
            `INSERT INTO task_dependencies 
            (predecessor_id, successor_id, dependency_type, lag_days) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (predecessor_id, successor_id) DO NOTHING`,
            [predecessorId, successorId, dependencyType, lagDays]
        );
    }

    // 9. Resource Assignments 더미 데이터
    const resourceAssignments = [
        [1, 1, 1, 100.0, '2025-05-10', '2025-05-20', 37.0, 30.0],
        [2, 2, 1, 100.0, '2025-05-12', '2025-05-25', 18.0, 20.0],
        [3, 3, 1, 100.0, '2025-05-08', '2025-05-15', 45.0, 40.0],
        [4, 4, 1, 100.0, '2025-05-05', '2025-05-18', 32.0, 35.0],
        [5, 6, 1, 100.0, '2025-05-25', '2025-06-05', 28.0, 0.0],
        [6, 8, 2, 100.0, '2025-06-01', '2025-06-15', 25.0, 8.0],
        [7, 7, 2, 100.0, '2025-06-10', '2025-06-25', 35.0, 0.0],
        [8, 8, 2, 100.0, '2025-07-01', '2025-07-15', 20.0, 0.0],
        [9, 3, 3, 100.0, '2025-05-15', '2025-06-01', 40.0, 25.0],
        [10, 7, 3, 100.0, '2025-06-05', '2025-06-20', 35.0, 0.0]
    ];

    for (const assignment of resourceAssignments) {
        await client.query(
            `INSERT INTO resource_assignments 
            (task_id, resource_id, project_id, allocation_percentage, start_date, end_date, assigned_hours, actual_hours) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            assignment
        );
    }

    // 10. Task History 더미 데이터
    const taskHistory = [
        [1, 'created', '작업이 생성되었습니다.', '홍길동', '2025-05-01 10:30:00', null, '{"name":"프론트엔드 개발","status":"planned"}'],
        [1, 'updated', '작업 기간이 변경되었습니다. (2025-05-08 ~ 2025-05-18) → (2025-05-10 ~ 2025-05-20)', '김철수', '2025-05-05 14:15:00', '{"start_date":"2025-05-08","end_date":"2025-05-18"}', '{"start_date":"2025-05-10","end_date":"2025-05-20"}'],
        [1, 'progress', '진행률이 업데이트되었습니다. 30% → 65%', '홍길동', '2025-05-12 09:45:00', '{"progress":30}', '{"progress":65}'],
        [2, 'created', '작업이 생성되었습니다.', '김철수', '2025-05-01 11:00:00', null, '{"name":"백엔드 개발","status":"planned"}'],
        [2, 'status_changed', '작업 상태가 변경되었습니다. planned → in-progress', '김철수', '2025-05-12 08:00:00', '{"status":"planned"}', '{"status":"in-progress"}'],
        [3, 'created', '작업이 생성되었습니다.', '박지원', '2025-05-01 09:30:00', null, '{"name":"DB 모델링","status":"planned"}'],
        [3, 'completed', '작업이 완료되었습니다.', '박지원', '2025-05-15 17:30:00', '{"status":"in-progress","progress":80}', '{"status":"completed","progress":100}'],
        [4, 'created', '작업이 생성되었습니다.', '이지은', '2025-05-01 10:00:00', null, '{"name":"UI/UX 디자인","status":"planned"}'],
        [4, 'completed', '작업이 완료되었습니다.', '이지은', '2025-05-18 16:00:00', '{"status":"in-progress","progress":90}', '{"status":"completed","progress":100}'],
        [6, 'created', '작업이 생성되었습니다.', '윤서연', '2025-05-25 09:00:00', null, '{"name":"모바일 화면 설계","status":"planned"}']
    ];

    for (const history of taskHistory) {
        const [taskId, actionType, details, changedBy, changedAt, oldValues, newValues] = history;
        await client.query(
            `INSERT INTO task_history 
            (task_id, action_type, details, changed_by, changed_at, old_values, new_values) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [taskId, actionType, details, changedBy, changedAt, 
             oldValues ? JSON.parse(oldValues) : null, 
             newValues ? JSON.parse(newValues) : null]
        );
    }

    // 11. Task Comments 더미 데이터
    const taskComments = [
        [1, '홍길동', '디자인 가이드라인에 맞게 구현 중입니다.', '2025-05-12 10:30:00'],
        [1, '김철수', '관련 라이브러리 버전 이슈가 있으니 확인해주세요.', '2025-05-12 11:15:00'],
        [1, '이영희', '모바일 반응형 구현도 포함하나요?', '2025-05-13 09:00:00'],
        [1, '홍길동', '네, 모바일 반응형도 포함되어 있습니다.', '2025-05-13 09:30:00'],
        [2, '김철수', '데이터베이스 연결 테스트 완료했습니다.', '2025-05-13 14:20:00'],
        [2, '박지원', 'API 명세서 공유드렸으니 확인 부탁드립니다.', '2025-05-14 10:00:00'],
        [3, '박지원', 'ERD 초안 완성했습니다. 리뷰 부탁드립니다.', '2025-05-10 16:30:00'],
        [3, '김철수', 'ERD 검토 완료. 인덱스 추가 제안드립니다.', '2025-05-11 09:15:00'],
        [4, '이지은', '와이어프레임 1차 완성했습니다.', '2025-05-08 11:00:00'],
        [4, '최민수', '컬러 팔레트 적용해서 다시 공유드리겠습니다.', '2025-05-10 14:45:00']
    ];

    for (const [taskId, userName, content, createdAt] of taskComments) {
        await client.query(
            `INSERT INTO task_comments 
            (task_id, user_name, content, created_at) 
            VALUES ($1, $2, $3, $4)`,
            [taskId, userName, content, createdAt]
        );
    }

    // 12. Workload Data 더미 데이터
    const today = new Date();
    
    for (let resourceId = 1; resourceId <= 10; resourceId++) {
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            if (!isWeekend) {
                let workloadHours = 0;
                const random = Math.random();
                
                switch(resourceId) {
                    case 1: workloadHours = 6.5 + random * 2; break;
                    case 2: workloadHours = 3 + random * 2; break;
                    case 3: workloadHours = 7.5 + random * 1.5; break;
                    case 4: workloadHours = 5.5 + random * 2; break;
                    case 5: workloadHours = 4 + random * 1.5; break;
                    case 6: workloadHours = 7 + random * 1.5; break;
                    case 7: workloadHours = 5 + random * 2; break;
                    case 8: workloadHours = 4.5 + random * 1.5; break;
                    case 9: workloadHours = 6 + random * 2; break;
                    case 10: workloadHours = 5.5 + random * 1.5; break;
                }
                
                const capacityHours = 8.0;
                const utilizationPercentage = (workloadHours / capacityHours) * 100;
                
                await client.query(
                    `INSERT INTO workload_data 
                    (resource_id, date, workload_hours, capacity_hours, utilization_percentage, project_id) 
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (resource_id, date) DO NOTHING`,
                    [resourceId, dateStr, workloadHours, capacityHours, utilizationPercentage, 1]
                );
            }
        }
    }

    console.log('모든 더미 데이터가 성공적으로 삽입되었습니다.');
}

// 데이터베이스 설정 실행
setupDatabase().catch(console.error);

module.exports = { setupDatabase };