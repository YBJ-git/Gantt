/**
 * Task Routes
 * 작업 관리 관련 라우팅 설정
 */
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const { validateTaskCreation, validateTaskUpdate } = require('../middleware/validationMiddleware');

// 모든 라우트에 인증 필요
router.use(authenticateJWT);

// 모든 작업 조회 - 모든 인증된 사용자 접근 가능
router.get('/', taskController.getAllTasks);

// 특정 작업 조회 - 모든 인증된 사용자 접근 가능
router.get('/:id', taskController.getTaskById);

// 프로젝트별 작업 조회 - 모든 인증된 사용자 접근 가능
router.get('/project/:projectId', taskController.getTasksByProject);

// 사용자별 할당된 작업 조회
router.get('/assigned/me', taskController.getMyTasks);

// 작업 생성 - 관리자와 매니저만 가능
router.post('/', authorizeRoles(['admin', 'manager']), validateTaskCreation, taskController.createTask);

// 작업 수정 - 관리자, 매니저, 작업 담당자만 가능
router.put('/:id', validateTaskUpdate, taskController.updateTask);

// 작업 상태 변경 - 관리자, 매니저, 작업 담당자만 가능
router.put('/:id/status', taskController.updateTaskStatus);

// 작업 삭제 - 관리자만 가능
router.delete('/:id', authorizeRoles(['admin']), taskController.deleteTask);

// 작업 담당자 할당/변경 - 관리자와 매니저만 가능
router.put('/:id/assign', authorizeRoles(['admin', 'manager']), taskController.assignTask);

module.exports = router;
