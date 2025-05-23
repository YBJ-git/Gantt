/**
 * Reports Routes
 * 보고서 및 분석 관련 API 라우트
 */
const express = require('express');
const reportsController = require('../controllers/reportsController');

const router = express.Router();

/**
 * @route   GET /api/reports/resource-utilization
 * @desc    리소스 활용도 분석 데이터 조회
 * @access  Public
 */
router.get('/resource-utilization', reportsController.getResourceUtilizationData);

/**
 * @route   GET /api/reports/load-trends
 * @desc    작업 부하 추세 분석 데이터 조회
 * @access  Public
 */
router.get('/load-trends', reportsController.getLoadTrendsData);

/**
 * @route   GET /api/reports/task-completion
 * @desc    작업 완료율 분석 데이터 조회
 * @access  Public
 */
router.get('/task-completion', reportsController.getTaskCompletionData);

/**
 * @route   GET /api/reports/cost-analysis
 * @desc    비용 분석 데이터 조회
 * @access  Public
 */
router.get('/cost-analysis', reportsController.getCostAnalysisData);

/**
 * @route   GET /api/reports/department-performance
 * @desc    부서별 성과 요약 조회
 * @access  Public
 */
router.get('/department-performance', reportsController.getDepartmentPerformance);

/**
 * @route   GET /api/reports/project-resource-allocation
 * @desc    프로젝트별 리소스 할당 현황 조회
 * @access  Public
 */
router.get('/project-resource-allocation', reportsController.getProjectResourceAllocation);

/**
 * @route   GET /api/reports/monthly-load-distribution
 * @desc    월별 부하 분포 분석 조회
 * @access  Public
 */
router.get('/monthly-load-distribution', reportsController.getMonthlyLoadDistribution);

module.exports = router;