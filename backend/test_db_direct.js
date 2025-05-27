const { Pool } = require('pg');

// 데이터베이스 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://my_project_db_4s88_user:nEGnv1mzRKqSn8eG9HTxzlv9u53s9bto@dpg-d0mm2vmuk2gs73fp6ld0-a.oregon-postgres.render.com/my_project_db_4s88',
  ssl: { rejectUnauthorized: false }
});

async function testDatabase() {
  try {
    console.log('🔍 데이터베이스 테스트 시작...\n');
    
    // 1. 연결 테스트
    console.log('1️⃣ 데이터베이스 연결 테스트...');
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ 연결 성공:', result.rows[0].current_time);
    console.log('   버전:', result.rows[0].version.substring(0, 50) + '...\n');
    
    // 2. 테이블 목록 확인
    console.log('2️⃣ 테이블 목록 확인...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ 테이블이 없습니다. 데이터베이스 초기화가 필요합니다.');
      return;
    }
    
    console.log(`✅ 테이블 개수: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    console.log('');
    
    // 3. users 테이블 확인
    console.log('3️⃣ users 테이블 데이터 확인...');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ users 테이블 레코드 수: ${usersResult.rows[0].count}`);
    
    if (parseInt(usersResult.rows[0].count) === 0) {
      console.log('❌ users 테이블에 데이터가 없습니다.');
      return;
    }
    
    // 4. admin 사용자 확인
    console.log('4️⃣ admin 사용자 확인...');
    const adminResult = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = $1 AND u.status = 'active'
    `, ['admin']);
    
    if (adminResult.rows.length === 0) {
      console.log('❌ admin 사용자를 찾을 수 없습니다.');
    } else {
      console.log('✅ admin 사용자 발견:');
      const admin = adminResult.rows[0];
      console.log(`   - ID: ${admin.id}`);
      console.log(`   - Username: ${admin.username}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Role: ${admin.role_name || 'N/A'}`);
      console.log(`   - Password Hash: ${admin.password_hash}`);
      console.log(`   - Status: ${admin.status}`);
    }
    console.log('');
    
    // 5. 로그인 테스트 (쿼리만)
    console.log('5️⃣ 로그인 쿼리 테스트...');
    const loginResult = await pool.query(`
      SELECT u.*, r.name as role_name 
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = $1 AND u.password_hash = $2 AND u.status = 'active'
    `, ['admin', 'admin123']);
    
    if (loginResult.rows.length === 0) {
      console.log('❌ admin/admin123 로그인 실패');
    } else {
      console.log('✅ admin/admin123 로그인 성공');
      console.log(`   - 사용자 ID: ${loginResult.rows[0].id}`);
      console.log(`   - Role: ${loginResult.rows[0].role_name || 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ 데이터베이스 테스트 오류:', error.message);
    console.error('   상세:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();
