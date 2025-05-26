/**
 * PostgreSQL Database Configuration
 * PostgreSQL 데이터베이스 연결 설정
 */
const { Pool } = require('pg');
const { logger } = require('../utils/logger');

// PostgreSQL 연결 설정
let poolConfig;

if (process.env.DATABASE_URL) {
    // Render에서 제공하는 DATABASE_URL 사용 (우선순위)
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };
} else {
    // 개별 환경변수 사용 (폴백)
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'myproject_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };
}

const pool = new Pool(poolConfig);

// 연결 테스트
pool.connect((err, client, release) => {
    if (err) {
        logger.error('PostgreSQL 데이터베이스 연결 오류:', err.message);
        console.error('=== PostgreSQL 연결 실패 상세 정보 ===');
        console.error('DATABASE_URL 존재:', !!process.env.DATABASE_URL);
        console.error('DB_HOST:', process.env.DB_HOST);
        console.error('DB_NAME:', process.env.DB_NAME);
        console.error('DB_USER:', process.env.DB_USER);
        console.error('Error:', err.message);
        console.error('Code:', err.code);
    } else {
        logger.info('PostgreSQL 데이터베이스에 연결되었습니다.');
        console.log('=== PostgreSQL 연결 성공 ===');
        console.log('DATABASE_URL 사용:', !!process.env.DATABASE_URL);
        if (!process.env.DATABASE_URL) {
            console.log('개별 환경변수 사용 - Host:', process.env.DB_HOST);
        }
        release();
    }
});

module.exports = {
    // 쿼리 실행 (Promise 기반)
    execute: async (query, params = []) => {
        try {
            const result = await pool.query(query, params);
            
            // SELECT 쿼리인 경우 - 행 배열 반환
            if (query.trim().toLowerCase().startsWith('select')) {
                return result.rows;
            } 
            // RETURNING 절이 있는 INSERT/UPDATE 쿼리인 경우
            else if (query.toLowerCase().includes('returning')) {
                return result.rows;
            }
            // 일반적인 INSERT, UPDATE, DELETE 쿼리
            else {
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