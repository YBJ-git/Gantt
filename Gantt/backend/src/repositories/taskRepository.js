/**
 * Task Repository
 * 작업 관련 데이터베이스 작업
 */
const db = require('../config/database');
const logger = require('../utils/logger');

// 날짜 범위로 작업 조회
exports.getTasksByDateRange = async (startDate, endDate, projectId, teamId) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    let query = `
      SELECT 
        t.id, 
        t.name, 
        t.project_id AS projectId,
        t.start_date AS startDate,
        t.end_date AS endDate,
        t.duration,
        t.effort,
        t.progress,
        t.status,
        t.priority,
        t.resource_id AS resourceId,
        t.is_fixed AS isFixed,
        t.required_skills AS requiredSkills
      FROM 
        tasks t
      WHERE 
        (t.start_date <= ? AND t.end_date >= ?) AND
        t.status != 'CANCELLED'
    `;
    
    const params = [endDate, startDate];
    
    // 프로젝트 ID 필터 (있는 경우)
    if (projectId) {
      query += ` AND t.project_id = ?`;
      params.push(projectId);
    }
    
    // 팀 ID 필터 (있는 경우)
    if (teamId) {
      query += ` AND t.resource_id IN (SELECT id FROM resources WHERE team_id = ?)`;
      params.push(teamId);
    }
    
    query += ` ORDER BY t.start_date`;
    
    const [rows] = await db.execute(query, params);
    
    // 스킬 ID를 배열로 변환
    return rows.map(task => ({
      ...task,
      requiredSkills: task.requiredSkills ? JSON.parse(task.requiredSkills) : []
    }));
  } catch (error) {
    logger.error(`날짜 범위로 작업 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 반환 (실제 구현 전까지)
  const sampleTasks = [
    {
      id: 1,
      name: "요구사항 분석",
      projectId: 1,
      startDate: "2025-07-31",
      endDate: "2025-08-07",
      duration: 5,
      effort: 40,
      progress: 100,
      status: "COMPLETED",
      priority: "HIGH",
      resourceId: 1,
      isFixed: true,
      requiredSkills: [5]
    },
    {
      id: 2,
      name: "UI 디자인",
      projectId: 1,
      startDate: "2025-08-07",
      endDate: "2025-08-14",
      duration: 5,
      effort: 40,
      progress: 70,
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      resourceId: 2,
      isFixed: false,
      requiredSkills: [8, 9]
    },
    {
      id: 3,
      name: "프론트엔드 개발",
      projectId: 1,
      startDate: "2025-08-14",
      endDate: "2025-08-28",
      duration: 10,
      effort: 80,
      progress: 40,
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      resourceId: 3,
      isFixed: false,
      requiredSkills: [4, 6, 7]
    },
    {
      id: 4,
      name: "백엔드 개발",
      projectId: 1,
      startDate: "2025-08-14",
      endDate: "2025-09-04",
      duration: 15,
      effort: 120,
      progress: 30,
      status: "IN_PROGRESS",
      priority: "HIGH",
      resourceId: 1,
      isFixed: false,
      requiredSkills: [1, 3, 5]
    },
    {
      id: 5,
      name: "통합 테스트",
      projectId: 1,
      startDate: "2025-09-04",
      endDate: "2025-09-11",
      duration: 5,
      effort: 40,
      progress: 0,
      status: "NOT_STARTED",
      priority: "MEDIUM",
      resourceId: 4,
      isFixed: false,
      requiredSkills: [1, 4, 6]
    },
    {
      id: 6,
      name: "사용자 테스트",
      projectId: 1,
      startDate: "2025-09-11",
      endDate: "2025-09-18",
      duration: 5,
      effort: 40,
      progress: 0,
      status: "NOT_STARTED",
      priority: "LOW",
      resourceId: 2,
      isFixed: false,
      requiredSkills: [9]
    },
    {
      id: 7,
      name: "버그 수정",
      projectId: 1,
      startDate: "2025-09-18",
      endDate: "2025-09-25",
      duration: 5,
      effort: 40,
      progress: 0,
      status: "NOT_STARTED",
      priority: "MEDIUM",
      resourceId: 4,
      isFixed: false,
      requiredSkills: [1, 4, 6]
    },
    {
      id: 8,
      name: "배포",
      projectId: 1,
      startDate: "2025-09-25",
      endDate: "2025-10-02",
      duration: 5,
      effort: 40,
      progress: 0,
      status: "NOT_STARTED",
      priority: "HIGH",
      resourceId: 4,
      isFixed: false,
      requiredSkills: [1, 5]
    }
  ];
  
  // 필터 적용
  let filteredTasks = sampleTasks;
  
  // 날짜 범위 필터
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  filteredTasks = filteredTasks.filter(task => {
    const taskStartDate = new Date(task.startDate);
    const taskEndDate = new Date(task.endDate);
    
    return taskStartDate <= endDateObj && taskEndDate >= startDateObj;
  });
  
  // 프로젝트 ID 필터
  if (projectId) {
    filteredTasks = filteredTasks.filter(task => task.projectId === Number(projectId));
  }
  
  // 팀 ID 필터 (샘플 데이터에서는 단순화)
  if (teamId) {
    const teamResources = [
      { teamId: 1, resourceIds: [1, 3, 4] },
      { teamId: 2, resourceIds: [2] }
    ];
    
    const teamResourcesIds = teamResources
      .find(team => team.teamId === Number(teamId))?.resourceIds || [];
      
    filteredTasks = filteredTasks.filter(task => teamResourcesIds.includes(task.resourceId));
  }
  
  return filteredTasks;
};

// 리소스 ID로 작업 조회
exports.getTasksByResourceIds = async (resourceIds, startDate, endDate) => {
  if (!resourceIds || resourceIds.length === 0) {
    return [];
  }
  
  // 실제 DB 구현시 활성화
  /*
  try {
    const placeholders = resourceIds.map(() => '?').join(',');
    
    let query = `
      SELECT 
        t.id, 
        t.name, 
        t.project_id AS projectId,
        t.start_date AS startDate,
        t.end_date AS endDate,
        t.duration,
        t.effort,
        t.progress,
        t.status,
        t.priority,
        t.resource_id AS resourceId,
        t.is_fixed AS isFixed,
        t.required_skills AS requiredSkills
      FROM 
        tasks t
      WHERE 
        t.resource_id IN (${placeholders}) AND
        t.status != 'CANCELLED'
    `;
    
    const params = [...resourceIds];
    
    // 날짜 범위 필터 (있는 경우)
    if (startDate && endDate) {
      query += ` AND (t.start_date <= ? AND t.end_date >= ?)`;
      params.push(endDate, startDate);
    }
    
    query += ` ORDER BY t.start_date`;
    
    const [rows] = await db.execute(query, params);
    
    // 스킬 ID를 배열로 변환
    return rows.map(task => ({
      ...task,
      requiredSkills: task.requiredSkills ? JSON.parse(task.requiredSkills) : []
    }));
  } catch (error) {
    logger.error(`리소스 ID로 작업 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 기반 구현
  const allTasks = await this.getTasksByDateRange(
    startDate || '2025-01-01', 
    endDate || '2025-12-31', 
    null, 
    null
  );
  
  // 문자열로 들어올 경우 숫자 배열로 변환
  let resourceIdArray = resourceIds;
  if (typeof resourceIds === 'string') {
    resourceIdArray = resourceIds.split(',').map(id => Number(id.trim()));
  } else if (typeof resourceIds === 'number') {
    resourceIdArray = [resourceIds];
  }
  
  return allTasks.filter(task => resourceIdArray.includes(task.resourceId));
};

// ID로 작업 조회
exports.getTaskById = async (taskId) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      SELECT 
        t.id, 
        t.name, 
        t.project_id AS projectId,
        t.start_date AS startDate,
        t.end_date AS endDate,
        t.duration,
        t.effort,
        t.progress,
        t.status,
        t.priority,
        t.resource_id AS resourceId,
        t.is_fixed AS isFixed,
        t.required_skills AS requiredSkills,
        t.description,
        p.name AS projectName,
        r.name AS resourceName
      FROM 
        tasks t
      LEFT JOIN
        projects p ON t.project_id = p.id
      LEFT JOIN
        resources r ON t.resource_id = r.id
      WHERE 
        t.id = ?
    `;
    
    const [rows] = await db.execute(query, [taskId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const task = rows[0];
    
    // 스킬 ID를 배열로 변환
    task.requiredSkills = task.requiredSkills ? JSON.parse(task.requiredSkills) : [];
    
    return task;
  } catch (error) {
    logger.error(`ID로 작업 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 기반 구현
  const allTasks = await this.getTasksByDateRange('2025-01-01', '2025-12-31', null, null);
  const task = allTasks.find(task => task.id === Number(taskId));
  
  if (!task) {
    return null;
  }
  
  // 추가 정보
  const projects = [
    { id: 1, name: '작업 부하 최적화 시스템' }
  ];
  
  const resources = [
    { id: 1, name: '김철수' },
    { id: 2, name: '이영희' },
    { id: 3, name: '박지민' },
    { id: 4, name: '최용주' }
  ];
  
  return {
    ...task,
    projectName: projects.find(p => p.id === task.projectId)?.name,
    resourceName: resources.find(r => r.id === task.resourceId)?.name,
    description: `${task.name}에 대한 상세 설명입니다. 이 작업은 프로젝트의 중요한 부분입니다.`
  };
};

