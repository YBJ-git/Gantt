/**
 * Resource Routes
 * 리소스 관리 관련 API 라우트
 */
const express = require('express');
const resourceController = require('../controllers/resourceController');

const router = express.Router();

/**
 * @route   GET /api/resources/departments
 * @desc    부서 목록 조회
 * @access  Public
 */
router.get('/departments', resourceController.getDepartments);

/**
 * @route   GET /api/resources/types
 * @desc    리소스 유형 목록 조회
 * @access  Public
 */
router.get('/types', resourceController.getResourceTypes);

/**
 * @route   GET /api/resources
 * @desc    모든 리소스 조회 (필터링, 페이지네이션 지원)
 * @access  Public
 */
router.get('/', resourceController.getAllResources);

/**
 * @route   GET /api/resources/:id
 * @desc    특정 리소스 상세 조회
 * @access  Public
 */
router.get('/:id', resourceController.getResourceById);

/**
 * @route   POST /api/resources
 * @desc    새 리소스 생성
 * @access  Private (Manager/Admin)
 */
router.post('/', resourceController.createResource);

/**
 * @route   PUT /api/resources/:id
 * @desc    리소스 정보 수정
 * @access  Private (Manager/Admin)
 */
router.put('/:id', resourceController.updateResource);

/**
 * @route   DELETE /api/resources/:id
 * @desc    리소스 삭제
 * @access  Private (Admin only)
 */
router.delete('/:id', resourceController.deleteResource);

module.exports = router;