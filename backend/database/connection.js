/**
 * PostgreSQL 데이터베이스 연결 관리 모듈
 */
const { Pool } = require('pg');

// 환경변수에서 데이터베이스 설정 가져오기
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

console.log('🔧 데이터베이스 설정:', {
  hasConnectionString: !!dbConfig.connectionString,
  ssl: dbConfig.ssl,
  environment: process.env.NODE_ENV
});

// PostgreSQL 연결 풀 생성
const pool = new Pool(dbConfig);

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 연결 오류:', err);
});

// 데이터베이스 쿼리 실행 헬퍼 함수
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 쿼리 실행:', {
      text: text.substring(0, 50) + '...',
      duration: duration + 'ms',
      rows: result.rowCount
    });
    return result;
  } catch (error) {
    console.error('❌ 쿼리 실행 오류:', {
      text: text.substring(0, 50) + '...',
      error: error.message
    });
    throw error;
  }
};

// 단일 행 조회
const queryRow = async (text, params) => {
  const result = await query(text, params);
  return result.rows[0];
};

// 여러 행 조회
const queryRows = async (text, params) => {
  const result = await query(text, params);
  return result.rows;
};

// 트랜잭션 실행
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// 데이터베이스 연결 상태 확인
const checkConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    return {
      status: 'connected',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// 데이터베이스 초기화 (스키마 생성)
const initDatabase = async () => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    console.log('🏗️ 데이터베이스 초기화 시작...');
    
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedDataPath = path.join(__dirname, 'seed_data.sql');
    
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      console.log('📄 스키마 파일 실행 중...');
      await query(schemaSQL);
      console.log('✅ 스키마 생성 완료');
    }
    
    if (fs.existsSync(seedDataPath)) {
      const seedSQL = fs.readFileSync(seedDataPath, 'utf8');
      console.log('🌱 시드 데이터 삽입 중...');
      await query(seedSQL);
      console.log('✅ 시드 데이터 삽입 완료');
    }
    
    console.log('🎉 데이터베이스 초기화 완료');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
};

// 데이터베이스 상태 정보 조회
const getStats = async () => {
  try {
    const tablesQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tables = await queryRows(tablesQuery);
    
    // 각 테이블의 레코드 수 조회
    const tableStats = await Promise.all(
      tables.map(async (table) => {
        try {
          const countResult = await query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
          return {
            name: table.table_name,
            columns: table.column_count,
            records: parseInt(countResult.rows[0].count)
          };
        } catch (error) {
          return {
            name: table.table_name,
            columns: table.column_count,
            records: 0,
            error: error.message
          };
        }
      })
    );
    
    return {
      tables: tableStats,
      totalTables: tables.length,
      totalRecords: tableStats.reduce((sum, table) => sum + (table.records || 0), 0)
    };
  } catch (error) {
    console.error('❌ 데이터베이스 상태 조회 실패:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  queryRow,
  queryRows,
  transaction,
  checkConnection,
  initDatabase,
  getStats
};
