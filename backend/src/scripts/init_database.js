/**
 * 데이터베이스 초기화 스크립트
 * PostgreSQL 데이터베이스에 테이블과 초기 데이터를 생성합니다.
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 환경변수 로드
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('=== 데이터베이스 초기화 시작 ===');
        
        // 스키마 파일 읽기
        const schemaPath = path.join(__dirname, '../database/schemas/userSchema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // SQL 문을 개별적으로 실행
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        for (const statement of statements) {
            try {
                if (statement.toLowerCase().includes('create type')) {
                    // ENUM 타입이 이미 존재할 수 있으므로 에러 무시
                    await client.query(statement);
                    console.log('✓ ENUM 타입 생성 완료');
                } else if (statement.toLowerCase().includes('create table')) {
                    await client.query(statement);
                    console.log('✓ 테이블 생성 완료');
                } else if (statement.toLowerCase().includes('create or replace function')) {
                    await client.query(statement);
                    console.log('✓ 함수 생성 완료');
                } else if (statement.toLowerCase().includes('create trigger')) {
                    await client.query(statement);
                    console.log('✓ 트리거 생성 완료');
                } else if (statement.toLowerCase().includes('insert into')) {
                    await client.query(statement);
                    console.log('✓ 초기 데이터 삽입 완료');
                }
            } catch (error) {
                if (error.code === '42P07') {
                    console.log('⚠️ 테이블이 이미 존재합니다:', error.message);
                } else if (error.code === '42710') {
                    console.log('⚠️ 타입이 이미 존재합니다:', error.message);
                } else if (error.code === '23505') {
                    console.log('⚠️ 데이터가 이미 존재합니다:', error.message);
                } else {
                    console.error('SQL 실행 오류:', error.message);
                    console.error('Statement:', statement.substring(0, 100) + '...');
                }
            }
        }
        
        // 사용자 데이터 확인
        const userCount = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`✓ 총 사용자 수: ${userCount.rows[0].count}`);
        
        // admin 계정 확인
        const adminUser = await client.query('SELECT username, role FROM users WHERE username = $1', ['admin']);
        if (adminUser.rows.length > 0) {
            console.log('✓ admin 계정 확인:', adminUser.rows[0]);
        } else {
            console.log('❌ admin 계정이 없습니다!');
        }
        
        console.log('=== 데이터베이스 초기화 완료 ===');
        
    } catch (error) {
        console.error('데이터베이스 초기화 오류:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// 직접 실행시에만 초기화 수행
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('초기화가 성공적으로 완료되었습니다.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('초기화 실패:', error);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };
