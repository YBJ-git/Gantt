/**
 * 작업 부하체크 간트 차트 시스템 백엔드 애플리케이션
 */
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/config');
const { logger } = require('./src/utils/logger');

// WebSocket 서버 가져오기
const WebSocketServer = require('./src/websocket/WebSocketServer');

// 라우터 가져오기
const apiRouter = require('./src/routes');

// 오류 처리 미들웨어 가져오기
const { globalErrorHandler, notFoundHandler } = require('./src/utils/errorHandler');

// 데이터베이스 초기화 모듈 가져오기
const DatabaseInitializer = require('./src/utils/DatabaseInitializer');

// Express 앱 생성
const app = express();

// HTTP 서버 생성 (WebSocket을 위해 필요)
const server = http.createServer(app);

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(compression()); // 응답 압축
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// CORS 설정
app.use(cors(config.cors));

// 로깅 설정
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// 속도 제한 설정
if (config.app.env === 'production') {
  app.use(rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15분
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // IP당 최대 요청 수
    message: { error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.' }
  }));
}

// 헬스 체크 엔드포인트
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// 에러 로깅 엔드포인트 (프론트엔드 ErrorBoundary에서 사용)
app.post('/api/log-error', (req, res) => {
  const { error, stack, componentStack, timestamp, userAgent, url } = req.body;
  
  // 에러 로깅
  logger.error('Frontend Error:', {
    error,
    stack,
    componentStack,
    timestamp,
    userAgent,
    url
  });
  
  res.status(200).json({ success: true, message: 'Error logged successfully' });
});

// API 라우터 설정
app.use(config.app.apiPrefix, apiRouter);

// 404 처리
app.use(notFoundHandler);

// 오류 처리 미들웨어
app.use(globalErrorHandler);

// WebSocket 서버 초기화
const wsServer = new WebSocketServer(server, {
  path: '/ws',
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000
});

// WebSocket 이벤트 리스너
wsServer.on('connection', ({ clientId, user, ws }) => {
  logger.info(`WebSocket client connected: ${clientId} (User: ${user?.username || 'Anonymous'})`);
});

wsServer.on('disconnection', ({ clientId, client, code, reason }) => {
  logger.info(`WebSocket client disconnected: ${clientId} (Code: ${code}, Reason: ${reason})`);
});

wsServer.on('room_message', ({ clientId, roomId, message, sender }) => {
  logger.info(`Room message from ${sender?.username}: ${message.content}`);
  
  // 여기에 메시지 저장 로직 추가 가능
  // await messageService.saveMessage({ roomId, senderId: sender.id, content: message.content });
});

wsServer.on('notification_read', ({ clientId, notificationId, userId }) => {
  logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
  
  // 여기에 알림 읽음 처리 로직 추가 가능
  // await notificationService.markAsRead(notificationId, userId);
});

wsServer.on('error', (error) => {
  logger.error('WebSocket server error:', error);
});

// WebSocket 서버를 app에 추가하여 다른 곳에서 접근 가능하게 함
app.wsServer = wsServer;

// 서버 시작
const PORT = config.app.port;
server.listen(PORT, async () => {
  logger.info(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  logger.info(`환경: ${config.app.env}`);
  logger.info(`WebSocket 서버가 /ws 경로에서 실행 중입니다.`);
  
  // 데이터베이스 자동 초기화
  try {
    const db = require('./src/config/database');
    const dbInitializer = new DatabaseInitializer(db);
    await dbInitializer.initialize();
  } catch (error) {
    logger.error('데이터베이스 초기화 중 오류 발생:', error);
  }
});

// 예기치 않은 오류 처리
process.on('uncaughtException', (error) => {
  logger.error('예기치 않은 예외 발생:', error);
  
  // WebSocket 서버 정리
  if (wsServer) {
    wsServer.close();
  }
  
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 프로미스 거부:', reason);
});

// 우아한 종료 처리
process.on('SIGTERM', () => {
  logger.info('SIGTERM 신호 수신, 서버를 종료합니다...');
  
  if (wsServer) {
    wsServer.close();
  }
  
  server.close(() => {
    logger.info('서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT 신호 수신, 서버를 종료합니다...');
  
  if (wsServer) {
    wsServer.close();
  }
  
  server.close(() => {
    logger.info('서버가 정상적으로 종료되었습니다.');
    process.exit(0);
  });
});

module.exports = { app, server, wsServer };