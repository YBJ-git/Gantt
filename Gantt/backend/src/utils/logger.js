/**
 * Logger 
 * 애플리케이션 로깅을 위한 유틸리티 - 개선된 버전
 */
const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 로그 디렉토리 생성
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 개발 환경용 콘솔 포맷
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} ${level}: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// 로거 설정
const logger = createLogger({
  level: config.logging.level || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'gantt-workload-api' },
  transports: [
    // 에러 로그는 별도 파일로 저장
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // 모든 로그 저장
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// 개발 환경에서는 콘솔에도 출력
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      devFormat
    )
  }));
}

// 성능 모니터링을 위한 미들웨어
const performanceLogger = (req, res, next) => {
  const start = Date.now();
  
  // 응답이 완료되면 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = duration > 1000 ? 'warn' : 'info';
    
    logger[logLevel]('API Request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent') || '',
      ip: req.ip
    });
    
    // 느린 요청 감지
    if (duration > 1000) {
      logger.warn(`Slow API request detected: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  
  next();
};

// 오류 로그 래퍼 함수
const logError = (err, context = {}) => {
  logger.error(`${err.name}: ${err.message}`, {
    ...context,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

// 개발자 디버깅을 위한 로그 포맷터
const formatDebugData = (data) => {
  try {
    return typeof data === 'object' 
      ? JSON.stringify(data, null, 2) 
      : String(data);
  } catch (error) {
    return '[Unformatted Data]';
  }
};

// 로깅 기능을 확장한 에러 로깅 미들웨어
const errorLogger = (err, req, res, next) => {
  const errorDetails = {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    params: req.params,
    ip: req.ip,
    user: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
    stack: err.stack
  };

  // 에러 유형별 분류 및 추가 정보 수집
  if (err.name === 'ValidationError') {
    errorDetails.validationErrors = err.details || [];
  }
  
  if (err.code && err.code.startsWith('ECONNREFUSED')) {
    errorDetails.connectionTarget = err.address;
    logger.error(`Database Connection Error: ${err.message}`, errorDetails);
  } else {
    logger.error(`${err.name}: ${err.message}`, errorDetails);
  }
  
  next(err);
};

// 특정 요청 패턴 모니터링
const monitorCriticalOperations = (patternConfig) => {
  return (req, res, next) => {
    const { method, originalUrl } = req;
    
    // 설정된 패턴과 매칭되는 요청 체크
    const matchedPattern = patternConfig.find(pattern => {
      return pattern.method === method && 
        (
          (pattern.exact && pattern.path === originalUrl) ||
          (!pattern.exact && originalUrl.includes(pattern.path))
        );
    });
    
    if (matchedPattern) {
      const startTime = Date.now();
      logger.info(`Critical operation started: ${method} ${originalUrl}`, {
        payload: method !== 'GET' ? req.body : undefined,
        user: req.user?.id || 'anonymous'
      });
      
      // 응답 완료 후 로깅
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info(`Critical operation completed: ${method} ${originalUrl}`, {
          duration: `${duration}ms`,
          statusCode: res.statusCode,
          user: req.user?.id || 'anonymous'
        });
      });
    }
    
    next();
  };
};

module.exports = {
  logger,
  performanceLogger,
  logError,
  errorLogger,
  formatDebugData,
  monitorCriticalOperations
};
