const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, 'my_project_db.sqlite');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('데이터베이스 연결 오류:', err.message);
    } else {
        console.log('SQLite 데이터베이스에 연결되었습니다.');
    }
});

// 테이블 생성 및 더미 데이터 삽입
function setupDatabase() {
    db.serialize(() => {
        // 1. Departments (부서) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Resource Types (리소스 유형) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS resource_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Resources (리소스) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE,
                phone TEXT,
                location TEXT,
                department_id INTEGER,
                type_id INTEGER,
                capacity DECIMAL(5,2) DEFAULT 40.0,
                utilization DECIMAL(5,2) DEFAULT 0.0,
                cost_rate DECIMAL(10,2) DEFAULT 0.0,
                available_from DATE,
                available_to DATE,
                description TEXT,
                profile_image TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (department_id) REFERENCES departments(id),
                FOREIGN KEY (type_id) REFERENCES resource_types(id)
            )
        `);

        // 4. Skills (기술/역량) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                category TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Resource Skills (리소스-기술 연결) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS resource_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resource_id INTEGER,
                skill_id INTEGER,
                proficiency_level INTEGER DEFAULT 3, -- 1-5 스케일
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resource_id) REFERENCES resources(id),
                FOREIGN KEY (skill_id) REFERENCES skills(id),
                UNIQUE(resource_id, skill_id)
            )
        `);

        // 6. Projects (프로젝트) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                status TEXT CHECK(status IN ('planned', 'active', 'completed', 'on_hold')) DEFAULT 'planned',
                progress DECIMAL(5,2) DEFAULT 0.0,
                budget DECIMAL(15,2),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Tasks (작업) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                project_id INTEGER,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                workload DECIMAL(5,2) DEFAULT 0.0,
                status TEXT CHECK(status IN ('planned', 'in-progress', 'completed', 'delayed')) DEFAULT 'planned',
                priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
                progress DECIMAL(5,2) DEFAULT 0.0,
                estimated_hours DECIMAL(5,2),
                actual_hours DECIMAL(5,2),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )
        `);

        // 8. Task Dependencies (작업 의존성) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS task_dependencies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                predecessor_id INTEGER,
                successor_id INTEGER,
                dependency_type TEXT CHECK(dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')) DEFAULT 'finish_to_start',
                lag_days INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (predecessor_id) REFERENCES tasks(id),
                FOREIGN KEY (successor_id) REFERENCES tasks(id),
                UNIQUE(predecessor_id, successor_id)
            )
        `);

        // 9. Resource Assignments (리소스 할당) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS resource_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                resource_id INTEGER,
                project_id INTEGER,
                allocation_percentage DECIMAL(5,2) DEFAULT 100.0,
                start_date DATE,
                end_date DATE,
                assigned_hours DECIMAL(5,2),
                actual_hours DECIMAL(5,2),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id),
                FOREIGN KEY (resource_id) REFERENCES resources(id),
                FOREIGN KEY (project_id) REFERENCES projects(id)
            )
        `);

        // 10. Task History (작업 이력) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS task_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                action_type TEXT NOT NULL,
                details TEXT,
                changed_by TEXT,
                changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                old_values TEXT, -- JSON 형태
                new_values TEXT, -- JSON 형태
                FOREIGN KEY (task_id) REFERENCES tasks(id)
            )
        `);

        // 11. Task Comments (작업 댓글) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS task_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER,
                user_name TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(id)
            )
        `);

        // 12. Workload Data (부하 데이터) 테이블
        db.run(`
            CREATE TABLE IF NOT EXISTS workload_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resource_id INTEGER,
                date DATE NOT NULL,
                workload_hours DECIMAL(5,2) DEFAULT 0.0,
                capacity_hours DECIMAL(5,2) DEFAULT 8.0,
                utilization_percentage DECIMAL(5,2) DEFAULT 0.0,
                project_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resource_id) REFERENCES resources(id),
                FOREIGN KEY (project_id) REFERENCES projects(id),
                UNIQUE(resource_id, date)
            )
        `);

        console.log('모든 테이블이 성공적으로 생성되었습니다.');
        
        // 더미 데이터 삽입
        insertDummyData();
    });
}

function insertDummyData() {
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

    departments.forEach(([name, description]) => {
        db.run(`INSERT OR IGNORE INTO departments (name, description) VALUES (?, ?)`, [name, description]);
    });

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

    resourceTypes.forEach(([name, description]) => {
        db.run(`INSERT OR IGNORE INTO resource_types (name, description) VALUES (?, ?)`, [name, description]);
    });

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

    skills.forEach(([name, category]) => {
        db.run(`INSERT OR IGNORE INTO skills (name, category) VALUES (?, ?)`, [name, category]);
    });

    // 4. Resources 더미 데이터 (프론트엔드 mockData 기반)
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

    resources.forEach(([name, email, phone, location, deptId, typeId, capacity, utilization, costRate, availableFrom, availableTo, description]) => {
        db.run(`
            INSERT OR IGNORE INTO resources 
            (name, email, phone, location, department_id, type_id, capacity, utilization, cost_rate, available_from, available_to, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, email, phone, location, deptId, typeId, capacity, utilization, costRate, availableFrom, availableTo, description]);
    });

    // 5. Resource Skills 더미 데이터 (리소스별 기술 할당)
    const resourceSkills = [
        // 홍길동 (프론트엔드 개발자)
        [1, 1, 5], [1, 2, 5], [1, 11, 4], [1, 16, 3],
        // 김철수 (백엔드 개발자)
        [2, 7, 5], [2, 11, 4], [2, 13, 4], [2, 16, 3],
        // 박지원 (풀스택 개발자)
        [3, 6, 5], [3, 11, 5], [3, 14, 4], [3, 15, 4],
        // 이지은 (UI/UX 디자이너)
        [4, 21, 5], [4, 22, 4], [4, 25, 3],
        // 최민수 (그래픽 디자이너)
        [5, 23, 5], [5, 24, 4], [5, 25, 3],
        // 정영희 (QA 엔지니어)
        [6, 26, 5], [6, 28, 4], [6, 30, 4],
        // 강민호 (백엔드 개발자)
        [7, 6, 5], [7, 11, 4], [7, 14, 4],
        // 윤서연 (UX 디자이너)
        [8, 21, 4], [8, 22, 5], [8, 25, 3],
        // 임태현 (QA 엔지니어)
        [9, 26, 4], [9, 29, 4], [9, 30, 3],
        // 조혜린 (프로젝트 매니저)
        [10, 1, 3], [10, 11, 3], [10, 16, 4]
    ];

    resourceSkills.forEach(([resourceId, skillId, proficiency]) => {
        db.run(`INSERT OR IGNORE INTO resource_skills (resource_id, skill_id, proficiency_level) VALUES (?, ?, ?)`, 
               [resourceId, skillId, proficiency]);
    });

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

    projects.forEach(([name, description, startDate, endDate, status, progress, budget]) => {
        db.run(`
            INSERT OR IGNORE INTO projects 
            (name, description, start_date, end_date, status, progress, budget) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [name, description, startDate, endDate, status, progress, budget]);
    });

    // 7. Tasks 더미 데이터 (프론트엔드 mockData 기반)
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

    tasks.forEach(([name, description, projectId, startDate, endDate, workload, status, priority, progress, estimatedHours, actualHours]) => {
        db.run(`
            INSERT OR IGNORE INTO tasks 
            (name, description, project_id, start_date, end_date, workload, status, priority, progress, estimated_hours, actual_hours) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [name, description, projectId, startDate, endDate, workload, status, priority, progress, estimatedHours, actualHours]);
    });

    // 8. Task Dependencies 더미 데이터
    const taskDependencies = [
        [4, 1, 'finish_to_start', 0], // UI/UX 디자인 -> 프론트엔드 개발
        [3, 2, 'finish_to_start', 0], // DB 모델링 -> 백엔드 개발
        [1, 5, 'finish_to_start', 2], // 프론트엔드 개발 -> 테스트 자동화
        [2, 5, 'finish_to_start', 2], // 백엔드 개발 -> 테스트 자동화
        [6, 7, 'finish_to_start', 0], // 모바일 화면 설계 -> 사용자 인증 시스템
        [9, 10, 'finish_to_start', 3], // 데이터 수집 모듈 -> 분석 대시보드
        [10, 11, 'finish_to_start', 0] // 분석 대시보드 -> 보고서 생성 기능
    ];

    taskDependencies.forEach(([predecessorId, successorId, dependencyType, lagDays]) => {
        db.run(`
            INSERT OR IGNORE INTO task_dependencies 
            (predecessor_id, successor_id, dependency_type, lag_days) 
            VALUES (?, ?, ?, ?)
        `, [predecessorId, successorId, dependencyType, lagDays]);
    });

    // 9. Resource Assignments 더미 데이터
    const resourceAssignments = [
        [1, 1, 1, 100.0, '2025-05-10', '2025-05-20', 37.0, 30.0], // 홍길동 -> 프론트엔드 개발
        [2, 2, 1, 100.0, '2025-05-12', '2025-05-25', 18.0, 20.0], // 김철수 -> 백엔드 개발
        [3, 3, 1, 100.0, '2025-05-08', '2025-05-15', 45.0, 40.0], // 박지원 -> DB 모델링
        [4, 4, 1, 100.0, '2025-05-05', '2025-05-18', 32.0, 35.0], // 이지은 -> UI/UX 디자인
        [5, 6, 1, 100.0, '2025-05-25', '2025-06-05', 28.0, 0.0], // 정영희 -> 테스트 자동화
        [6, 8, 2, 100.0, '2025-06-01', '2025-06-15', 25.0, 8.0], // 윤서연 -> 모바일 화면 설계
        [7, 7, 2, 100.0, '2025-06-10', '2025-06-25', 35.0, 0.0], // 강민호 -> 사용자 인증 시스템
        [8, 8, 2, 100.0, '2025-07-01', '2025-07-15', 20.0, 0.0], // 윤서연 -> 푸시 알림 기능 (추가 할당)
        [9, 3, 3, 100.0, '2025-05-15', '2025-06-01', 40.0, 25.0], // 박지원 -> 데이터 수집 모듈
        [10, 7, 3, 100.0, '2025-06-05', '2025-06-20', 35.0, 0.0] // 강민호 -> 분석 대시보드
    ];

    resourceAssignments.forEach(([taskId, resourceId, projectId, allocation, startDate, endDate, assignedHours, actualHours]) => {
        db.run(`
            INSERT OR IGNORE INTO resource_assignments 
            (task_id, resource_id, project_id, allocation_percentage, start_date, end_date, assigned_hours, actual_hours) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [taskId, resourceId, projectId, allocation, startDate, endDate, assignedHours, actualHours]);
    });

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

    taskHistory.forEach(([taskId, actionType, details, changedBy, changedAt, oldValues, newValues]) => {
        db.run(`
            INSERT OR IGNORE INTO task_history 
            (task_id, action_type, details, changed_by, changed_at, old_values, new_values) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [taskId, actionType, details, changedBy, changedAt, oldValues, newValues]);
    });

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

    taskComments.forEach(([taskId, userName, content, createdAt]) => {
        db.run(`
            INSERT OR IGNORE INTO task_comments 
            (task_id, user_name, content, created_at) 
            VALUES (?, ?, ?, ?)
        `, [taskId, userName, content, createdAt]);
    });

    // 12. Workload Data 더미 데이터 (최근 30일)
    const today = new Date();
    const workloadData = [];
    
    // 각 리소스에 대해 최근 30일간의 부하 데이터 생성
    for (let resourceId = 1; resourceId <= 10; resourceId++) {
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            // 주말은 부하 0으로 설정
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            if (!isWeekend) {
                // 리소스별 다른 부하 패턴 생성
                let workloadHours = 0;
                const random = Math.random();
                
                switch(resourceId) {
                    case 1: // 홍길동 - 높은 부하
                        workloadHours = 6.5 + random * 2;
                        break;
                    case 2: // 김철수 - 중간 부하
                        workloadHours = 3 + random * 2;
                        break;
                    case 3: // 박지원 - 매우 높은 부하
                        workloadHours = 7.5 + random * 1.5;
                        break;
                    case 4: // 이지은 - 중간 부하
                        workloadHours = 5.5 + random * 2;
                        break;
                    case 5: // 최민수 - 낮은 부하
                        workloadHours = 4 + random * 1.5;
                        break;
                    case 6: // 정영희 - 높은 부하
                        workloadHours = 7 + random * 1.5;
                        break;
                    case 7: // 강민호 - 중간 부하
                        workloadHours = 5 + random * 2;
                        break;
                    case 8: // 윤서연 - 중간-낮은 부하
                        workloadHours = 4.5 + random * 1.5;
                        break;
                    case 9: // 임태현 - 높은 부하
                        workloadHours = 6 + random * 2;
                        break;
                    case 10: // 조혜린 - 중간 부하
                        workloadHours = 5.5 + random * 1.5;
                        break;
                }
                
                const capacityHours = 8.0;
                const utilizationPercentage = (workloadHours / capacityHours) * 100;
                
                workloadData.push([resourceId, dateStr, workloadHours, capacityHours, utilizationPercentage, 1]);
            }
        }
    }

    workloadData.forEach(([resourceId, date, workloadHours, capacityHours, utilizationPercentage, projectId]) => {
        db.run(`
            INSERT OR IGNORE INTO workload_data 
            (resource_id, date, workload_hours, capacity_hours, utilization_percentage, project_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [resourceId, date, workloadHours, capacityHours, utilizationPercentage, projectId]);
    });

    console.log('모든 더미 데이터가 성공적으로 삽입되었습니다.');
    console.log('데이터베이스 설정이 완료되었습니다!');
    
    // 데이터베이스 연결 종료
    db.close((err) => {
        if (err) {
            console.error('데이터베이스 연결 종료 오류:', err.message);
        } else {
            console.log('SQLite 데이터베이스 연결이 종료되었습니다.');
        }
    });
}

// 데이터베이스 설정 실행
setupDatabase();

module.exports = { setupDatabase };