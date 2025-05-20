/**
 * 리소스 할당 및 부하 관리 유틸리티
 * 리소스 할당량 검증 및 부하 최적화 기능을 제공합니다.
 */

/**
 * 리소스 할당량 검증
 * @param {Object} resource - 리소스 객체
 * @param {Array} tasks - 해당 리소스에 할당된 작업 목록
 * @param {Date} startDate - 기간 시작일
 * @param {Date} endDate - 기간 종료일
 * @returns {Object} - 검증 결과 (isValid, usage, overloadDays)
 */
export const validateResourceAllocation = (resource, tasks, startDate, endDate) => {
  const capacity = resource.capacity;
  const assignedTasks = tasks.filter(task => task.assignedTo === resource.id);
  
  // 일별 리소스 사용량 계산
  const dailyUsage = calculateDailyResourceUsage(assignedTasks, startDate, endDate);
  
  // 최대 사용량 및 과부하 일수 계산
  let maxUsage = 0;
  const overloadDays = [];
  
  Object.entries(dailyUsage).forEach(([dateStr, usage]) => {
    maxUsage = Math.max(maxUsage, usage);
    
    if (usage > capacity) {
      overloadDays.push({
        date: new Date(dateStr),
        usage,
        overload: usage - capacity
      });
    }
  });
  
  return {
    isValid: maxUsage <= capacity,
    usage: maxUsage,
    usagePercentage: Math.round((maxUsage / capacity) * 100),
    overloadDays
  };
};

/**
 * 일별 리소스 사용량 계산
 * @param {Array} tasks - 작업 목록
 * @param {Date} startDate - 기간 시작일
 * @param {Date} endDate - 기간 종료일
 * @returns {Object} - 일별 사용량
 */
export const calculateDailyResourceUsage = (tasks, startDate, endDate) => {
  const dailyUsage = {};
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 날짜 범위 초기화
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    dailyUsage[dateStr] = 0;
  }
  
  // 각 작업의 일별 사용량 계산
  tasks.forEach(task => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    // 작업 기간과 검사 기간의 교집합 내 일수 계산
    const overlapStart = taskStart < start ? start : taskStart;
    const overlapEnd = taskEnd > end ? end : taskEnd;
    
    if (overlapStart <= overlapEnd) {
      const taskDuration = Math.floor((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1;
      const dailyLoad = 100 / taskDuration; // 작업 부하를 기간으로 균등 분배
      
      for (let d = new Date(overlapStart); d <= overlapEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyUsage[dateStr] += dailyLoad;
      }
    }
  });
  
  return dailyUsage;
};

/**
 * 리소스 과부하 해결을 위한 작업 일정 최적화
 * @param {Array} tasks - 작업 목록
 * @param {Array} resources - 리소스 목록
 * @param {Date} startDate - 기간 시작일
 * @param {Date} endDate - 기간 종료일
 * @returns {Object} - 최적화 결과
 */
export const optimizeWorkload = (tasks, resources, startDate, endDate) => {
  // 최적화 전 상태 저장
  const originalTasks = JSON.parse(JSON.stringify(tasks));
  const beforeMetrics = calculateWorkloadMetrics(tasks, resources, startDate, endDate);
  
  // 캐싱을 통한 성능 최적화
  const resourceCache = new Map();
  resources.forEach(r => resourceCache.set(r.id, r));
  
  // 부하 최적화 로직
  // 1. 우선순위에 따라 작업 정렬
  const sortedTasks = [...tasks].sort((a, b) => {
    // 우선 순위에 따른 정렬 (높음 > 중간 > 낮음)
    const priorityOrder = { '높음': 0, '중간': 1, '낮음': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  // 2. 종속성 체인 분석 (토폴로지 정렬)
  const taskDependencyChains = analyzeTaskDependencies(sortedTasks);
  
  // 3. 각 체인에 대해 작업 재정렬
  const optimizedTasks = rearrangeTasks(sortedTasks, taskDependencyChains, resourceCache, startDate, endDate);
  
  // 4. 재정렬된 작업으로 지표 계산
  const afterMetrics = calculateWorkloadMetrics(optimizedTasks, resources, startDate, endDate);
  
  return {
    before: beforeMetrics,
    after: afterMetrics,
    optimizedWorkload: optimizedTasks,
    improvement: {
      maxWorkload: beforeMetrics.maxWorkload - afterMetrics.maxWorkload,
      stdDeviation: beforeMetrics.stdDeviation - afterMetrics.stdDeviation
    }
  };
};

/**
 * 작업 종속성 분석 및 토폴로지 정렬
 * @param {Array} tasks - 작업 목록
 * @returns {Array} - 종속성 체인 배열
 */
const analyzeTaskDependencies = (tasks) => {
  // 구현 필요 (토폴로지 정렬 알고리즘)
  // 이 함수는 작업 간의 종속성을 분석하여 종속성 체인(DAG)을 구성합니다.
  return []; // 임시 반환 값
};

/**
 * 작업 재정렬
 * @param {Array} tasks - 작업 목록
 * @param {Array} dependencyChains - 종속성 체인
 * @param {Map} resourceCache - 리소스 캐시
 * @param {Date} startDate - 기간 시작일
 * @param {Date} endDate - 기간 종료일
 * @returns {Array} - 최적화된 작업 목록
 */
const rearrangeTasks = (tasks, dependencyChains, resourceCache, startDate, endDate) => {
  // 구현 필요 (리소스 레벨링 알고리즘)
  // 이 함수는 리소스 사용을 평준화하도록 작업 일정을 조정합니다.
  return tasks; // 임시 반환 값
};

/**
 * 작업 부하 지표 계산
 * @param {Array} tasks - 작업 목록
 * @param {Array} resources - 리소스 목록
 * @param {Date} startDate - 기간 시작일
 * @param {Date} endDate - 기간 종료일
 * @returns {Object} - 부하 지표
 */
const calculateWorkloadMetrics = (tasks, resources, startDate, endDate) => {
  // 각 리소스별 일일 사용량 계산
  const resourceUsage = {};
  
  resources.forEach(resource => {
    const assignedTasks = tasks.filter(task => task.assignedTo === resource.id);
    const dailyUsage = calculateDailyResourceUsage(assignedTasks, startDate, endDate);
    resourceUsage[resource.id] = {
      dailyUsage,
      capacity: resource.capacity
    };
  });
  
  // 최대 부하 및 평균 부하 계산
  let maxWorkload = 0;
  let totalWorkload = 0;
  let dataPoints = 0;
  
  Object.values(resourceUsage).forEach(resUsage => {
    Object.values(resUsage.dailyUsage).forEach(usage => {
      const usagePercentage = (usage / resUsage.capacity) * 100;
      maxWorkload = Math.max(maxWorkload, usagePercentage);
      totalWorkload += usagePercentage;
      dataPoints++;
    });
  });
  
  const avgWorkload = dataPoints > 0 ? totalWorkload / dataPoints : 0;
  
  // 표준편차 계산
  let sumSquaredDiff = 0;
  
  Object.values(resourceUsage).forEach(resUsage => {
    Object.values(resUsage.dailyUsage).forEach(usage => {
      const usagePercentage = (usage / resUsage.capacity) * 100;
      const diff = usagePercentage - avgWorkload;
      sumSquaredDiff += diff * diff;
    });
  });
  
  const variance = dataPoints > 0 ? sumSquaredDiff / dataPoints : 0;
  const stdDeviation = Math.sqrt(variance);
  
  return {
    maxWorkload,
    avgWorkload,
    stdDeviation,
    resourceUsage
  };
};
