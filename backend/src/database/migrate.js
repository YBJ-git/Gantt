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

  // 사용자 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 프로젝트 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status ENUM('planning', 'active', 'completed', 'on_hold') NOT NULL DEFAULT 'planning',
      owner_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);

  // 팀 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 리소스 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS resources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      resource_type ENUM('human', 'equipment', 'facility') NOT NULL DEFAULT 'human',
      capacity DECIMAL(5,2) DEFAULT 1.00,
      team_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    )
  `);

  // 작업 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      duration INT NOT NULL, 
      progress DECIMAL(5,2) DEFAULT 0.00,
      status ENUM('not_started', 'in_progress', 'completed', 'delayed') NOT NULL DEFAULT 'not_started',
      priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
      project_id INT NOT NULL,
      parent_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (parent_id) REFERENCES tasks(id)
    )
  `);

  // 작업 의존성 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS task_dependencies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      predecessor_id INT NOT NULL,
      successor_id INT NOT NULL,
      dependency_type ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish') NOT NULL DEFAULT 'finish_to_start',
      lag INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (predecessor_id) REFERENCES tasks(id),
      FOREIGN KEY (successor_id) REFERENCES tasks(id),
      UNIQUE KEY (predecessor_id, successor_id)
    )
  `);

  // 리소스 할당 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS resource_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      resource_id INT NOT NULL,
      allocation_percentage DECIMAL(5,2) DEFAULT 100.00,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id),
      FOREIGN KEY (resource_id) REFERENCES resources(id),
      UNIQUE KEY (task_id, resource_id)
    )
  `);

  // 최적화 기록 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS optimization_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      user_id INT NOT NULL,
      optimization_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      parameters JSON,
      results JSON,
      status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 작업 부하 테이블
  await db.execute(`
    CREATE TABLE IF NOT EXISTS workload_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      resource_id INT NOT NULL,
      date DATE NOT NULL,
      workload_hours DECIMAL(5,2) NOT NULL DEFAULT 0.00,
      capacity_hours DECIMAL(5,2) NOT NULL DEFAULT 8.00,
      project_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (resource_id) REFERENCES resources(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      UNIQUE KEY (resource_id, date)
    )
  `);

  logger.info('테이블 생성 완료.');
}

/**
 * 초기 데이터 삽입
 */
async function insertInitialData() {
  logger.info('초기 데이터 삽입 중...');

  // 사용자 데이터 삽입
  const [userExists] = await db.execute('SELECT COUNT(*) as count FROM users WHERE username = ?', ['admin']);
  
  if (userExists[0].count === 0) {
    await db.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['admin', 'admin@example.com', '$2b$10$xqSRxmHZxJT6Aq5eUxj4MeMVfuW9z5nzq64CcK9bN57Hx07V3bhFS', '관리자', '사용자', 'admin']);
    
    logger.info('관리자 사용자 생성됨.');
  }

  // 팀 데이터 삽입
  const [teamExists] = await db.execute('SELECT COUNT(*) as count FROM teams WHERE name = ?', ['개발팀']);
  
  if (teamExists[0].count === 0) {
    const [result] = await db.execute(`
      INSERT INTO teams (name, description)
      VALUES (?, ?)
    `, ['개발팀', '소프트웨어 개발 및 유지보수 팀']);
    
    const teamId = result.insertId;
    
    // 리소스 데이터 삽입
    await db.execute(`
      INSERT INTO resources (name, email, resource_type, capacity, team_id)
      VALUES
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
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
