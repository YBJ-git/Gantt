/**
 * Load Optimization Controller
 * 작업 부하 최적화 API 엔드포인트 관리
 */
const loadOptimizationService = require('../services/loadOptimizationService');
const logger = require('../utils/logger');
const { handleError } = require('../utils/errorHandler');

// 부하 데이터 조회
exports.getLoadData = async (req, res) => {
  try {
    const { startDate, endDate, projectId, teamId } = req.query;
    logger.info(`부하 데이터 조회 요청: ${JSON.stringify(req.query)}`);
    
    const loadData = await loadOptimizationService.getLoadData(startDate, endDate, projectId, teamId);
    
    return res.status(200).json({
      success: true,
      data: loadData
    });
  } catch (error) {
    logger.error(`부하 데이터 조회 오류: ${error.message}`);
    return handleError(res, error);
  }
};

// 리소스별 부하 분석
exports.getResourceLoad = async (req, res) => {
  try {
    const { resourceIds, startDate, endDate } = req.query;
    logger.info(`리소스별 부하 분석 요청: ${JSON.stringify(req.query)}`);
    
    const resourceLoadData = await loadOptimizationService.getResourceLoad(
      resourceIds ? resourceIds.split(',') : null,
      startDate,
      endDate
    );
    
    return res.status(200).json({
      success: true,
      data: resourceLoadData
    });
  } catch (error) {
    logger.error(`리소스별 부하 분석 오류: ${error.message}`);
    return handleError(res, error);
  }
};

// 부하 최적화 추천 사항
exports.getLoadOptimizationRecommendations = async (req, res) => {
  try {
    const { projectId, teamId, startDate, endDate, threshold } = req.query;
    logger.info(`부하 최적화 추천 요청: ${JSON.stringify(req.query)}`);
    
    const recommendations = await loadOptimizationService.getLoadOptimizationRecommendations(
      projectId,
      teamId,
      startDate,
      endDate,
      threshold || 80 // 기본 부하 임계값 80%
    );
    
    return res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    logger.error(`부하 최적화 추천 오류: ${error.message}`);
    return handleError(res, error);
  }
};

// 작업 자동 재분배
exports.autoDistributeTasks = async (req, res) => {
  try {
    const { projectId, tasks, resources, constraints } = req.body;
    logger.info(`작업 자동 재분배 요청: projectId=${projectId}, tasks=${tasks.length}, resources=${resources.length}`);
    
    const redistributionResult = await loadOptimizationService.autoDistributeTasks(
      projectId,
      tasks,
      resources,
      constraints
    );
    
    return res.status(200).json({
      success: true,
      data: redistributionResult
    });
  } catch (error) {
    logger.error(`작업 자동 재분배 오류: ${error.message}`);
    return handleError(res, error);
  }
};

// 부하 최적화 적용
exports.applyLoadOptimization = async (req, res) => {
  try {
    const { optimizationId, modifications } = req.body;
    logger.info(`부하 최적화 적용 요청: optimizationId=${optimizationId}`);
    
    const result = await loadOptimizationService.applyLoadOptimization(optimizationId, modifications);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`부하 최적화 적용 오류: ${error.message}`);
    return handleError(res, error);
  }
};

// 부하 예측 분석
exports.predictFutureLoad = async (req, res) => {
  try {
    const { projectId, teamId, startDate, endDate, newTasks } = req.body;
    logger.info(`부하 예측 분석 요청: projectId=${projectId}, teamId=${teamId}`);
    
    const prediction = await loadOptimizationService.predictFutureLoad(
      projectId,
      teamId,
      startDate,
      endDate,
      newTasks
    );
    
    return res.status(200).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error(`부하 예측 분석 오류: ${error.message}`);
    return handleError(res, error);
  }
};