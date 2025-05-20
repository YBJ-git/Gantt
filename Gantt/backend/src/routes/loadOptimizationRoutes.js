/**
 * Load Optimization Routes
 * 부하 최적화 관련 라우팅 설정
 */
const express = require('express');
const router = express.Router();
const loadOptimizationController = require('../controllers/loadOptimizationController');
const { authenticateJWT } = require('../middleware/authMiddleware');
const { validateLoadOptimizationRequest } = require('../middleware/validationMiddleware');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateJWT);

// 부하 데이터 조회
router.get('/data', loadOptimizationController.getLoadData);

// 리소스별 부하 분석
router.get('/resource', loadOptimizationController.getResourceLoad);

// 부하 최적화 추천 사항
router.get('/recommendations', loadOptimizationController.getLoadOptimizationRecommendations);

// 작업 자동 재분배
router.post('/auto-distribute', validateLoadOptimizationRequest, loadOptimizationController.autoDistributeTasks);

// 부하 최적화 적용
router.post('/apply', loadOptimizationController.applyLoadOptimization);

// 부하 예측 분석
router.post('/predict', loadOptimizationController.predictFutureLoad);

module.exports = router;