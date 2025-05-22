/**
 * User Controller
 * 사용자 관리 관련 컨트롤러
 */
const userService = require('../services/userService');
const { BadRequestError, AuthenticationError, NotFoundError } = require('../utils/errorHandler');
const { asyncErrorHandler } = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * 사용자 등록
 */
const registerUser = asyncErrorHandler(async (req, res) => {
  const userData = req.body;
  userData.role = 'user'; // 기본 역할은 일반 사용자
  
  const newUser = await userService.createUser(userData);
  
  res.status(201).json({
    success: true,
    message: '사용자가 성공적으로 등록되었습니다.',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  });
});

/**
 * 작업자 등록
 */
const registerWorker = asyncErrorHandler(async (req, res) => {
  const userData = req.body;
  userData.role = 'worker'; // 작업자 역할 부여
  
  const newUser = await userService.createUser(userData);
  
  res.status(201).json({
    success: true,
    message: '작업자가 성공적으로 등록되었습니다.',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  });
});

/**
 * 사용자 로그인
 */
const loginUser = asyncErrorHandler(async (req, res) => {
  const { username, password } = req.body;
  
  // 사용자 인증
  const user = await userService.authenticateUser(username, password);
  
  if (!user) {
    throw new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다.');
  }
  
  // 비활성화된 계정 체크
  if (user.status === 'inactive') {
    throw new AuthenticationError('비활성화된 계정입니다. 관리자에게 문의하세요.');
  }
  
  // JWT 토큰 생성
  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  
  res.status(200).json({
    success: true,
    message: '로그인 성공',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * 현재 로그인한 사용자 정보 조회
 */
const getCurrentUser = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  
  const user = await userService.getUserById(userId);
  
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at
    }
  });
});

/**
 * 현재 로그인한 사용자 정보 수정
 */
const updateCurrentUser = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;
  
  // 역할(role) 변경 시도 방지
  delete updateData.role;
  
  const updatedUser = await userService.updateUser(userId, updateData);
  
  res.status(200).json({
    success: true,
    message: '사용자 정보가 성공적으로 업데이트되었습니다.',
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role
    }
  });
});

/**
 * 비밀번호 변경
 */
const changePassword = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
  }
  
  await userService.changePassword(userId, currentPassword, newPassword);
  
  res.status(200).json({
    success: true,
    message: '비밀번호가 성공적으로 변경되었습니다.'
  });
});

/**
 * 모든 사용자 조회 (관리자용)
 */
const getAllUsers = asyncErrorHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  
  res.status(200).json({
    success: true,
    count: users.length,
    users: users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      createdAt: user.created_at
    }))
  });
});

/**
 * 특정 사용자 조회 (관리자용)
 */
const getUserById = asyncErrorHandler(async (req, res) => {
  const userId = req.params.id;
  
  const user = await userService.getUserById(userId);
  
  if (!user) {
    throw new NotFoundError('사용자를 찾을 수 없습니다.');
  }
  
  res.status(200).json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  });
});

/**
 * 사용자 정보 수정 (관리자용)
 */
const updateUser = asyncErrorHandler(async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  
  const updatedUser = await userService.updateUser(userId, updateData);
  
  res.status(200).json({
    success: true,
    message: '사용자 정보가 성공적으로 업데이트되었습니다.',
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      status: updatedUser.status
    }
  });
});

/**
 * 사용자 역할 변경 (관리자용)
 */
const changeUserRole = asyncErrorHandler(async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;
  
  if (!role) {
    throw new BadRequestError('역할을 지정해주세요.');
  }
  
  // 허용된 역할인지 검증
  const allowedRoles = ['admin', 'manager', 'worker', 'user'];
  if (!allowedRoles.includes(role)) {
    throw new BadRequestError(`유효하지 않은 역할입니다. 허용된 역할: ${allowedRoles.join(', ')}`);
  }
  
  await userService.updateUser(userId, { role });
  
  res.status(200).json({
    success: true,
    message: `사용자 역할이 '${role}'로 변경되었습니다.`
  });
});

/**
 * 사용자 활성화/비활성화 (관리자용)
 */
const toggleUserStatus = asyncErrorHandler(async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;
  
  if (!status || !['active', 'inactive'].includes(status)) {
    throw new BadRequestError("상태는 'active' 또는 'inactive'여야 합니다.");
  }
  
  await userService.updateUser(userId, { status });
  
  const statusMessage = status === 'active' ? '활성화' : '비활성화';
  
  res.status(200).json({
    success: true,
    message: `사용자가 ${statusMessage}되었습니다.`
  });
});

/**
 * 사용자 삭제 (관리자용)
 */
const deleteUser = asyncErrorHandler(async (req, res) => {
  const userId = req.params.id;
  
  // 현재 로그인한 사용자는 삭제할 수 없음
  if (req.user.id === parseInt(userId)) {
    throw new BadRequestError('자신의 계정은 삭제할 수 없습니다.');
  }
  
  await userService.deleteUser(userId);
  
  res.status(200).json({
    success: true,
    message: '사용자가 성공적으로 삭제되었습니다.'
  });
});

module.exports = {
  registerUser,
  registerWorker,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  changeUserRole,
  toggleUserStatus,
  deleteUser
};
