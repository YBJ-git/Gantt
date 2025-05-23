/**
 * Task Management Routes
 * 작업 관리 관련 API 라우트
 */
const express = require('express');
const taskManagementController = require('../controllers/taskManagementController');

const router = express.Router();

/**
 * @route   GET /api/task-management/tasks
 * @desc    모든 작업 조회 (필터링, 페이지네이션 지원)
 * @access  Public
 */
router.get('/tasks', taskManagementController.getAllTasks);

/**
 * @route   GET /api/task-management/tasks/:id
 * @desc    특정 작업 상세 조회
 * @access  Public
 */
router.get('/tasks/:id', taskManagementController.getTaskById);

/**
 * @route   POST /api/task-management/tasks
 * @desc    새 작업 생성
 * @access  Private (Manager/Admin)
 */
router.post('/tasks', taskManagementController.createTask);

/**
 * @route   PUT /api/task-management/tasks/:id
 * @desc    작업 정보 수정
 * @access  Private
 */
router.put('/tasks/:id', taskManagementController.updateTask);

/**
 * @route   DELETE /api/task-management/tasks/:id
 * @desc    작업 삭제
 * @access  Private (Admin only)
 */
router.delete('/tasks/:id', taskManagementController.deleteTask);

/**
 * @route   POST /api/task-management/tasks/:id/comments
 * @desc    작업에 댓글 추가
 * @access  Private
 */
router.post('/tasks/:id/comments', taskManagementController.addTaskComment);

/**
 * @route   GET /api/task-management/projects
 * @desc    프로젝트 목록 조회
 * @access  Public
 */
router.get('/projects', taskManagementController.getProjects);

module.exports = router;