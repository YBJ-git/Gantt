/**
 * PostgreSQL Database Configuration
 * PostgreSQL 데이터베이스 연결 설정
 */
const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// PostgreSQL 연결 설정
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DB || 'myproject_db',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    max: 20, // 최대 연결 수
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// 연결 테스트
pool.connect((err, client, release) => {
    if (err) {
        logger.error('PostgreSQL 데이터베이스 연결 오류:', err.message);
    } else {
        logger.info('PostgreSQL 데이터베이스에 연결되었습니다.');
        release();
    }
});

module.exports = {
    // 쿼리 실행 (Promise 기반)
    execute: async (query, params = []) => {
        try {
            const result = await pool.query(query, params);
            
            // SELECT 쿼리인 경우
            if (query.trim().toLowerCase().startsWith('select')) {
                return result.rows;
            } else {
                // INSERT, UPDATE, DELETE 쿼리
                return {
                    id: result.rows[0]?.id || null,
                    changes: result.rowCount
                };
            }
        } catch (err) {
            logger.error(`데이터베이스 쿼리 오류: ${err.message}`, { query, params });
            throw err;
        }
    },

    // 단일 행 조회
    get: async (query, params = []) => {
        try {
            const result = await pool.query(query, params);
            return result.rows[0] || null;
        } catch (err) {
            logger.error(`데이터베이스 조회 오류: ${err.message}`, { query, params });
            throw err;
        }
    },

    // 모든 행 조회
    all: async (query, params = []) => {
        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (err) {
            logger.error(`데이터베이스 조회 오류: ${err.message}`, { query, params });
            throw err;
        }
    },

    // 트랜잭션 시작
    beginTransaction: async () => {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            return {
                execute: async (query, params = []) => {
                    const result = await client.query(query, params);
                    return {
                        id: result.rows[0]?.id || null,
                        changes: result.rowCount
                    };
                },
                commit: async () => {
                    await client.query('COMMIT');
                    client.release();
                },
                rollback: async () => {
                    await client.query('ROLLBACK');
                    client.release();
                }
            };
        } catch (err) {
            client.release();
            throw err;
        }
    },

    // 데이터베이스 연결 종료
    close: async () => {
        try {
            await pool.end();
            logger.info('PostgreSQL 데이터베이스 연결이 종료되었습니다.');
        } catch (err) {
            logger.error('데이터베이스 연결 종료 오류:', err.message);
            throw err;
        }
    },

    // 원본 Pool 객체 (필요시 사용)
    getPool: () => pool
};