/**
 * 자동 데이터베이스 초기화 모듈
 * 앱 시작 시 데이터베이스를 자동으로 초기화합니다.
 */
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

class DatabaseInitializer {
    constructor(dbConnection) {
        this.db = dbConnection;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            logger.info('데이터베이스가 이미 초기화되었습니다.');
            return;
        }

        try {
            logger.info('=== 데이터베이스 자동 초기화 시작 ===');

            // 데이터베이스 연결 테스트
            await this.testConnection();

            // 테이블 존재 여부 확인
            const tablesExist = await this.checkTablesExist();
            
            if (!tablesExist) {
                logger.info('테이블이 존재하지 않습니다. 스키마를 생성합니다.');
                await this.createSchema();
            } else {
                logger.info('테이블이 이미 존재합니다.');
            }

            // 사용자 데이터 확인 및 생성
            await this.ensureInitialData();

            this.initialized = true;
            logger.info('=== 데이터베이스 자동 초기화 완료 ===');

        } catch (error) {
            logger.error('데이터베이스 초기화 실패:', error);
            // 초기화 실패해도 앱이 종료되지 않도록 함
        }
    }

    async testConnection() {
        try {
            const result = await this.db.execute('SELECT NOW() as current_time');
            logger.info('✓ 데이터베이스 연결 성공:', result[0]?.current_time);
        } catch (error) {
            throw new Error(`데이터베이스 연결 실패: ${error.message}`);
        }
    }

    async checkTablesExist() {
        try {
            const result = await this.db.execute(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'users'
                ) as table_exists
            `);
            return result[0]?.table_exists || false;
        } catch (error) {
            logger.error('테이블 존재 여부 확인 실패:', error);
            return false;
        }
    }

    async createSchema() {
        try {
            // ENUM 타입 생성 (이미 존재할 수 있으므로 IF NOT EXISTS 사용)
            await this.executeSQL("DO $$ BEGIN CREATE TYPE user_role AS ENUM ('admin', 'manager', 'worker', 'user'); EXCEPTION WHEN duplicate_object THEN null; END $$;");
            await this.executeSQL("DO $$ BEGIN CREATE TYPE user_status AS ENUM ('active', 'inactive'); EXCEPTION WHEN duplicate_object THEN null; END $$;");

            // 사용자 테이블 생성
            await this.executeSQL(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    password VARCHAR(100) NOT NULL,
                    first_name VARCHAR(50),
                    last_name VARCHAR(50),
                    role user_role NOT NULL DEFAULT 'user',
                    status user_status NOT NULL DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 트리거 함수 생성
            await this.executeSQL(`
                CREATE OR REPLACE FUNCTION update_user_timestamp()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ language 'plpgsql'
            `);

            // 트리거 생성
            await this.executeSQL(`
                DROP TRIGGER IF EXISTS users_update_timestamp ON users;
                CREATE TRIGGER users_update_timestamp
                BEFORE UPDATE ON users
                FOR EACH ROW
                EXECUTE FUNCTION update_user_timestamp()
            `);

            logger.info('✓ 스키마 생성 완료');
        } catch (error) {
            throw new Error(`스키마 생성 실패: ${error.message}`);
        }
    }

    async ensureInitialData() {
        try {
            // 기존 사용자 수 확인
            const userCount = await this.db.execute('SELECT COUNT(*) as count FROM users');
            const count = parseInt(userCount[0]?.count || 0);

            if (count === 0) {
                logger.info('초기 사용자 데이터를 생성합니다.');
                await this.createInitialUsers();
            } else {
                logger.info(`기존 사용자 ${count}명이 존재합니다.`);
                await this.ensureAdminUser();
            }
        } catch (error) {
            throw new Error(`초기 데이터 확인 실패: ${error.message}`);
        }
    }

    async createInitialUsers() {
        const users = [
            {
                username: 'admin',
                email: 'admin@example.com',
                password: '$2b$10$oEJ6Cwpro6.6ij465/3RIultToY5AVuLCKlolbjrcgLCQZ78f2qNy', // admin123
                first_name: '관리자',
                last_name: '계정',
                role: 'admin'
            },
            {
                username: 'tester',
                email: 'tester@example.com',
                password: '$2b$10$n7CzYtGgXFttL5CvTgJ0h.ZZ1x78HvzBB2hgz/XBGZv.z8MnIpyJO', // Test123
                first_name: '테스터',
                last_name: '계정',
                role: 'user'
            },
            {
                username: 'manager',
                email: 'manager@example.com',
                password: '$2b$10$K4HH21iW/FIcWJcLGt2wkuULmhgU2yhJAhXZPXun1F.W6jrMn6DQe', // Manager123
                first_name: '매니저',
                last_name: '계정',
                role: 'manager'
            },
            {
                username: 'worker',
                email: 'worker@example.com',
                password: '$2b$10$RXQJw97tKh2KQTlvGS11pOWxIcJ3LttLq3XlZDv17JZhmOTGZMmbi', // Worker123
                first_name: '작업자',
                last_name: '계정',
                role: 'worker'
            }
        ];

        for (const user of users) {
            await this.executeSQL(`
                INSERT INTO users (username, email, password, first_name, last_name, role, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'active')
            `, [user.username, user.email, user.password, user.first_name, user.last_name, user.role]);
            
            logger.info(`✓ 사용자 생성: ${user.username} (${user.role})`);
        }
    }

    async ensureAdminUser() {
        try {
            const adminUser = await this.db.execute('SELECT * FROM users WHERE username = $1', ['admin']);
            
            if (adminUser.length === 0) {
                logger.info('admin 사용자가 없습니다. 생성합니다.');
                await this.executeSQL(`
                    INSERT INTO users (username, email, password, first_name, last_name, role, status)
                    VALUES ($1, $2, $3, $4, $5, $6, 'active')
                `, ['admin', 'admin@example.com', '$2b$10$oEJ6Cwpro6.6ij465/3RIultToY5AVuLCKlolbjrcgLCQZ78f2qNy', '관리자', '계정', 'admin']);
                logger.info('✓ admin 사용자 생성 완료');
            } else {
                logger.info('✓ admin 사용자 존재 확인');
            }
        } catch (error) {
            logger.error('admin 사용자 확인 실패:', error);
        }
    }

    async executeSQL(query, params = []) {
        try {
            return await this.db.execute(query, params);
        } catch (error) {
            logger.error(`SQL 실행 오류: ${error.message}`);
            logger.error(`Query: ${query.substring(0, 100)}...`);
            throw error;
        }
    }
}

module.exports = DatabaseInitializer;
