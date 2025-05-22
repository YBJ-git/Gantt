/**
 * Auth Middleware
 * 인증 및 권한 관리 미들웨어
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AuthenticationError, AuthorizationError } = require('../utils/errorHandler');
const userService = require('../services/userService');

/**
 * JWT 토큰 인증 미들웨어
 */
const authenticateJWT = async (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('인증 토큰이 필요합니다.');
    }
    
    const token = authHeader.split(' ')[1];
    
    // 토큰 검증
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // 사용자 정보 확인
      const user = await userService.getUserById(decoded.id);
      
      if (!user) {
        throw new AuthenticationError('존재하지 않는 사용자입니다.');
      }
      
      if (user.status === 'inactive') {
        throw new AuthenticationError('비활성화된 계정입니다.');
      }
      
      // 요청 객체에 사용자 정보 추가
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('인증 토큰이 만료되었습니다.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new AuthenticationError('유효하지 않은 인증 토큰입니다.');
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 역할 기반 권한 검사 미들웨어
 * @param {Array} roles - 허용되는 역할 배열 (예: ['admin', 'manager'])
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('인증이 필요합니다.'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError('이 작업을 수행할 권한이 없습니다.'));
    }
    
    next();
  };
};

module.exports = {
  authenticateJWT,
  authorizeRoles
};
