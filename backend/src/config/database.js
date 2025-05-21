/**
 * Database Configuration
 * PostgreSQL 데이터베이스 연결 설정
 */
const { Pool } = require('pg');
const config = require('./config');
const logger = require('../utils/logger');

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  max: config.database.connectionLimit,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// 풀 에러 핸들링
pool.on('error', (err) => {
  logger.error('PostgreSQL 풀에서 예상치 못한 오류가 발생했습니다:', err);
});

// 초기 연결 테스트
(async () => {
  try {
    const client = await pool.connect();
    logger.info('PostgreSQL 데이터베이스에 연결되었습니다.');
    client.release();
  } catch (err) {
    logger.error('PostgreSQL 데이터베이스 연결 실패:', err);
  }
})();

module.exports = {
  // 쿼리 실행
  execute: async (query, params = []) => {
    try {
      const result = await pool.query(query, params);
      return [result.rows, null];
    } catch (error) {
      logger.error(`데이터베이스 쿼리 오류: ${error.message}`, { query, params });
      return [null, error];
    }
  },
  
  // 트랜잭션 시작
  beginTransaction: async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      return {
        // 트랜잭션 내 쿼리 실행
        execute: async (query, params = []) => {
          try {
            const result = await client.query(query, params);
            return [result.rows, null];
          } catch (error) {
            logger.error(`트랜잭션 쿼리 오류: ${error.message}`, { query, params });
            throw error;
          }
        },
        
        // 트랜잭션 커밋
        commit: async () => {
          await client.query('COMMIT');
          client.release();
        },
        
        // 트랜잭션 롤백
        rollback: async () => {
          await client.query('ROLLBACK');
          client.release();
        }
      };
    } catch (error) {
      client.release();
      throw error;
    }
  },
  
  // 연결 풀 가져오기
  getPool: () => pool,

  // PostgreSQL 연결 종료
  close: async () => {
    await pool.end();
  }
};