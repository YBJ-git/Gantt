/**
 * User Routes
 * 사용자 관리 관련 라우팅 설정
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');
const { validateUserRegistration, validateUpdateUser } = require('../middleware/validationMiddleware');

// 사용자 등록
router.post('/register', validateUserRegistration, userController.registerUser);

// 작업자 등록
router.post('/register-worker', validateUserRegistration, userController.registerWorker);

// 사용자 로그인
router.post('/login', userController.loginUser);

// 인증 필요 라우트
router.use(authenticateJWT);

// 자기 정보 조회
router.get('/me', userController.getCurrentUser);

// 자기 정보 수정
router.put('/me', validateUpdateUser, userController.updateCurrentUser);

// 비밀번호 변경
router.put('/change-password', userController.changePassword);

// 관리자만 접근 가능한 라우트
router.use(authorizeRoles(['admin']));

// 모든 사용자 조회
router.get('/', userController.getAllUsers);

// 특정 사용자 조회
router.get('/:id', userController.getUserById);

// 사용자 정보 수정
router.put('/:id', validateUpdateUser, userController.updateUser);

// 사용자 권한 변경
router.put('/:id/role', userController.changeUserRole);

// 사용자 활성화/비활성화
router.put('/:id/status', userController.toggleUserStatus);

// 사용자 삭제
router.delete('/:id', userController.deleteUser);

module.exports = router;
