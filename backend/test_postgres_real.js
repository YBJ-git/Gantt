/**
 * PostgreSQL 실제 연결 테스트 스크립트
 * Render PostgreSQL 데이터베이스에 직접 연결하여 테스트
 */
require('dotenv').config();
const { Pool } = require('pg');

console.log('=== PostgreSQL 연결 테스트 시작 ===');
console.log('DATABASE_URL 존재:', !!process.env.DATABASE_URL);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);

// PostgreSQL 연결 설정
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    let client;
    
    try {
        console.log('\n🔗 데이터베이스 연결 시도...');
        client = await pool.connect();
        console.log('✅ PostgreSQL 연결 성공!');
        
        // 1. 기본 연결 테스트
        console.log('\n📅 현재 시간 조회...');
        const timeResult = await client.query('SELECT NOW() as current_time, VERSION() as version');
        console.log('현재 시간:', timeResult.rows[0].current_time);
        console.log('PostgreSQL 버전:', timeResult.rows[0].version);
        
        // 2. 데이터베이스 정보 확인
        console.log('\n🗄️ 데이터베이스 정보 확인...');
        const dbInfo = await client.query('SELECT current_database(), current_user, inet_server_addr(), inet_server_port()');
        console.log('현재 데이터베이스:', dbInfo.rows[0].current_database);
        console.log('현재 사용자:', dbInfo.rows[0].current_user);
        console.log('서버 주소:', dbInfo.rows[0].inet_server_addr);
        console.log('서버 포트:', dbInfo.rows[0].inet_server_port);
        
        // 3. 기존 테이블 확인
        console.log('\n📋 기존 테이블 목록 확인...');
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        if (tables.rows.length > 0) {
            console.log('기존 테이블들:');
            tables.rows.forEach(row => {
                console.log(`  - ${row.table_name}`);
            });
        } else {
            console.log('기존 테이블이 없습니다.');
        }
        
        // 4. ENUM 타입 확인
        console.log('\n🏷️ 기존 ENUM 타입 확인...');
        const enums = await client.query(`
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e'
            ORDER BY typname
        `);
        
        if (enums.rows.length > 0) {
            console.log('기존 ENUM 타입들:');
            enums.rows.forEach(row => {
                console.log(`  - ${row.typname}`);
            });
        } else {
            console.log('기존 ENUM 타입이 없습니다.');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ PostgreSQL 연결 실패:', error.message);
        console.error('오류 코드:', error.code);
        console.error('오류 상세:', error.detail || 'N/A');
        return false;
        
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function createTablesAndData() {
    let client;
    
    try {
        console.log('\n🛠️ 테이블 및 데이터 생성 시작...');
        client = await pool.connect();
        
        // 트랜잭션 시작
        await client.query('BEGIN');
        
        // 1. ENUM 타입 생성 (존재하지 않는 경우만)
        console.log('📝 ENUM 타입 생성...');
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
                    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'worker', 'user');
                END IF;
            END $$;
        `);
        
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
                    CREATE TYPE user_status AS ENUM ('active', 'inactive');
                END IF;
            END $$;
        `);
        console.log('✅ ENUM 타입 생성 완료');
        
        // 2. users 테이블 생성
        console.log('🏗️ users 테이블 생성...');
        await client.query(`
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
        console.log('✅ users 테이블 생성 완료');
        
        // 3. 트리거 함수 생성
        console.log('⚡ 트리거 함수 생성...');
        await client.query(`
            CREATE OR REPLACE FUNCTION update_user_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        
        // 4. 트리거 생성
        await client.query(`
            DROP TRIGGER IF EXISTS users_update_timestamp ON users;
            CREATE TRIGGER users_update_timestamp
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_user_timestamp();
        `);
        console.log('✅ 트리거 생성 완료');
        
        // 5. 기존 사용자 수 확인
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        const count = parseInt(userCount.rows[0].count);
        console.log(`👥 기존 사용자 수: ${count}명`);
        
        // 6. 초기 사용자 데이터 생성 (없는 경우만)
        if (count === 0) {
            console.log('👤 초기 사용자 데이터 생성...');
            
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
                await client.query(`
                    INSERT INTO users (username, email, password, first_name, last_name, role, status)
                    VALUES ($1, $2, $3, $4, $5, $6, 'active')
                `, [user.username, user.email, user.password, user.first_name, user.last_name, user.role]);
                
                console.log(`  ✅ ${user.username} (${user.role}) 생성 완료`);
            }
        } else {
            console.log('기존 사용자가 있으므로 초기 데이터 생성을 건너뜀');
        }
        
        // 7. 생성된 사용자 목록 확인
        console.log('\n👥 현재 사용자 목록:');
        const allUsers = await client.query('SELECT id, username, email, role, status, created_at FROM users ORDER BY id');
        allUsers.rows.forEach(user => {
            console.log(`  ID: ${user.id}, Username: ${user.username}, Role: ${user.role}, Status: ${user.status}`);
        });
        
        // 트랜잭션 커밋
        await client.query('COMMIT');
        console.log('\n✅ 모든 작업이 성공적으로 완료되었습니다!');
        
        return true;
        
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('❌ 테이블/데이터 생성 실패:', error.message);
        console.error('오류 상세:', error.detail || 'N/A');
        return false;
        
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function testLogin() {
    let client;
    
    try {
        console.log('\n🔐 로그인 테스트 시작...');
        client = await pool.connect();
        
        // admin 사용자 조회
        const result = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ admin 사용자 찾음:');
            console.log(`  ID: ${user.id}`);
            console.log(`  Username: ${user.username}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Role: ${user.role}`);
            console.log(`  Status: ${user.status}`);
            console.log(`  Created: ${user.created_at}`);
            
            // 비밀번호 해시 확인
            const bcrypt = require('bcrypt');
            const isValidPassword = await bcrypt.compare('admin123', user.password);
            console.log(`  비밀번호 'admin123' 검증: ${isValidPassword ? '✅ 성공' : '❌ 실패'}`);
            
            return true;
        } else {
            console.log('❌ admin 사용자를 찾을 수 없습니다');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 로그인 테스트 실패:', error.message);
        return false;
        
    } finally {
        if (client) {
            client.release();
        }
    }
}

async function main() {
    console.log('🚀 PostgreSQL 종합 테스트 시작\n');
    
    // 1. 연결 테스트
    const connectionOk = await testConnection();
    if (!connectionOk) {
        console.log('\n❌ 연결 실패로 테스트 중단');
        process.exit(1);
    }
    
    // 2. 테이블 및 데이터 생성
    const creationOk = await createTablesAndData();
    if (!creationOk) {
        console.log('\n❌ 테이블/데이터 생성 실패');
        process.exit(1);
    }
    
    // 3. 로그인 테스트
    const loginOk = await testLogin();
    if (!loginOk) {
        console.log('\n❌ 로그인 테스트 실패');
        process.exit(1);
    }
    
    console.log('\n🎉 모든 테스트가 성공적으로 완료되었습니다!');
    console.log('이제 admin/admin123으로 로그인할 수 있습니다.');
    
    await pool.end();
    process.exit(0);
}

// 스크립트 실행
main().catch(error => {
    console.error('❌ 치명적 오류:', error);
    process.exit(1);
});
