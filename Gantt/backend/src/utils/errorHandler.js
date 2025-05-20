/**
 * Error Handler
 * 애플리케이션 오류 처리 유틸리티 - 개선된 버전
 */
const { logger, logError } = require('./logger');

// 기본 애플리케이션 오류 클래스
class AppError extends Error {
  constructor(message, statusCode, errorCode, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// 비즈니스 로직 오류
class BusinessError extends AppError {
  constructor(message, errorCode = 'BUSINESS_ERROR', details = null) {
    super(message, 400, errorCode, details);
  }
}

// 데이터 검증 오류
class ValidationError extends AppError {
  constructor(message, fields = null, errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode, fields);
  }
}

// 권한 오류
class AuthorizationError extends AppError {
  constructor(message, requiredPermissions = null, errorCode = 'AUTHORIZATION_ERROR') {
    super(message, 403, errorCode, { requiredPermissions });
  }
}

// 인증 오류
class AuthenticationError extends AppError {
  constructor(message, errorCode = 'AUTHENTICATION_ERROR') {
    super(message, 401, errorCode);
  }
}

// 리소스 없음 오류
class NotFoundError extends AppError {
  constructor(message, resource = null, errorCode = 'NOT_FOUND_ERROR') {
    super(message, 404, errorCode, { resource });
  }
}

// 중복 데이터 오류
class DuplicateError extends AppError {
  constructor(message, field = null, errorCode = 'DUPLICATE_ERROR') {
    super(message, 409, errorCode, { field });
  }
}

// 데이터베이스 오류
class DatabaseError extends AppError {
  constructor(message, operation = null, errorCode = 'DATABASE_ERROR') {
    super(message, 500, errorCode, { operation });
  }
}

// 서비스 불가 오류
class ServiceUnavailableError extends AppError {
  constructor(message, service = null, errorCode = 'SERVICE_UNAVAILABLE') {
    super(message, 503, errorCode, { service });
  }
}

// 입출력 제한 초과 오류
class RateLimitError extends AppError {
  constructor(message, limit = null, resetTime = null, errorCode = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, errorCode, { limit, resetTime });
  }
}

// 잘못된 요청 오류
class BadRequestError extends AppError {
  constructor(message, errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

// 오류 응답 처리 함수 개선
const handleError = (res, err) => {
  // 로그 컨텍스트 준비
  const logContext = {
    statusCode: err.statusCode || 500,
    errorCode: err.errorCode,
    name: err.name,
    details: err.details
  };
  
  // 사용자 정의 오류인 경우
  if (err instanceof AppError) {
    // 운영 오류는 일반 로그 레벨, 프로그래밍 오류는 에러 레벨로 기록
    if (err.isOperational) {
      logger.warn(`${err.name}: ${err.message}`, logContext);
    } else {
      logError(err, logContext);
    }
    
    // 오류 응답 반환
    return res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
      details: err.details
    });
  }
  
  // 일반 Error 객체 또는 알 수 없는 오류 처리
  
  // 데이터베이스 중복 오류
  if (err.code === 'ER_DUP_ENTRY' || err.code === 'SQLITE_CONSTRAINT') {
    logger.warn(`데이터베이스 중복 오류: ${err.message}`);
    return res.status(409).json({
      success: false,
      errorCode: 'DUPLICATE_ERROR',
      message: '중복된 데이터가 있습니다.'
    });
  }
  
  // 데이터베이스 연결 오류
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    logger.error(`데이터베이스 연결 오류: ${err.message}`);
    return res.status(503).json({
      success: false,
      errorCode: 'DATABASE_CONNECTION_ERROR',
      message: '데이터베이스 서비스에 접속할 수 없습니다. 잠시 후 다시 시도해주세요.'
    });
  }
  
  // SQL 문법 오류
  if (err.code === 'ER_PARSE_ERROR' || err.code === 'SQLITE_ERROR') {
    logError(err, { type: 'SQL_SYNTAX_ERROR' });
    return res.status(500).json({
      success: false,
      errorCode: 'DATABASE_QUERY_ERROR',
      message: '데이터베이스 쿼리 처리 중 오류가 발생했습니다.'
    });
  }
  
  // 포맷 오류 (JSON 파싱 등)
  if (err instanceof SyntaxError && err.status === 400) {
    logger.warn(`구문 오류: ${err.message}`);
    return res.status(400).json({
      success: false,
      errorCode: 'SYNTAX_ERROR',
      message: '잘못된 요청 형식입니다. 요청 데이터를 확인해주세요.'
    });
  }
  
  // 기타 서버 오류
  logError(err, { type: 'UNCAUGHT_ERROR' });
  
  // 민감한 정보 누출 방지를 위해 에러 메시지 일반화
  return res.status(500).json({
    success: false,
    errorCode: 'SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다. 관리자에게 문의해주세요.'
  });
};

// API 요청 없는 경로 처리 미들웨어
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`요청한 경로 [${req.method}] ${req.originalUrl}를 찾을 수 없습니다.`, 'ROUTE');
  next(error);
};

// 글로벌 오류 처리 미들웨어
const globalErrorHandler = (err, req, res, next) => {
  // 요청 정보 추가
  err.requestInfo = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || 'anonymous'
  };
  
  handleError(res, err);
};

// 입력 데이터 검증 미들웨어
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        // 유효성 검증 오류 정보 가공
        const errorDetails = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          type: detail.type
        }));
        
        throw new ValidationError('입력 데이터 검증에 실패했습니다.', errorDetails);
      }
      
      // 검증된 데이터로 교체
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// 비동기 에러 래퍼 함수
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  BusinessError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
  DuplicateError,
  DatabaseError,
  ServiceUnavailableError,
  RateLimitError,
  BadRequestError,
  handleError,
  notFoundHandler,
  globalErrorHandler,
  validateRequest,
  asyncErrorHandler
};
