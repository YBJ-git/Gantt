/**
 * 최소한의 Express 서버 - 의존성 최소화
 */
const express = require('express');
const cors = require('cors');

const app = express();

// 기본 미들웨어
app.use(express.json());
app.use(cors({
  origin: ['https://tubular-vacherin-352fde.netlify.app', 'http://localhost:3000'],
  credentials: true
}));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: '간트 차트 시스템 백엔드 실행 중',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date()
  });
});

// API 기본 상태
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'API 정상 작동',
    timestamp: new Date(),
    endpoints: [
      'GET /',
      'GET /health', 
      'GET /api/status',
      'POST /api/users/login'
    ]
  });
});

// 간단한 헬스체크 API
app.get('/api/health/system', (req, res) => {
  res.json({
    status: 'healthy',
    server: {
      status: 'running',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version
    },
    environment: {
      node_env: process.env.NODE_ENV || 'production',
      database_url_exists: !!process.env.DATABASE_URL,
      port: process.env.PORT || 3000
    },
    database: {
      status: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      note: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is missing'
    }
  });
});

// 간단한 DB 상태 확인
app.get('/api/health/database', (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      status: 'Database connection failed',
      error: 'DATABASE_URL environment variable is not set',
      environment: {
        database_url_exists: false,
        node_env: process.env.NODE_ENV || 'production'
      }
    });
  }
  
  res.json({
    status: 'Database URL configured',
    environment: {
      database_url_exists: true,
      node_env: process.env.NODE_ENV || 'production'
    },
    note: 'DATABASE_URL is set but connection not tested in this minimal version'
  });
});

// 로그인 엔드포인트 (간단 버전)
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('로그인 시도:', { username, timestamp: new Date() });
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '사용자명과 비밀번호를 입력해주세요.'
      });
    }
    
    // 간단한 하드코딩된 인증 (실제 DB 연결 없이)
    const users = {
      'admin': { password: 'admin123', role: 'admin', email: 'admin@example.com' },
      'tester': { password: 'Test123', role: 'user', email: 'tester@example.com' },
      'manager': { password: 'Manager123', role: 'manager', email: 'manager@example.com' },
      'worker': { password: 'Worker123', role: 'worker', email: 'worker@example.com' }
    };
    
    const user = users[username];
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    }
    
    // 간단한 토큰 생성 (실제 JWT 없이)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    console.log('로그인 성공:', { username, role: user.role });
    
    res.json({
      success: true,
      message: '로그인 성공',
      token: token,
      user: {
        id: 1,
        username: username,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

// 사용자 정보 조회 (간단 버전)
app.get('/api/users/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }
  
  res.json({
    success: true,
    user: {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      firstName: '관리자',
      lastName: '계정',
      role: 'admin',
      createdAt: new Date()
    }
  });
});

// 모든 사용자 조회 (간단 버전)
app.get('/api/users', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }
  
  res.json({
    success: true,
    count: 4,
    users: [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active' },
      { id: 2, username: 'tester', email: 'tester@example.com', role: 'user', status: 'active' },
      { id: 3, username: 'manager', email: 'manager@example.com', role: 'manager', status: 'active' },
      { id: 4, username: 'worker', email: 'worker@example.com', role: 'worker', status: 'active' }
    ]
  });
});

// 에러 로깅
app.post('/api/log-error', (req, res) => {
  console.error('프론트엔드 오류:', req.body);
  res.json({ success: true, message: 'Error logged' });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`,
    timestamp: new Date(),
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/status',
      'GET /api/health/system',
      'GET /api/health/database',
      'POST /api/users/login',
      'GET /api/users/me',
      'GET /api/users'
    ]
  });
});

// 글로벌 에러 처리
app.use((error, req, res, next) => {
  console.error('글로벌 에러:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: '서버 내부 오류가 발생했습니다.',
    timestamp: new Date()
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 최소 서버 시작: 포트 ${PORT}`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Render URL: https://gantt-c1oh.onrender.com`);
  console.log(`💾 DATABASE_URL 존재: ${!!process.env.DATABASE_URL}`);
  console.log('✅ 서버 준비 완료!');
});

// 에러 처리
process.on('uncaughtException', (error) => {
  console.error('❌ 예기치 않은 예외:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ 처리되지 않은 프로미스 거부:', reason);
});
