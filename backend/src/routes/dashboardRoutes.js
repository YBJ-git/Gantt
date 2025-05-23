/**
 * Dashboard Routes
 * 대시보드 관련 API 라우트
 */
const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @route   GET /api/dashboard/data
 * @desc    대시보드 메인 데이터 조회
 * @access  Public (실제로는 인증 미들웨어 추가 필요)
 */
router.get('/data', dashboardController.getDashboardData);

/**
 * @route   GET /api/dashboard/heatmap
 * @desc    히트맵 데이터 조회
 * @access  Public
 */
router.get('/heatmap', dashboardController.getHeatmapData);

module.exports = router;