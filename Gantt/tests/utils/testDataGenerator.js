/**
 * 테스트 데이터 생성기
 * 다양한 테스트 시나리오에 사용할 수 있는 데이터셋 생성
 */

// 고유 ID 생성
const generateId = (prefix, index) => `${prefix}-${index}`;

// 난수 생성 (범위 내 정수)
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 난수 생성 (범위 내 소수, 소수점 2자리)
const getRandomFloat = (min, max) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

// 날짜 생성 (시작일로부터 지정된 일수 이내)
const generateDate = (startDate, maxDaysOffset) => {
  const date = new Date(startDate);
  date.setDate(date.getDate() + getRandomInt(0, maxDaysOffset));
  return date.toISOString().split('T')[0];
};

// 우선순위 랜덤 선택
const getRandomPriority = () => {
  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  return priorities[getRandomInt(0, priorities.length - 1)];
};

// 부서 랜덤 선택
const getRandomDepartment = () => {
  const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance'];
  return departments[getRandomInt(0, departments.length - 1)];
};

// 스킬 랜덤 선택
const getRandomSkills = (maxSkills) => {
  const allSkills = [
    'JavaScript', 'Python', 'Java', 'C#', 'SQL', 'NoSQL',
    'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask',
    'AWS', 'Azure', 'GCP', 'DevOps', 'UI/UX', 'Graphic Design',
    'Content Writing', 'SEO', 'SEM', 'Social Media', 'Analytics',
    'Project Management', 'Agile', 'Scrum', 'Kanban'
  ];
  
  const count = getRandomInt(1, Math.min(maxSkills, allSkills.length));
  const skills = [];
  
  // 중복 없이 스킬 선택
  while (skills.length < count) {
    const skill = allSkills[getRandomInt(0, allSkills.length - 1)];
    if (!skills.includes(skill)) {
      skills.push(skill);
    }
  }
  
  return skills;
};

/**
 * 대용량 데이터셋 생성
 * @param {number} taskCount - 생성할 작업 수
 * @param {number} resourceCount - 생성할 리소스 수
 * @param {object} options - 옵션 설정 (unbalanced: 불균형 할당 여부, overloadFactor: 과부하 계수)
 * @returns {object} 생성된 데이터셋 (작업, 리소스, 할당)
 */
