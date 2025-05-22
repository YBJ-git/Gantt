/**
 * Task Service
 * 작업 관련 비즈니스 로직 처리
 */
const db = require('../config/database');
const { BadRequestError, NotFoundError } = require('../utils/errorHandler');

/**
 * 모든 작업 조회
 */
const getAllTasks = async (options) => {
  try {
    const { page, limit, status, priority, startDate, endDate, search } = options;
    
    // 쿼리 매개변수 구성
    const params = [];
    let paramIndex = 1;
    
    // 기본 쿼리
    let query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE 1=1
    `;
    
    // 필터 조건 추가
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND t.start_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND t.end_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // 정렬 및 페이지네이션
    query += ` 
      ORDER BY t.start_date, t.priority DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, (page - 1) * limit);
    
    const [tasks] = await db.execute(query, params);
    
    // 각 작업에 담당자 정보 추가
    for (const task of tasks) {
      task.resources = await getTaskResources(task.id);
    }
    
    return tasks;
  } catch (error) {
    throw new Error(`작업 목록 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 작업 개수 조회 (필터링 포함)
 */
const getTasksCount = async (options) => {
  try {
    const { status, priority, startDate, endDate, search } = options;
    
    // 쿼리 매개변수 구성
    const params = [];
    let paramIndex = 1;
    
    // 기본 쿼리
    let query = `
      SELECT COUNT(*) as count
      FROM tasks t
      WHERE 1=1
    `;
    
    // 필터 조건 추가
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND t.start_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND t.end_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    const [result] = await db.execute(query, params);
    
    return parseInt(result[0].count, 10);
  } catch (error) {
    throw new Error(`작업 개수 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * ID로 작업 조회
 */
const getTaskById = async (taskId) => {
  try {
    const [tasks] = await db.execute(
      `SELECT t.*, p.name as project_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [taskId]
    );
    
    if (tasks.length === 0) {
      return null;
    }
    
    const task = tasks[0];
    
    // 작업 담당자 정보 추가
    task.resources = await getTaskResources(taskId);
    
    // 작업 의존성 정보 추가
    task.dependencies = await getTaskDependencies(taskId);
    
    return task;
  } catch (error) {
    throw new Error(`작업 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 프로젝트별 작업 조회
 */
const getTasksByProject = async (projectId, options) => {
  try {
    const { page, limit, status, priority } = options;
    
    // 쿼리 매개변수 구성
    const params = [projectId];
    let paramIndex = 2;
    
    // 기본 쿼리
    let query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.project_id = $1
    `;
    
    // 필터 조건 추가
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    // 정렬 및 페이지네이션
    query += ` 
      ORDER BY t.start_date, t.priority DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, (page - 1) * limit);
    
    const [tasks] = await db.execute(query, params);
    
    // 각 작업에 담당자 정보 추가
    for (const task of tasks) {
      task.resources = await getTaskResources(task.id);
    }
    
    return tasks;
  } catch (error) {
    throw new Error(`프로젝트별 작업 목록 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 프로젝트별 작업 개수 조회
 */
const getTasksCountByProject = async (projectId, options) => {
  try {
    const { status, priority } = options;
    
    // 쿼리 매개변수 구성
    const params = [projectId];
    let paramIndex = 2;
    
    // 기본 쿼리
    let query = `
      SELECT COUNT(*) as count
      FROM tasks t
      WHERE t.project_id = $1
    `;
    
    // 필터 조건 추가
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    const [result] = await db.execute(query, params);
    
    return parseInt(result[0].count, 10);
  } catch (error) {
    throw new Error(`프로젝트별 작업 개수 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 사용자에게 할당된 작업 조회
 */
const getTasksByResource = async (resourceId, options) => {
  try {
    const { page, limit, status, priority } = options;
    
    // 쿼리 매개변수 구성
    const params = [resourceId];
    let paramIndex = 2;
    
    // 기본 쿼리
    let query = `
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      JOIN resource_assignments ra ON t.id = ra.task_id
      WHERE ra.resource_id = $1
    `;
    
    // 필터 조건 추가
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    // 정렬 및 페이지네이션
    query += ` 
      ORDER BY t.start_date, t.priority DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, (page - 1) * limit);
    
    const [tasks] = await db.execute(query, params);
    
    // 각 작업에 담당자 정보 추가
    for (const task of tasks) {
      task.resources = await getTaskResources(task.id);
    }
    
    return tasks;
  } catch (error) {
    throw new Error(`사용자별 작업 목록 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 사용자별 작업 개수 조회
 */
const getTasksCountByResource = async (resourceId, options) => {
  try {
    const { status, priority } = options;
    
    // 쿼리 매개변수 구성
    const params = [resourceId];
    let paramIndex = 2;
    
    // 기본 쿼리
    let query = `
      SELECT COUNT(*) as count
      FROM tasks t
      JOIN resource_assignments ra ON t.id = ra.task_id
      WHERE ra.resource_id = $1
    `;
    
    // 필터 조건 추가
    if (status) {
      query += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      query += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    const [result] = await db.execute(query, params);
    
    return parseInt(result[0].count, 10);
  } catch (error) {
    throw new Error(`사용자별 작업 개수 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 작업 생성
 */
const createTask = async (taskData) => {
  try {
    // 트랜잭션 시작
    const transaction = await db.beginTransaction();
    
    try {
      // 작업 생성
      const [result] = await transaction.execute(
        `INSERT INTO tasks (
          name, description, start_date, end_date, duration, progress, status, priority, project_id, parent_id, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          taskData.name,
          taskData.description || null,
          taskData.start_date,
          taskData.end_date,
          taskData.duration,
          taskData.progress || 0,
          taskData.status || 'not_started',
          taskData.priority || 'medium',
          taskData.project_id,
          taskData.parent_id || null,
          taskData.created_by
        ]
      );
      
      const newTask = result[0];
      
      // 담당자가 지정된 경우 할당
      if (taskData.assigned_resources && taskData.assigned_resources.length > 0) {
        for (const resourceId of taskData.assigned_resources) {
          await transaction.execute(
            `INSERT INTO resource_assignments (task_id, resource_id, allocation_percentage, start_date, end_date)
             VALUES ($1, $2, $3, $4, $5)`,
            [newTask.id, resourceId, 100, taskData.start_date, taskData.end_date]
          );
        }
      }
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      // 생성된 작업에 담당자 정보 추가
      newTask.resources = await getTaskResources(newTask.id);
      
      return newTask;
    } catch (error) {
      // 트랜잭션 롤백
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    throw new Error(`작업 생성 중 오류 발생: ${error.message}`);
  }
};

/**
 * 작업 업데이트
 */
const updateTask = async (taskId, updateData) => {
  try {
    // 작업 존재 확인
    const task = await getTaskById(taskId);
    
    if (!task) {
      throw new NotFoundError('해당 ID의 작업을 찾을 수 없습니다.');
    }
    
    // 업데이트할 필드 구성
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updateData)) {
      // 컬럼명 변환 (camelCase -> snake_case)
      let columnName = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      updateFields.push(`${columnName} = $${paramIndex}`);
      updateValues.push(value);
      paramIndex++;
    }
    
    if (updateFields.length === 0) {
      return task; // 업데이트할 내용이 없으면 기존 작업 반환
    }
    
    // 업데이트 쿼리 실행
    updateValues.push(taskId);
    const query = `
      UPDATE tasks
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const [result] = await db.execute(query, updateValues);
    
    const updatedTask = result[0];
    
    // 업데이트된 작업에 담당자 정보 추가
    updatedTask.resources = await getTaskResources(updatedTask.id);
    
    return updatedTask;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`작업 업데이트 중 오류 발생: ${error.message}`);
  }
};

/**
 * 작업 삭제
 */
const deleteTask = async (taskId) => {
  try {
    // 트랜잭션 시작
    const transaction = await db.beginTransaction();
    
    try {
      // 작업 담당자 연결 삭제
      await transaction.execute(
        'DELETE FROM resource_assignments WHERE task_id = $1',
        [taskId]
      );
      
      // 작업 의존성 삭제
      await transaction.execute(
        'DELETE FROM task_dependencies WHERE predecessor_id = $1 OR successor_id = $1',
        [taskId]
      );
      
      // 작업 삭제
      await transaction.execute(
        'DELETE FROM tasks WHERE id = $1',
        [taskId]
      );
      
      // 트랜잭션 커밋
      await transaction.commit();
      
      return true;
    } catch (error) {
      // 트랜잭션 롤백
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    throw new Error(`작업 삭제 중 오류 발생: ${error.message}`);
  }
};

/**
 * 작업 담당자 할당
 */
const assignTask = async (taskId, resourceId) => {
  try {
    // 작업 존재 확인
    const task = await getTaskById(taskId);
    
    if (!task) {
      throw new NotFoundError('해당 ID의 작업을 찾을 수 없습니다.');
    }
    
    // 기존 할당 확인
    const [existingAssignments] = await db.execute(
      'SELECT * FROM resource_assignments WHERE task_id = $1 AND resource_id = $2',
      [taskId, resourceId]
    );
    
    if (existingAssignments.length > 0) {
      // 이미 할당된 경우 업데이트
      await db.execute(
        `UPDATE resource_assignments 
         SET allocation_percentage = 100, updated_at = CURRENT_TIMESTAMP
         WHERE task_id = $1 AND resource_id = $2`,
        [taskId, resourceId]
      );
    } else {
      // 신규 할당
      await db.execute(
        `INSERT INTO resource_assignments (task_id, resource_id, allocation_percentage, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [taskId, resourceId, 100, task.start_date, task.end_date]
      );
    }
    
    return true;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`작업 담당자 할당 중 오류 발생: ${error.message}`);
  }
};

/**
 * 사용자가 작업에 할당되었는지 확인
 */
const isUserAssignedToTask = async (userId, taskId) => {
  try {
    const [assignments] = await db.execute(
      'SELECT COUNT(*) as count FROM resource_assignments WHERE task_id = $1 AND resource_id = $2',
      [taskId, userId]
    );
    
    return assignments[0].count > 0;
  } catch (error) {
    throw new Error(`작업 담당자 확인 중 오류 발생: ${error.message}`);
  }
};

/**
 * 작업의 담당자 목록 조회
 */
const getTaskResources = async (taskId) => {
  try {
    const [resources] = await db.execute(
      `SELECT r.id, r.name, r.email, r.resource_type, ra.allocation_percentage
       FROM resources r
       JOIN resource_assignments ra ON r.id = ra.resource_id
       WHERE ra.task_id = $1`,
      [taskId]
    );
    
    return resources;
  } catch (error) {
    throw new Error(`작업 담당자 목록 조회 중 오류 발생: ${error.message}`);
  }
};

/**
 * 작업의 의존성 목록 조회
 */
const getTaskDependencies = async (taskId) => {
  try {
    const [dependencies] = await db.execute(
      `SELECT td.id, td.predecessor_id, td.successor_id, td.dependency_type, td.lag,
              p.name as predecessor_name, s.name as successor_name
       FROM task_dependencies td
       JOIN tasks p ON td.predecessor_id = p.id
       JOIN tasks s ON td.successor_id = s.id
       WHERE td.predecessor_id = $1 OR td.successor_id = $1`,
      [taskId]
    );
    
    return dependencies;
  } catch (error) {
    throw new Error(`작업 의존성 목록 조회 중 오류 발생: ${error.message}`);
  }
};

module.exports = {
  getAllTasks,
  getTasksCount,
  getTaskById,
  getTasksByProject,
  getTasksCountByProject,
  getTasksByResource,
  getTasksCountByResource,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  isUserAssignedToTask
};
