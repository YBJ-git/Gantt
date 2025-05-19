/**
 * ValidationMiddleware
 * 요청 데이터 검증 미들웨어
 */
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// 유효성 검사 결과 체크
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`유효성 검사 오류: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      success: false,
      message: '요청 데이터 유효성 검증 실패',
      errors: errors.array()
    });
  }
  next();
};

// 부하 최적화 요청 검증
exports.validateLoadOptimizationRequest = (req, res, next) => {
  const { projectId, tasks, resources } = req.body;
  
  // 프로젝트 ID 검증
  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: '프로젝트 ID가 필요합니다.'
    });
  }
  
  // 작업 데이터 검증
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({
      success: false,
      message: '유효한 작업 데이터가 필요합니다.'
    });
  }
  
  // 리소스 데이터 검증
  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    return res.status(400).json({
      success: false,
      message: '유효한 리소스 데이터가 필요합니다.'
    });
  }
  
  // 작업 필수 필드 검증
  const validTasks = tasks.every(task => {
    return task.id && task.name && task.startDate && task.endDate && 
           (task.effort !== undefined || task.duration !== undefined);
  });
  
  if (!validTasks) {
    return res.status(400).json({
      success: false,
      message: '작업에는 id, name, startDate, endDate, effort/duration이 필요합니다.'
    });
  }
  
  // 리소스 필수 필드 검증
  const validResources = resources.every(resource => {
    return resource.id && resource.name && resource.capacity !== undefined;
  });
  
  if (!validResources) {
    return res.status(400).json({
      success: false,
      message: '리소스에는 id, name, capacity가 필요합니다.'
    });
  }
  
  next();
};

// 부하 예측 요청 검증
exports.validateLoadPredictionRequest = (req, res, next) => {
  const { projectId, startDate, endDate, newTasks } = req.body;
  
  // 프로젝트 ID 검증
  if (!projectId) {
    return res.status(400).json({
      success: false,
      message: '프로젝트 ID가 필요합니다.'
    });
  }
  
  // 날짜 범위 검증
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: '시작일과 종료일이 필요합니다.'
    });
  }
  
  // 새 작업 데이터 검증
  if (!newTasks || !Array.isArray(newTasks) || newTasks.length === 0) {
    return res.status(400).json({
      success: false,
      message: '유효한 새 작업 데이터가 필요합니다.'
    });
  }
  
  // 새 작업 필수 필드 검증
  const validNewTasks = newTasks.every(task => {
    return task.name && task.resourceId && task.startDate && task.endDate && task.effort !== undefined;
  });
  
  if (!validNewTasks) {
    return res.status(400).json({
      success: false,
      message: '새 작업에는 name, resourceId, startDate, endDate, effort가 필요합니다.'
    });
  }
  
  next();
};

// 부하 최적화 적용 요청 검증
exports.validateApplyOptimizationRequest = (req, res, next) => {
  const { optimizationId, modifications } = req.body;
  
  // 최적화 ID 검증
  if (!optimizationId) {
    return res.status(400).json({
      success: false,
      message: '최적화 ID가 필요합니다.'
    });
  }
  
  // 수정 사항 데이터 검증
  if (!modifications || !Array.isArray(modifications) || modifications.length === 0) {
    return res.status(400).json({
      success: false,
      message: '유효한 수정 사항 데이터가 필요합니다.'
    });
  }
  
  // 수정 사항 필수 필드 검증
  const validModifications = modifications.every(mod => {
    return mod.taskId && mod.oldResourceId && mod.newResourceId;
  });
  
  if (!validModifications) {
    return res.status(400).json({
      success: false,
      message: '수정 사항에는 taskId, oldResourceId, newResourceId가 필요합니다.'
    });
  }
  
  next();
};