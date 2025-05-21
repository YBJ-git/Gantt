/**
 * PostgreSQL 연결 테스트 스크립트
 */
const db = require('../config/database');
const logger = require('./logger');

async function testPostgresConnection() {
  logger.info('PostgreSQL 연결 테스트 시작...');
  
  try {
    // 기본 연결 테스트
    const [rows, error] = await db.execute('SELECT NOW() as current_time');
    
    if (error) {
      logger.error('PostgreSQL 연결 테스트 실패:', error);
      return false;
    }
    
    logger.info('PostgreSQL 서버 시간:', rows[0].current_time);
    logger.info('PostgreSQL 연결 테스트 성공!');
    
    return true;
  } catch (err) {
    logger.error('PostgreSQL 연결 테스트 중 오류 발생:', err);
    return false;
  } finally {
    await db.close();
  }
}

// 스크립트가 직접 실행될 때 테스트 실행
if (require.main === module) {
  testPostgresConnection()
    .then(success => {
      if (success) {
        logger.info('PostgreSQL 연결 테스트 완료: 성공');
        process.exit(0);
      } else {
        logger.error('PostgreSQL 연결 테스트 완료: 실패');
        process.exit(1);
      }
    })
    .catch(error => {
      logger.error('PostgreSQL 연결 테스트 중 예외 발생:', error);
      process.exit(1);
    });
} else {
  module.exports = { testPostgresConnection };
}
