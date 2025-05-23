const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

// PostgreSQL 연결 설정 (기본 postgres 데이터베이스에 연결)
const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    database: 'postgres', // 기본 데이터베이스에 연결
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres'
});

async function createDatabase() {
    const client = await pool.connect();
    
    try {
        // 데이터베이스가 이미 존재하는지 확인
        const checkDbQuery = `
            SELECT 1 FROM pg_database WHERE datname = 'myproject_db'
        `;
        
        const result = await client.query(checkDbQuery);
        
        if (result.rows.length === 0) {
            // 데이터베이스 생성
            await client.query('CREATE DATABASE myproject_db');
            console.log('데이터베이스 myproject_db가 생성되었습니다.');
        } else {
            console.log('데이터베이스 myproject_db가 이미 존재합니다.');
        }
        
    } catch (err) {
        console.error('데이터베이스 생성 오류:', err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

// 데이터베이스 생성 실행
createDatabase()
    .then(() => {
        console.log('이제 "node postgres_database_setup.js"를 실행하여 테이블과 데이터를 생성하세요.');
    })
    .catch(console.error);