const generateLargeDataset = (taskCount = 100, resourceCount = 20, options = {}) => {
  const { unbalanced = false, overloadFactor = 1 } = options;
  
  // 시작일과 종료일 설정 (현재로부터 +- 90일)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 30);
  
  // 리소스 생성
  const resources = [];
  for (let i = 0; i < resourceCount; i++) {
    resources.push({
      id: generateId('resource', i),
      name: `Resource ${i}`,
      department: getRandomDepartment(),
      skills: getRandomSkills(5),
      capacity: getRandomInt(70, 100),
      dailyCapacity: 8,
      type: getRandomInt(0, 1) === 0 ? 'Human' : 'Material'
    });
  }
  
  // 작업 생성
  const tasks = [];
  for (let i = 0; i < taskCount; i++) {
    // 작업 시작일 및 종료일 생성
    const taskStartDate = generateDate(startDate, 60);
    const taskEndDate = new Date(taskStartDate);
    taskEndDate.setDate(taskEndDate.getDate() + getRandomInt(5, 30));
    
    tasks.push({
      id: generateId('task', i),
      name: `Task ${i}`,
      description: `Description for Task ${i}`,
      startDate: taskStartDate,
      endDate: taskEndDate.toISOString().split('T')[0],
      duration: getRandomInt(1, 20),
      effort: getRandomInt(8, 160),
      progress: getRandomInt(0, 100),
      priority: getRandomPriority(),
      requiredSkills: getRandomSkills(3)
    });
  }
  
  // 작업 할당 생성
  const assignments = [];
  
  if (unbalanced) {
    // 불균형 할당 (일부 리소스에 집중)
    const overloadedResourceCount = Math.max(1, Math.floor(resourceCount * 0.2)); // 20%의 리소스가 과부하
    const overloadedResources = resources.slice(0, overloadedResourceCount);
    
    // 과부하 리소스에 작업 집중 할당
    const tasksPerOverloadedResource = Math.floor(taskCount * 0.7 / overloadedResourceCount); // 70%의 작업을 과부하 리소스에
    
    let assignmentCounter = 0;
    
    // 과부하 리소스에 작업 할당
    for (let i = 0; i < overloadedResourceCount; i++) {
      const resource = overloadedResources[i];
      const assignmentCount = tasksPerOverloadedResource * overloadFactor; // 과부하 계수만큼 더 할당
      
      for (let j = 0; j < assignmentCount && j < taskCount; j++) {
        assignments.push({
          id: generateId('assignment', assignmentCounter++),
          taskId: tasks[j].id,
          resourceId: resource.id,
          workload: getRandomInt(50, 100)
        });
      }
    }
    
    // 나머지 리소스에 남은 작업 할당
    const remainingResources = resources.slice(overloadedResourceCount);
    const tasksPerRemainingResource = Math.ceil((taskCount - (tasksPerOverloadedResource * overloadedResourceCount)) / remainingResources.length);
    
    for (let i = 0; i < remainingResources.length; i++) {
      const resource = remainingResources[i];
      const startIdx = tasksPerOverloadedResource * overloadedResourceCount + (i * tasksPerRemainingResource);
      const endIdx = Math.min(startIdx + tasksPerRemainingResource, taskCount);
      
      for (let j = startIdx; j < endIdx; j++) {
        assignments.push({
          id: generateId('assignment', assignmentCounter++),
          taskId: tasks[j].id,
          resourceId: resource.id,
          workload: getRandomInt(20, 80)
        });
      }
    }
  } else {
    // 균등 할당 (리소스별로 비슷한 수의 작업 할당)
    const tasksPerResource = Math.ceil(taskCount / resourceCount);
    
    let assignmentCounter = 0;
    
    for (let i = 0; i < resourceCount; i++) {
      const resource = resources[i];
      const startIdx = i * tasksPerResource;
      const endIdx = Math.min(startIdx + tasksPerResource, taskCount);
      
      for (let j = startIdx; j < endIdx; j++) {
        assignments.push({
          id: generateId('assignment', assignmentCounter++),
          taskId: tasks[j].id,
          resourceId: resource.id,
          workload: getRandomInt(20, 90)
        });
      }
    }
  }
  
  return {
    tasks,
    resources,
    assignments
  };
};

/**
 * 특정 조건의 테스트 케이스 생성
 * @param {string} caseType - 테스트 케이스 유형 (ex: 'highPriorityOverload', 'skillMismatch')
 * @returns {object} 생성된 테스트 케이스 데이터
 */
const generateTestCase = (caseType) => {
  switch (caseType) {
    case 'highPriorityOverload':
      // 높은 우선순위 작업이 과부하된 시나리오
      return generateLargeDataset(50, 10, {
        unbalanced: true,
        overloadFactor: 2,
        priorityDistribution: { Critical: 0.5, High: 0.3, Medium: 0.1, Low: 0.1 }
      });
      
    case 'skillMismatch':
      // 스킬 불일치가 많은 시나리오
      return {
        ...generateLargeDataset(50, 10),
        skillMismatchRate: 0.7 // 70%의 작업-리소스 조합이 스킬 불일치
      };
      
    case 'deadlinePressure':
      // 마감일이 임박한 작업이 많은 시나리오
      const dataset = generateLargeDataset(50, 10);
      
      // 작업의 30%를 마감일 임박으로 설정
      const tasksToModify = Math.floor(dataset.tasks.length * 0.3);
      for (let i = 0; i < tasksToModify; i++) {
        const task = dataset.tasks[i];
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + getRandomInt(1, 5)); // 1-5일 이내 마감
        task.endDate = endDate.toISOString().split('T')[0];
      }
      
      return dataset;
      
    case 'resourceShortage':
      // 리소스 부족 시나리오 (작업 대비 리소스가 적음)
      return generateLargeDataset(100, 5);
      
    default:
      return generateLargeDataset();
  }
};

// 임의의 데이터 생성 (통계 기반)
const generateRandomData = (mean, stdDev, count) => {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    // 정규 분포에 따른 난수 생성 (Box-Muller 변환)
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    const value = mean + stdDev * z;
    
    data.push(parseFloat(value.toFixed(2)));
  }
  
  return data;
};

module.exports = {
  generateLargeDataset,
  generateTestCase,
  generateRandomData,
  getRandomInt,
  getRandomFloat,
  generateDate,
  getRandomPriority,
  getRandomDepartment,
  getRandomSkills
};