// 다수의 ID로 작업 조회
exports.getTasksByIds = async (taskIds) => {
  if (!taskIds || taskIds.length === 0) {
    return [];
  }
  
  // 실제 DB 구현시 활성화
  /*
  try {
    const placeholders = taskIds.map(() => '?').join(',');
    
    const query = `
      SELECT 
        t.id, 
        t.name, 
        t.project_id AS projectId,
        t.start_date AS startDate,
        t.end_date AS endDate,
        t.duration,
        t.effort,
        t.progress,
        t.status,
        t.priority,
        t.resource_id AS resourceId,
        t.is_fixed AS isFixed,
        t.required_skills AS requiredSkills
      FROM 
        tasks t
      WHERE 
        t.id IN (${placeholders})
    `;
    
    const [rows] = await db.execute(query, taskIds);
    
    // 스킬 ID를 배열로 변환
    return rows.map(task => ({
      ...task,
      requiredSkills: task.requiredSkills ? JSON.parse(task.requiredSkills) : []
    }));
  } catch (error) {
    logger.error(`다수의 ID로 작업 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 기반 구현
  const allTasks = await this.getTasksByDateRange('2025-01-01', '2025-12-31', null, null);
  
  if (typeof taskIds === 'string') {
    taskIds = taskIds.split(',').map(id => Number(id.trim()));
  }
  
  return allTasks.filter(task => taskIds.includes(task.id));
};

// 작업 리소스 업데이트
exports.updateTaskResource = async (taskId, newResourceId) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      UPDATE tasks
      SET 
        resource_id = ?,
        updated_at = GETDATE(),
        updated_by = SYSTEM_USER
      WHERE 
        id = ?
    `;
    
    const [result] = await db.execute(query, [newResourceId, taskId]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: '작업을 찾을 수 없음' };
    }
    
    return { success: true, message: '리소스 업데이트 성공' };
  } catch (error) {
    logger.error(`작업 리소스 업데이트 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 구현 (실제 구현 전까지)
  logger.info(`작업 리소스 업데이트 요청: 작업 ID ${taskId}, 새 리소스 ID ${newResourceId}`);
  return { success: true, message: '리소스 업데이트 성공' };
};

// 작업 생성
exports.createTask = async (taskData) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      INSERT INTO tasks (
        name,
        project_id,
        start_date,
        end_date,
        duration,
        effort,
        progress,
        status,
        priority,
        resource_id,
        is_fixed,
        required_skills,
        description,
        created_at,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), SYSTEM_USER)
    `;
    
    const [result] = await db.execute(query, [
      taskData.name,
      taskData.projectId,
      taskData.startDate,
      taskData.endDate,
      taskData.duration,
      taskData.effort,
      taskData.progress || 0,
      taskData.status || 'NOT_STARTED',
      taskData.priority || 'MEDIUM',
      taskData.resourceId,
      taskData.isFixed || false,
      JSON.stringify(taskData.requiredSkills || []),
      taskData.description || null
    ]);
    
    return {
      id: result.insertId,
      ...taskData
    };
  } catch (error) {
    logger.error(`작업 생성 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 구현 (실제 구현 전까지)
  logger.info(`작업 생성 요청: ${JSON.stringify(taskData)}`);
  return {
    id: 999, // 새 ID 가정
    ...taskData
  };
};

// 작업 일괄 생성
exports.createTasksBulk = async (tasksData) => {
  if (!tasksData || tasksData.length === 0) {
    return [];
  }
  
  // 실제 DB 구현시 활성화
  /*
  try {
    const placeholders = tasksData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), SYSTEM_USER)').join(',');
    
    const values = tasksData.flatMap(task => [
      task.name,
      task.projectId,
      task.startDate,
      task.endDate,
      task.duration,
      task.effort,
      task.progress || 0,
      task.status || 'NOT_STARTED',
      task.priority || 'MEDIUM',
      task.resourceId,
      task.isFixed || false,
      JSON.stringify(task.requiredSkills || []),
      task.description || null
    ]);
    
    const query = `
      INSERT INTO tasks (
        name,
        project_id,
        start_date,
        end_date,
        duration,
        effort,
        progress,
        status,
        priority,
        resource_id,
        is_fixed,
        required_skills,
        description,
        created_at,
        created_by
      )
      VALUES ${placeholders}
    `;
    
    const [result] = await db.execute(query, values);
    
    // 생성된 ID 할당
    const startId = result.insertId;
    
    return tasksData.map((task, index) => ({
      id: startId + index,
      ...task
    }));
  } catch (error) {
    logger.error(`작업 일괄 생성 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 구현 (실제 구현 전까지)
  logger.info(`작업 일괄 생성 요청: ${tasksData.length}개 작업`);
  
  return tasksData.map((task, index) => ({
    id: 1000 + index, // 새 ID 가정
    ...task
  }));
};

// 작업 수정
exports.updateTask = async (taskId, taskData) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      UPDATE tasks
      SET 
        name = ?,
        project_id = ?,
        start_date = ?,
        end_date = ?,
        duration = ?,
        effort = ?,
        progress = ?,
        status = ?,
        priority = ?,
        resource_id = ?,
        is_fixed = ?,
        required_skills = ?,
        description = ?,
        updated_at = GETDATE(),
        updated_by = SYSTEM_USER
      WHERE 
        id = ?
    `;
    
    const [result] = await db.execute(query, [
      taskData.name,
      taskData.projectId,
      taskData.startDate,
      taskData.endDate,
      taskData.duration,
      taskData.effort,
      taskData.progress,
      taskData.status,
      taskData.priority,
      taskData.resourceId,
      taskData.isFixed,
      JSON.stringify(taskData.requiredSkills || []),
      taskData.description,
      taskId
    ]);
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return {
      id: taskId,
      ...taskData
    };
  } catch (error) {
    logger.error(`작업 수정 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 구현 (실제 구현 전까지)
  logger.info(`작업 수정 요청: ID ${taskId}, 데이터 ${JSON.stringify(taskData)}`);
  return {
    id: taskId,
    ...taskData
  };
};

// 작업 삭제 (논리적 삭제 - status 변경)
exports.deleteTask = async (taskId) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      UPDATE tasks
      SET 
        status = 'CANCELLED',
        updated_at = GETDATE(),
        updated_by = SYSTEM_USER
      WHERE 
        id = ?
    `;
    
    const [result] = await db.execute(query, [taskId]);
    
    return result.affectedRows > 0;
  } catch (error) {
    logger.error(`작업 삭제 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 구현 (실제 구현 전까지)
  logger.info(`작업 삭제 요청: ID ${taskId}`);
  return true;
};