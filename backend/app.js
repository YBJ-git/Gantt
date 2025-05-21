/**
 * 작업 부하체크 간트 차트 시스템 백엔드 애플리케이션
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');

// 라우터 가져오기
const apiRouter = require('./src/routes');

// 오류 처리 미들웨어 가져오기
const { globalErrorHandler, notFoundHandler } = require('./src/utils/errorHandler');

// Express 앱 생성
const app = express();

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(compression()); // 응답 압축
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱

// CORS 설정
app.use(cors({
  origin: config.cors.origin,
  methods: config.cors.methods,
  credentials: true
}));

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

// API 라우터 설정
app.use(config.app.apiPrefix, apiRouter);

// 404 처리
app.use(notFoundHandler);

// 오류 처리 미들웨어
app.use(globalErrorHandler);

// 서버 시작
const PORT = config.app.port;
app.listen(PORT, () => {
  logger.info(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  logger.info(`환경: ${config.app.env}`);
});

// 예기치 않은 오류 처리
process.on('uncaughtException', (error) => {
  logger.error('예기치 않은 예외 발생:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('처리되지 않은 프로미스 거부:', reason);
});

module.exports = app;