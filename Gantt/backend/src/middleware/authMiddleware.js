/**
 * AuthMiddleware
 * 사용자 인증 미들웨어
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

// JWT 토큰 인증
exports.authenticateJWT = (req, res, next) => {
  // 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, config.jwt.secret, (err, user) => {
      if (err) {
        logger.warn(`JWT 인증 실패: ${err.message}`);
        return res.status(403).json({
          success: false,
          message: '토큰이 유효하지 않습니다.'
        });
      }
      
      req.user = user;
      next();
    });
  } else {
    logger.warn('인증 토큰이 없음');
    res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }
};

// 권한 확인 (역할 기반)
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn('인증되지 않은 사용자 권한 확인 시도');
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }
    
    const userRole = req.user.role;
    
    if (roles.includes(userRole)) {
      next();
    } else {
      logger.warn(`권한 부족: 사용자 역할 ${userRole}, 필요한 역할 ${roles.join(', ')}`);
      res.status(403).json({
        success: false,
        message: '이 작업을 수행할 권한이 없습니다.'
      });
    }
  };
};

// 특정 프로젝트 접근 권한 확인
exports.checkProjectAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId || req.body.projectId || req.query.projectId;
    
    if (!projectId) {
      return next();
    }
    
    // 프로젝트 접근 권한 확인 로직
    // 실제 구현은 데이터베이스에서 사용자-프로젝트 관계를 조회
    const hasAccess = await checkUserProjectAccess(userId, projectId);
    
    if (hasAccess) {
      next();
    } else {
      logger.warn(`프로젝트 접근 거부: 사용자 ID ${userId}, 프로젝트 ID ${projectId}`);
      res.status(403).json({
        success: false,
        message: '이 프로젝트에 접근할 권한이 없습니다.'
      });
    }
  } catch (error) {
    logger.error(`프로젝트 접근 권한 확인 오류: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

// 사용자-프로젝트 접근 권한 확인 (내부 함수)
async function checkUserProjectAccess(userId, projectId) {
  // 실제 구현에서는 데이터베이스 조회
  // 여기서는 간단한 예시만 구현
  
  // 관리자는 모든 프로젝트에 접근 가능 (실제 구현은 사용자 역할 확인 필요)
  // TODO: 데이터베이스에서 사용자 역할 및 프로젝트 멤버십 확인
  
  // 임시 구현: 모든 접근 허용 (개발 중)
  return true;
}