/**
 * Database Configuration
 * MySQL 데이터베이스 연결 설정
 */
const mysql = require('mysql2/promise');
const config = require('./config');
const logger = require('../utils/logger');

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  connectionLimit: config.database.connectionLimit,
  waitForConnections: config.database.waitForConnections,
  queueLimit: config.database.queueLimit,
  charset: config.database.charset
});

// 초기 연결 테스트
(async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('MySQL 데이터베이스에 연결되었습니다.');
    connection.release();
  } catch (err) {
    logger.error('MySQL 데이터베이스 연결 실패:', err);
  }
})();

module.exports = {
  // 쿼리 실행
  execute: async (query, params = []) => {
    try {
      const [rows, fields] = await pool.execute(query, params);
      return [rows, null];
    } catch (error) {
      logger.error(`데이터베이스 쿼리 오류: ${error.message}`, { query, params });
      return [null, error];
    }
  },
  
  // 트랜잭션 시작
  beginTransaction: async () => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    return {
      // 트랜잭션 내 쿼리 실행
      execute: async (query, params = []) => {
        try {
          const [rows, fields] = await connection.execute(query, params);
          return [rows, null];
        } catch (error) {
          logger.error(`트랜잭션 쿼리 오류: ${error.message}`, { query, params });
          throw error;
        }
      },
      
      // 트랜잭션 커밋
      commit: async () => {
        await connection.commit();
        connection.release();
      },
      
      // 트랜잭션 롤백
      rollback: async () => {
        await connection.rollback();
        connection.release();
      }
    };
  },
  
  // 연결 풀 가져오기
  getPool: () => pool
};