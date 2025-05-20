/**
 * 테스트 데이터베이스 설정 스크립트
 * 
 * 이 스크립트는 테스트 환경에서 사용할 MSSQL 데이터베이스를 설정합니다.
 * GitHub Actions 등의 CI/CD 환경에서 자동으로 실행됩니다.
 */

const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || 'localhost',
  database: 'master',
  options: {
    enableArithAbort: true,
    trustServerCertificate: true
  }
};

const TEST_DB_NAME = 'WorkloadOptimizationTest';

async function setupTestDatabase() {
  try {
    // 기본 DB에 연결
    let pool = await sql.connect(config);
    
    console.log('데이터베이스 서버에 연결되었습니다.');
    
    // 테스트 DB가 존재하는지 확인하고 없으면 생성
    const result = await pool.request()
      .query(`
        IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${TEST_DB_NAME}')
        BEGIN
          CREATE DATABASE ${TEST_DB_NAME};
        END
      `);
    
    console.log(`테스트 데이터베이스 '${TEST_DB_NAME}' 확인/생성 완료`);
    
    // 테스트 DB에 연결
    await pool.close();
    
    const testConfig = {
      ...config,
      database: TEST_DB_NAME
    };
    
    pool = await sql.connect(testConfig);
    
    console.log(`테스트 데이터베이스 '${TEST_DB_NAME}'에 연결되었습니다.`);
    
    // 테이블 생성
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tasks')
      BEGIN
        CREATE TABLE Tasks (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL,
          description NVARCHAR(500),
          startDate DATETIME NOT NULL,
          endDate DATETIME NOT NULL,
          status NVARCHAR(50) NOT NULL,
          priority NVARCHAR(50) NOT NULL,
          assignedTo INT,
          completed INT DEFAULT 0,
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME DEFAULT GETDATE()
        );
      END
    `);
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Resources')
      BEGIN
        CREATE TABLE Resources (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(100) NOT NULL,
          capacity INT NOT NULL,
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME DEFAULT GETDATE()
        );
      END
    `);
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TaskDependencies')
      BEGIN
        CREATE TABLE TaskDependencies (
          id INT IDENTITY(1,1) PRIMARY KEY,
          taskId INT NOT NULL,
          dependsOnTaskId INT NOT NULL,
          createdAt DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (taskId) REFERENCES Tasks(id),
          FOREIGN KEY (dependsOnTaskId) REFERENCES Tasks(id)
        );
      END
    `);
    
    console.log('테이블 생성 완료');
    
    // 테스트 데이터 생성
    await pool.request().query(`
      IF NOT EXISTS (SELECT TOP 1 * FROM Resources)
      BEGIN
        INSERT INTO Resources (name, capacity)
        VALUES 
          ('개발팀', 100),
          ('DBA팀', 80),
          ('디자인팀', 90);
      END
    `);
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT TOP 1 * FROM Tasks)
      BEGIN
        INSERT INTO Tasks (name, description, startDate, endDate, status, priority, assignedTo, completed)
        VALUES 
          ('웹사이트 리디자인', '회사 웹사이트 메인 페이지 디자인 개선', '2025-05-10', '2025-05-20', '진행중', '높음', 1, 30),
          ('데이터베이스 최적화', '쿼리 성능 개선 및 인덱스 추가', '2025-05-15', '2025-05-25', '대기중', '중간', 2, 0),
          ('모바일 앱 업데이트', '새로운 기능 추가 및 버그 수정', '2025-05-18', '2025-06-01', '대기중', '높음', 3, 0);
      END
    `);
    
    console.log('테스트 데이터 생성 완료');
    
    // 저장 프로시저 생성
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'OptimizeWorkload')
      BEGIN
        EXEC('
          CREATE PROCEDURE OptimizeWorkload
          AS
          BEGIN
            -- 간단한 부하 최적화 로직
            UPDATE Tasks
            SET assignedTo = (
              SELECT TOP 1 r.id
              FROM Resources r
              LEFT JOIN (
                SELECT assignedTo, COUNT(*) as taskCount
                FROM Tasks
                GROUP BY assignedTo
              ) t ON r.id = t.assignedTo
              ORDER BY ISNULL(t.taskCount, 0), r.capacity DESC
            )
            WHERE status = ''대기중''
          END
        ');
      END
    `);
    
    console.log('저장 프로시저 생성 완료');
    
    await pool.close();
    console.log('테스트 데이터베이스 설정이 완료되었습니다.');
    
  } catch (err) {
    console.error('데이터베이스 설정 중 오류가 발생했습니다:', err);
    process.exit(1);
  }
}

setupTestDatabase();
