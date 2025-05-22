/**
 * Task Controller
 * 작업 관리 관련 컨트롤러
 */
const taskService = require('../services/taskService');
const { BadRequestError, NotFoundError, AuthorizationError } = require('../utils/errorHandler');
const { asyncErrorHandler } = require('../utils/errorHandler');

/**
 * 모든 작업 조회
 */
const getAllTasks = asyncErrorHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority, startDate, endDate, search } = req.query;
  
  // 페이지네이션 및 필터링 처리
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    status,
    priority,
    startDate,
    endDate,
    search
  };
  
  const tasks = await taskService.getAllTasks(options);
  const totalCount = await taskService.getTasksCount(options);
  
  res.status(200).json({
    success: true,
    count: tasks.length,
    totalCount,
    totalPages: Math.ceil(totalCount / options.limit),
    currentPage: options.page,
    tasks
  });
});

/**
 * 특정 작업 조회
 */
const getTaskById = asyncErrorHandler(async (req, res) => {
  const taskId = req.params.id;
  
  const task = await taskService.getTaskById(taskId);
  
  if (!task) {
    throw new NotFoundError('해당 ID의 작업을 찾을 수 없습니다.');
  }
  
  res.status(200).json({
    success: true,
    task
  });
});

/**
 * 프로젝트별 작업 조회
 */
const getTasksByProject = asyncErrorHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const { page = 1, limit = 20, status, priority } = req.query;
  
  // 페이지네이션 및 필터링 처리
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    status,
    priority,
    projectId
  };
  
  const tasks = await taskService.getTasksByProject(projectId, options);
  const totalCount = await taskService.getTasksCountByProject(projectId, options);
  
  res.status(200).json({
    success: true,
    count: tasks.length,
    totalCount,
    totalPages: Math.ceil(totalCount / options.limit),
    currentPage: options.page,
    tasks
  });
});

/**
 * 자신에게 할당된 작업 조회
 */
const getMyTasks = asyncErrorHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, status, priority } = req.query;
  
  // 페이지네이션 및 필터링 처리
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    status,
    priority
  };
  
  const tasks = await taskService.getTasksByResource(userId, options);
  const totalCount = await taskService.getTasksCountByResource(userId, options);
  
  res.status(200).json({
    success: true,
    count: tasks.length,
    totalCount,
    totalPages: Math.ceil(totalCount / options.limit),
    currentPage: options.page,
    tasks
  });
});

/**
 * 작업 생성
 */
const createTask = asyncErrorHandler(async (req, res) => {
  const taskData = req.body;
  taskData.created_by = req.user.id;
  
  const newTask = await taskService.createTask(taskData);
  
  res.status(201).json({
    success: true,
    message: '작업이 성공적으로 생성되었습니다.',
    task: newTask
  });
});

/**
 * 작업 수정
 * (권한 체크: 관리자, 매니저, 작업 담당자만 가능)
 */
const updateTask = asyncErrorHandler(async (req, res) => {
  const taskId = req.params.id;
  const updateData = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  // 기존 작업 조회
  const task = await taskService.getTaskById(taskId);
  
  if (!task) {
    throw new NotFoundError('해당 ID의 작업을 찾을 수 없습니다.');
  }
  
  // 권한 체크
  const isAssigned = await taskService.isUserAssignedToTask(userId, taskId);
  if (userRole !== 'admin' && userRole !== 'manager' && !isAssigned) {
    throw new AuthorizationError('이 작업을 수정할 권한이 없습니다.');
  }
  
  // 일반 작업자는 제한된 필드만 수정 가능
  if (userRole === 'worker' || userRole === 'user') {
    const allowedFields = ['progress', 'status', 'description'];
    Object.keys(updateData).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });
  }
  
  const updatedTask = await taskService.updateTask(taskId, updateData);
  
  res.status(200).json({
    success: true,
    message: '작업이 성공적으로 업데이트되었습니다.',
    task: updatedTask
  });
});

/**
 * 작업 상태 변경
 * (권한 체크: 관리자, 매니저, 작업 담당자만 가능)
 */
const updateTaskStatus = asyncErrorHandler(async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  if (!status) {
    throw new BadRequestError('상태를 지정해주세요.');
  }
  
  // 허용된 상태값인지 검증
  const allowedStatuses = ['not_started', 'in_progress', 'completed', 'delayed'];
  if (!allowedStatuses.includes(status)) {
    throw new BadRequestError(`유효하지 않은 상태입니다. 허용된 상태: ${allowedStatuses.join(', ')}`);
  }
  
  // 기존 작업 조회
  const task = await taskService.getTaskById(taskId);
  
  if (!task) {
    throw new NotFoundError('해당 ID의 작업을 찾을 수 없습니다.');
  }
  
  // 권한 체크
  const isAssigned = await taskService.isUserAssignedToTask(userId, taskId);
  if (userRole !== 'admin' && userRole !== 'manager' && !isAssigned) {
    throw new AuthorizationError('이 작업의 상태를 변경할 권한이 없습니다.');
  }
  
  const updatedTask = await taskService.updateTask(taskId, { status });
  
  res.status(200).json({
    success: true,
    message: `작업 상태가 '${status}'로 업데이트되었습니다.`,
    task: updatedTask
  });
});

/**
 * 작업 삭제 (관리자만 가능)
 */
const deleteTask = asyncErrorHandler(async (req, res) => {
  const taskId = req.params.id;
  
  // 작업 존재 여부 확인
  const task = await taskService.getTaskById(taskId);
  
  if (!task) {
    throw new NotFoundError('해당 ID의 작업을 찾을 수 없습니다.');
  }
  
  await taskService.deleteTask(taskId);
  
  res.status(200).json({
    success: true,
    message: '작업이 성공적으로 삭제되었습니다.'
  });
});

/**
 * 작업 담당자 할당/변경 (관리자, 매니저만 가능)
 */
const assignTask = asyncErrorHandler(async (req, res) => {
  const taskId = req.params.id;
  const { resourceId } = req.body;
  
  if (!resourceId) {
    throw new BadRequestError('담당자 ID를 지정해주세요.');
  }
  
  // 작업 존재 여부 확인
  const task = await taskService.getTaskById(taskId);
  
  if (!task) {
    throw new NotFoundError('해당 ID의 작업을 찾을 수 없습니다.');
  }
  
  await taskService.assignTask(taskId, resourceId);
  
  res.status(200).json({
    success: true,
    message: '작업 담당자가 성공적으로 할당되었습니다.'
  });
});

module.exports = {
  getAllTasks,
  getTaskById,
  getTasksByProject,
  getMyTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  assignTask
};
