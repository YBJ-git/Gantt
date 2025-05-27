const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://my_project_db_4s88_user:nEGnv1mzRKqSn8eG9HTxzlv9u53s9bto@dpg-d0mm2vmuk2gs73fp6ld0-a.oregon-postgres.render.com/my_project_db_4s88',
  ssl: { rejectUnauthorized: false }
});

async function quickTest() {
  try {
    // admin 사용자 확인
    const result = await pool.query(`
      SELECT * FROM users WHERE username = 'admin'
    `);
    
    console.log('Admin user:', result.rows[0]);
    
    // 로그인 테스트
    const loginTest = await pool.query(`
      SELECT * FROM users WHERE username = 'admin' AND password_hash = 'admin123'
    `);
    
    console.log('Login test result:', loginTest.rows.length > 0 ? 'SUCCESS' : 'FAILED');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

quickTest();
