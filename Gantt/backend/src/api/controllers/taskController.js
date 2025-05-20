      taskId: req.params.id,
      error: error.message, 
      stack: error.stack 
    });
    next(error);
  }
};

// 작업 생성
exports.createTask = async (req, res, next) => {
  try {
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation error on task creation', { errors: errors.array() });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const taskData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    logger.info('Creating new task', { 
      userId: req.user.id,
      task: { title: taskData.title, startDate: taskData.startDate, endDate: taskData.endDate }
    });
    
    const task = await Task.create(taskData);
    
    logger.info('Task created successfully', { taskId: task.id });
    
    res.status(201).json({
      success: true,
      data: task
    });
    
  } catch (error) {
    logger.error('Error creating task', { 
      userId: req.user.id,
      error: error.message, 
      stack: error.stack 
    });
    next(error);
  }
};

// 작업 수정
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation error on task update', { taskId: id, errors: errors.array() });
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // 작업 존재 여부 확인
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      logger.warn('Task not found for update', { taskId: id });
      return res.status(404).json({
        success: false,
        message: '작업을 찾을 수 없습니다.'
      });
    }
    
    // 작업 수정 권한 확인
    if (!req.user.isAdmin && existingTask.createdBy !== req.user.id && existingTask.assigneeId !== req.user.id) {
      logger.warn('Unauthorized task update attempt', { 
        taskId: id, 
        userId: req.user.id, 
        createdBy: existingTask.createdBy,
        assigneeId: existingTask.assigneeId
      });
      return res.status(403).json({
        success: false,
        message: '작업을 수정할 권한이 없습니다.'
      });
    }
    
    logger.info('Updating task', { 
      taskId: id, 
      userId: req.user.id, 
      updates: { title: req.body.title, status: req.body.status }
    });
    
    const updatedTask = await Task.update(id, {
      ...req.body,
      updatedAt: new Date()
    });
    
    logger.info('Task updated successfully', { taskId: id });
    
    res.status(200).json({
      success: true,
      data: updatedTask
    });
    
  } catch (error) {
    logger.error('Error updating task', { 
      taskId: req.params.id,
      userId: req.user.id,
      error: error.message, 
      stack: error.stack 
    });
    next(error);
  }
};

// 작업 삭제
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 작업 존재 여부 확인
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      logger.warn('Task not found for deletion', { taskId: id });
      return res.status(404).json({
        success: false,
        message: '작업을 찾을 수 없습니다.'
      });
    }
    
    // 작업 삭제 권한 확인
    if (!req.user.isAdmin && existingTask.createdBy !== req.user.id) {
      logger.warn('Unauthorized task deletion attempt', { 
        taskId: id, 
        userId: req.user.id, 
        createdBy: existingTask.createdBy
      });
      return res.status(403).json({
        success: false,
        message: '작업을 삭제할 권한이 없습니다.'
      });
    }
    
    logger.info('Deleting task', { taskId: id, userId: req.user.id });
    
    await Task.delete(id);
    
    logger.info('Task deleted successfully', { taskId: id });
    
    res.status(200).json({
      success: true,
      message: '작업이 삭제되었습니다.'
    });
    
  } catch (error) {
    logger.error('Error deleting task', { 
      taskId: req.params.id,
      userId: req.user.id,
      error: error.message, 
      stack: error.stack 
    });
    next(error);
  }
};

// 작업 상태 변경
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 유효성 검사
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '상태 값이 필요합니다.'
      });
    }
    
    logger.info('Updating task status', { 
      taskId: id, 
      userId: req.user.id, 
      newStatus: status
    });
    
    const updatedTask = await Task.updateStatus(id, status, req.user.id);
    
    logger.info('Task status updated successfully', { 
      taskId: id, 
      previousStatus: updatedTask.previousStatus,
      newStatus: updatedTask.status
    });
    
    res.status(200).json({
      success: true,
      data: updatedTask
    });
    
  } catch (error) {
    logger.error('Error updating task status', { 
      taskId: req.params.id,
      userId: req.user.id,
      error: error.message, 
      stack: error.stack 
    });
    next(error);
  }
};

// 작업 일괄 생성
exports.createBatchTasks = async (req, res, next) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: '유효한 작업 목록이 필요합니다.'
      });
    }
    
    logger.info('Creating batch tasks', { 
      userId: req.user.id, 
      taskCount: tasks.length
    });
    
    const createdTasks = await Task.createBatch(tasks.map(task => ({
      ...task,
      createdBy: req.user.id
    })));
    
    logger.info('Batch tasks created successfully', { 
      count: createdTasks.length,
      taskIds: createdTasks.map(task => task.id)
    });
    
    res.status(201).json({
      success: true,
      data: createdTasks
    });
    
  } catch (error) {
    logger.error('Error creating batch tasks', { 
      userId: req.user.id,
      error: error.message, 
      stack: error.stack 
    });
    next(error);
  }
};
