/**
 * API 라우터 설정
 * 모든 API 엔드포인트 라우트를 관리합니다.
 */
const express = require('express');
const loadOptimizationRoutes = require('./loadOptimizationRoutes');
const userRoutes = require('./userRoutes');
const taskRoutes = require('./taskRoutes');
const websocketRoutes = require('./websocket');
const feedbackRoutes = require('./feedback');
const dashboardRoutes = require('./dashboardRoutes');
const resourceRoutes = require('./resourceRoutes');
const taskManagementRoutes = require('./taskManagementRoutes');
const reportsRoutes = require('./reportsRoutes');

// 메인 라우터 생성
const router = express.Router();

// 상태 확인 엔드포인트
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '작업 부하 최적화 API가 정상적으로 작동 중입니다',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// 각 기능별 라우트 연결
router.use('/load-optimization', loadOptimizationRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/websocket', websocketRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/resources', resourceRoutes);
router.use('/task-management', taskManagementRoutes);
router.use('/reports', reportsRoutes);

// 추가 라우트는 여기에 등록
// router.use('/analytics', analyticsRoutes);

module.exports = router;