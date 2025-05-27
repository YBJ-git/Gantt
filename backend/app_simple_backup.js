/**
 * 간트 차트 시스템 백엔드 애플리케이션 (간단 버전)
 * WebSocket 제거하고 기본 Express 서버만 구동
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { logger } = require('./src/utils/logger');

// Express 앱 생성
const app = express();

// 기본 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(compression()); // 응답 압축
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// CORS 설정 (간단 버전)
app.use(cors({
  origin: [
    'https://tubular-vacherin-352fde.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// 로깅 설정
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 기본 라우트 - 서버 상태 확인
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '간트 차트 시스템 백엔드가 정상적으로 실행 중입니다',
    timestamp: new Date(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running', 
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API 라우터 설정
try {
  // 사용자 라우터
  const userRoutes = require('./src/routes/userRoutes');
  app.use('/api/users', userRoutes);
  
  // 헬스체크 라우터
  const healthRoutes = require('./src/routes/healthRoutes');
  app.use('/api/health', healthRoutes);
  
  // API 상태 엔드포인트
  app.get('/api/status', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'API가 정상적으로 작동 중입니다',
      timestamp: new Date(),
      version: '1.0.0',
      endpoints: {
        '/api/users/login': 'POST - 사용자 로그인',
        '/api/users/register': 'POST - 사용자 등록',
        '/api/health/system': 'GET - 시스템 상태',
        '/api/health/database': 'GET - 데이터베이스 상태'
      }
    });
  });
  
  console.log('✅ API 라우터 로드 성공');
  
} catch (error) {
  console.error('❌ API 라우터 로드 실패:', error.message);
  
  // 기본 라우터라도 제공
  app.get('/api/status', (req, res) => {
    res.status(500).json({
      status: 'error',
      message: 'API 라우터 로드 실패',
      error: error.message,
      timestamp: new Date()
    });
  });
}

// 에러 로깅 엔드포인트
app.post('/api/log-error', (req, res) => {
  const { error, stack, timestamp } = req.body;
  console.error('프론트엔드 오류:', { error, stack, timestamp });
  res.status(200).json({ success: true, message: 'Error logged' });
});

// 404 처리
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`,
    timestamp: new Date(),
    availableEndpoints: [
      'GET /',
      'GET /health', 
      'GET /api/status',
      'POST /api/users/login',
      'GET /api/health/system',
      'GET /api/health/database'
    ]
  });
});

// 글로벌 에러 처리
app.use((error, req, res, next) => {
  console.error('글로벌 에러:', error);
  
  res.status(error.status || 500).json({
    error: error.name || 'Internal Server Error',
    message: error.message || '서버 내부 오류가 발생했습니다',
    timestamp: new Date(),
    path: req.originalUrl
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 BASE URL: http://localhost:${PORT}`);
  
  // 데이터베이스 초기화 시도
  try {
    console.log('🔄 데이터베이스 초기화 시도...');
    const db = require('./src/config/database');
    const DatabaseInitializer = require('./src/utils/DatabaseInitializer');
    const dbInitializer = new DatabaseInitializer(db);
    await dbInitializer.initialize();
    console.log('✅ 데이터베이스 초기화 완료');
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message);
    console.log('⚠️ 데이터베이스 없이 서버 계속 실행');
  }
  
  console.log('🎉 서버 준비 완료!');
});

// 예기치 않은 오류 처리
process.on('uncaughtException', (error) => {
  console.error('❌ 예기치 않은 예외:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 처리되지 않은 프로미스 거부:', reason);
});

// 우아한 종료 처리
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM 신호 수신, 서버 종료 중...');
  server.close(() => {
    console.log('✅ 서버가 정상적으로 종료되었습니다');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT 신호 수신, 서버 종료 중...');
  server.close(() => {
    console.log('✅ 서버가 정상적으로 종료되었습니다');
    process.exit(0);
  });
});

module.exports = app;
