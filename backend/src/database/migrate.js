/**
 * 데이터베이스 마이그레이션 스크립트
 */
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * 마이그레이션 실행
 */
async function migrate() {
  logger.info('데이터베이스 마이그레이션 시작...');

  try {
    // 테이블 생성
    await createTables();
    
    // 초기 데이터 삽입
    await insertInitialData();

    logger.info('데이터베이스 마이그레이션 완료.');
  } catch (error) {
    logger.error('마이그레이션 오류:', error);
    process.exit(1);
  }
}

/**
 * 테이블 생성
 */
async function createTables() {
  logger.info('테이블 생성 중...');

  // 사용자 테이블 - 상태를 위한 enum 도메인 생성
  await db.execute(`CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'manager', 'user')`);

  // 사용자 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      role user_role NOT NULL DEFAULT 'user',
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 프로젝트 상태 enum 생성
  await db.execute(`CREATE TYPE IF NOT EXISTS project_status AS ENUM ('planning', 'active', 'completed', 'on_hold')`);

  // 프로젝트 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status project_status NOT NULL DEFAULT 'planning',
      owner_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // 팀 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 리소스 타입 enum 생성
  await db.execute(`CREATE TYPE IF NOT EXISTS resource_type AS ENUM ('human', 'equipment', 'facility')`);

  // 리소스 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      resource_type resource_type NOT NULL DEFAULT 'human',
      capacity DECIMAL(5,2) DEFAULT 1.00,
      team_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);

  // 작업 상태 enum 생성
  await db.execute(`CREATE TYPE IF NOT EXISTS task_status AS ENUM ('not_started', 'in_progress', 'completed', 'delayed')`);
  
  // 작업 우선순위 enum 생성
  await db.execute(`CREATE TYPE IF NOT EXISTS task_priority AS ENUM ('low', 'medium', 'high', 'urgent')`);

  // 작업 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      duration INT NOT NULL, 
      progress DECIMAL(5,2) DEFAULT 0.00,
      status task_status NOT NULL DEFAULT 'not_started',
      priority task_priority NOT NULL DEFAULT 'medium',
      project_id INT NOT NULL,
      parent_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (parent_id) REFERENCES tasks(id)
    )
  `);

  // 작업 의존성 타입 enum 생성
  await db.execute(`CREATE TYPE IF NOT EXISTS dependency_type AS ENUM ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')`);

  // 작업 의존성 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_dependencies (
      id SERIAL PRIMARY KEY,
      predecessor_id INT NOT NULL,
      successor_id INT NOT NULL,
      dependency_type dependency_type NOT NULL DEFAULT 'finish_to_start',
      lag INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (predecessor_id) REFERENCES tasks(id),
      FOREIGN KEY (successor_id) REFERENCES tasks(id),
      UNIQUE (predecessor_id, successor_id)
    )
  `);

  // 리소스 할당 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS resource_assignments (
      id SERIAL PRIMARY KEY,
      task_id INT NOT NULL,
      resource_id INT NOT NULL,
      allocation_percentage DECIMAL(5,2) DEFAULT 100.00,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id),
      FOREIGN KEY (resource_id) REFERENCES resources(id),
      UNIQUE (task_id, resource_id)
    )
  `);

  // 최적화 상태 enum 생성
  await db.execute(`CREATE TYPE IF NOT EXISTS optimization_status AS ENUM ('pending', 'completed', 'failed')`);

  // 최적화 기록 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS optimization_logs (
      id SERIAL PRIMARY KEY,
      project_id INT NOT NULL,
      user_id INT NOT NULL,
      optimization_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      parameters JSONB,
      results JSONB,
      status optimization_status NOT NULL DEFAULT 'pending',
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 작업 부하 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS workload_data (
      id SERIAL PRIMARY KEY,
      resource_id INT NOT NULL,
      date DATE NOT NULL,
      workload_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      capacity_hours DECIMAL(5,2) NOT NULL DEFAULT 8.00,
      project_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES resources(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      UNIQUE (resource_id, date)
    )
  `);

  // updated_at 업데이트를 위한 트리거 생성
  const tables = ['users', 'projects', 'teams', 'resources', 'tasks', 'task_dependencies', 'resource_assignments', 'workload_data'];
  
  for (const table of tables) {
    await db.execute(`
      CREATE OR REPLACE FUNCTION update_timestamp_column()
      RETURNS TRIGGER AS $
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $ language 'plpgsql';
    `);

    await db.execute(`
      DROP TRIGGER IF EXISTS ${table}_update_timestamp ON ${table};
      CREATE TRIGGER ${table}_update_timestamp
      BEFORE UPDATE ON ${table}
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp_column();
    `);
  }

  logger.info('테이블 생성 완료.');
}

/**
 * 초기 데이터 삽입
 */
async function insertInitialData() {
  logger.info('초기 데이터 삽입 중...');

  // 사용자 데이터 삽입
  const userExists = await db.execute('SELECT COUNT(*) as count FROM users WHERE username = $1', ['admin']);
  
  if (userExists[0].count === '0') {
    await db.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, ['admin', 'admin@example.com', '$2b$10$vfvp9h2mad7lYYkCCLLKberIQ0E7MO2c1SfIRIYVjzyxcr/9g98aa', '관리자', '사용자', 'admin']);
    
    logger.info('관리자 사용자 생성됨.');
  }

  // 팀 데이터 삽입
  const teamExists = await db.execute('SELECT COUNT(*) as count FROM teams WHERE name = $1', ['개발팀']);
  
  if (teamExists[0].count === '0') {
    // 팀 생성 및 ID 받기
    const teamResult = await db.execute(`
      INSERT INTO teams (name, description)
      VALUES ($1, $2)
      RETURNING id
    `, ['개발팀', '소프트웨어 개발 및 유지보수 팀']);
    
    const teamId = teamResult[0].id;
    
    // 리소스 데이터 삽입 - PostgreSQL에서는 다중 로우 삽입 문법이 다름
    await db.execute(`
      INSERT INTO resources (name, email, resource_type, capacity, team_id)
      VALUES
        ($1, $2, $3, $4, $5),
        ($6, $7, $8, $9, $10),
        ($11, $12, $13, $14, $15)
    `, [
      '홍길동', 'hong@example.com', 'human', 1.0, teamId,
      '김철수', 'kim@example.com', 'human', 1.0, teamId,
      '이영희', 'lee@example.com', 'human', 0.5, teamId
    ]);
    
    logger.info('기본 팀 및 리소스 생성됨.');
  }
  
  logger.info('초기 데이터 삽입 완료.');
}

// 스크립트가 직접 실행될 때 마이그레이션 실행
if (require.main === module) {
  migrate()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      logger.error('마이그레이션 오류:', error);
      process.exit(1);
    });
} else {
  module.exports = { migrate };
}
