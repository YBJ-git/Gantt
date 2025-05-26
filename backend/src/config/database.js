/**
 * Database Configuration
 * 데이터베이스 설정 (SQLite/PostgreSQL 선택 가능)
 */
const { logger } = require('../utils/logger');

// 데이터베이스 타입 설정 (환경 변수로 제어)
const DB_TYPE = process.env.DB_TYPE || 'postgres'; // 'postgres'를 기본값으로 변경

let db;

if (DB_TYPE === 'postgres') {
    // PostgreSQL 설정
    db = require('./postgres_database');
    logger.info('PostgreSQL 데이터베이스를 사용합니다.');
} else {
    // SQLite 설정 (기본값)
    db = require('./sqlite_database');
    logger.info('SQLite 데이터베이스를 사용합니다.');
}

module.exports = db;