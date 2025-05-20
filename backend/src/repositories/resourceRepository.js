/**
 * Resource Repository
 * 리소스 관련 데이터베이스 작업
 */
const db = require('../config/database');
const logger = require('../utils/logger');

// 전체 활성 리소스 조회
exports.getAllActiveResources = async () => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      SELECT 
        id, 
        name, 
        type,
        role,
        team_id AS teamId,
        capacity,
        daily_capacity AS dailyCapacity,
        skills,
        is_active AS isActive
      FROM 
        resources
      WHERE 
        is_active = 1
      ORDER BY 
        name
    `;
    
    const [rows] = await db.execute(query);
    
    return rows;
  } catch (error) {
    logger.error(`전체 활성 리소스 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 반환 (실제 구현 전까지)
  return [
    { 
      id: 1, 
      name: '김철수', 
      type: '개발자',
      role: '백엔드 개발자',
      teamId: 1,
      capacity: 40, 
      dailyCapacity: 8,
      skills: [1, 3, 5], // 예: 자바, SQL, API 개발
      isActive: true
    },
    { 
      id: 2, 
      name: '이영희', 
      type: '디자이너',
      role: 'UI/UX 디자이너',
      teamId: 2,
      capacity: 40, 
      dailyCapacity: 8,
      skills: [8, 9, 10], // 예: Figma, 사용자 경험, 그래픽 디자인
      isActive: true
    },
    { 
      id: 3, 
      name: '박지민', 
      type: '개발자',
      role: '프론트엔드 개발자',
      teamId: 1,
      capacity: 40, 
      dailyCapacity: 8,
      skills: [4, 6, 7], // 예: JavaScript, React, CSS
      isActive: true
    },
    { 
      id: 4, 
      name: '최용주', 
      type: '개발자',
      role: '풀스택 개발자',
      teamId: 1,
      capacity: 40, 
      dailyCapacity: 8,
      skills: [1, 3, 4, 5, 6], // 다양한 기술 스택
      isActive: true
    }
  ];
};

// ID로 리소스 조회
exports.getResourceById = async (resourceId) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      SELECT 
        id, 
        name, 
        type,
        role,
        team_id AS teamId,
        capacity,
        daily_capacity AS dailyCapacity,
        skills,
        is_active AS isActive
      FROM 
        resources
      WHERE 
        id = ?
    `;
    
    const [rows] = await db.execute(query, [resourceId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  } catch (error) {
    logger.error(`ID로 리소스 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 반환 (실제 구현 전까지)
  const resources = await this.getAllActiveResources();
  return resources.find(r => r.id === Number(resourceId)) || null;
};

// 다수의 ID로 리소스 조회
exports.getResourcesByIds = async (resourceIds) => {
  if (!resourceIds || resourceIds.length === 0) {
    return [];
  }
  
  // 실제 DB 구현시 활성화
  /*
  try {
    const placeholders = resourceIds.map(() => '?').join(',');
    
    const query = `
      SELECT 
        id, 
        name, 
        type,
        role,
        team_id AS teamId,
        capacity,
        daily_capacity AS dailyCapacity,
        skills,
        is_active AS isActive
      FROM 
        resources
      WHERE 
        id IN (${placeholders})
    `;
    
    const [rows] = await db.execute(query, resourceIds);
    
    return rows;
  } catch (error) {
    logger.error(`다수의 ID로 리소스 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 반환 (실제 구현 전까지)
  const resources = await this.getAllActiveResources();
  
  if (typeof resourceIds === 'string') {
    resourceIds = resourceIds.split(',').map(id => Number(id.trim()));
  }
  
  return resources.filter(r => resourceIds.includes(r.id));
};

// 팀 ID로 리소스 조회
exports.getResourcesByTeamId = async (teamId) => {
  if (!teamId) {
    return [];
  }
  
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      SELECT 
        id, 
        name, 
        type,
        role,
        team_id AS teamId,
        capacity,
        daily_capacity AS dailyCapacity,
        skills,
        is_active AS isActive
      FROM 
        resources
      WHERE 
        team_id = ? AND
        is_active = 1
    `;
    
    const [rows] = await db.execute(query, [teamId]);
    
    return rows;
  } catch (error) {
    logger.error(`팀 ID로 리소스 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 반환 (실제 구현 전까지)
  const resources = await this.getAllActiveResources();
  return resources.filter(r => r.teamId === Number(teamId));
};

// 리소스 생성
exports.createResource = async (resourceData) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      INSERT INTO resources (
        name,
        type,
        role,
        team_id,
        capacity,
        daily_capacity,
        skills,
        is_active,
        created_at,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), SYSTEM_USER)
    `;
    
    const [result] = await db.execute(query, [
      resourceData.name,
      resourceData.type,
      resourceData.role,
      resourceData.teamId,
      resourceData.capacity,
      resourceData.dailyCapacity,
      JSON.stringify(resourceData.skills || []),
      resourceData.isActive || true
    ]);
    
    return {
      id: result.insertId,
      ...resourceData
    };
  } catch (error) {
    logger.error(`리소스 생성 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 구현 (실제 구현 전까지)
  logger.info(`리소스 생성 요청: ${JSON.stringify(resourceData)}`);
  return {
    id: 999, // 새 ID 가정
    ...resourceData
  };
};

// 리소스 수정
exports.updateResource = async (resourceId, resourceData) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      UPDATE resources
      SET
        name = ?,
        type = ?,
        role = ?,
        team_id = ?,
        capacity = ?,
        daily_capacity = ?,
        skills = ?,
        is_active = ?,
        updated_at = GETDATE(),
        updated_by = SYSTEM_USER
      WHERE
        id = ?
    `;
    
    const [result] = await db.execute(query, [
      resourceData.name,
      resourceData.type,
      resourceData.role,
      resourceData.teamId,
      resourceData.capacity,
      resourceData.dailyCapacity,
      JSON.stringify(resourceData.skills || []),
      resourceData.isActive,
      resourceId
    ]);
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return {
      id: resourceId,
      ...resourceData
    };
  } catch (error) {
    logger.error(`리소스 수정 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 구현 (실제 구현 전까지)
  logger.info(`리소스 수정 요청: ID ${resourceId}, 데이터 ${JSON.stringify(resourceData)}`);
  return {
    id: resourceId,
    ...resourceData
  };
};

// 리소스 부하 데이터 가져오기
exports.getResourceLoadData = async (resourceId, startDate, endDate) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      SELECT 
        resource_id AS resourceId,
        date,
        load,
        capacity,
        workload
      FROM 
        resource_daily_load
      WHERE 
        resource_id = ? AND
        date BETWEEN ? AND ?
      ORDER BY 
        date
    `;
    
    const [rows] = await db.execute(query, [resourceId, startDate, endDate]);
    
    return rows;
  } catch (error) {
    logger.error(`리소스 부하 데이터 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 반환 (실제 구현 전까지)
  const dates = [];
  const loadData = [];
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 날짜 범위 생성
  const currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // 샘플 부하 데이터 생성
  return dates.map(date => {
    const dateString = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // 주말은 0 부하, 주중은 랜덤 부하
    const load = isWeekend ? 0 : Math.floor(Math.random() * 100) + 20;
    
    return {
      resourceId: resourceId,
      date: dateString,
      load: load,
      capacity: 100,
      workload: load / 100
    };
  });
};

// 리소스 스킬 조회
exports.getResourceSkills = async (resourceId) => {
  // 실제 DB 구현시 활성화
  /*
  try {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.category,
        rs.proficiency_level AS proficiencyLevel
      FROM 
        resource_skills rs
      JOIN
        skills s ON rs.skill_id = s.id
      WHERE 
        rs.resource_id = ?
    `;
    
    const [rows] = await db.execute(query, [resourceId]);
    
    return rows;
  } catch (error) {
    logger.error(`리소스 스킬 조회 오류: ${error.message}`);
    throw error;
  }
  */
  
  // 샘플 데이터 반환 (실제 구현 전까지)
  const skillsMap = {
    1: { id: 1, name: '자바', category: '프로그래밍 언어', proficiencyLevel: 5 },
    3: { id: 3, name: 'SQL', category: '데이터베이스', proficiencyLevel: 4 },
    4: { id: 4, name: 'JavaScript', category: '프로그래밍 언어', proficiencyLevel: 4 },
    5: { id: 5, name: 'API 개발', category: '백엔드', proficiencyLevel: 5 },
    6: { id: 6, name: 'React', category: '프론트엔드', proficiencyLevel: 3 },
    7: { id: 7, name: 'CSS', category: '프론트엔드', proficiencyLevel: 4 },
    8: { id: 8, name: 'Figma', category: '디자인', proficiencyLevel: 5 },
    9: { id: 9, name: '사용자 경험', category: '디자인', proficiencyLevel: 4 },
    10: { id: 10, name: '그래픽 디자인', category: '디자인', proficiencyLevel: 4 }
  };
  
  // 리소스별 스킬 매핑
  const resourceSkills = {
    1: [1, 3, 5],
    2: [8, 9, 10],
    3: [4, 6, 7],
    4: [1, 3, 4, 5, 6]
  };
  
  const skills = resourceSkills[resourceId] || [];
  return skills.map(skillId => skillsMap[skillId]);
};