/**
 * Optimization Algorithm Utilities
 * 부하 최적화 알고리즘 관련 유틸리티 함수
 */
const loadCalculationUtils = require('./loadCalculationUtils');
const { calculateWorkingDays, isWeekend } = require('./dateUtils');
const logger = require('./logger');

/**
 * 작업 재분배 최적화
 * @param {Array} tasks - 작업 목록
 * @param {Array} resources - 리소스 목록
 * @param {Object} constraints - 제약 조건
 * @returns {Object} 최적화 결과
 */
exports.optimizeTaskDistribution = (tasks, resources, constraints = {}) => {
  try {
    // 입력 데이터 유효성 검사
    if (!tasks || tasks.length === 0 || !resources || resources.length === 0) {
      throw new Error('유효한 작업 및 리소스 데이터가 필요합니다.');
    }
    
    // 초기 분배 계획
    const initialPlan = this.generateInitialDistribution(tasks, resources, constraints);
    
    // 통계 및 분석
    const initialStats = this.analyzeDistributionPlan(initialPlan, resources);
    
    // 부하 균형 최적화
    const optimizedPlan = this.balanceTaskLoad(initialPlan, resources, constraints);
    
    // 최적화 후 통계 및 분석
    const optimizedStats = this.analyzeDistributionPlan(optimizedPlan, resources);
    
    return {
      plan: optimizedPlan,
      initialStats,
      optimizedStats,
      improvement: {
        balanceScore: optimizedStats.balanceScore - initialStats.balanceScore,
        overloadedResourcesReduction: initialStats.overloadedResources - optimizedStats.overloadedResources,
        underutilizedResourcesReduction: initialStats.underutilizedResources - optimizedStats.underutilizedResources,
        changedAssignments: optimizedPlan.filter(task => 
          !initialPlan.find(initTask => 
            initTask.taskId === task.taskId && initTask.resourceId === task.resourceId
          )
        ).length
      }
    };
  } catch (error) {
    logger.error(`작업 재분배 최적화 오류: ${error.message}`);
    throw error;
  }
};

/**
 * 초기 작업 분배 생성
 * @param {Array} tasks - 작업 목록
 * @param {Array} resources - 리소스 목록
 * @param {Object} constraints - 제약 조건
 * @returns {Array} 초기 작업 분배 계획
 */
exports.generateInitialDistribution = (tasks, resources, constraints = {}) => {
  // 작업 분배 계획
  const distributionPlan = [];
  
  // 고정 할당 작업 (리소스 변경 불가)
  const fixedAssignments = constraints.fixedAssignments || [];
  
  // 작업을 우선순위와 마감일로 정렬
  const sortedTasks = [...tasks].sort((a, b) => {
    // 우선순위 점수 (높음=3, 중간=2, 낮음=1)
    const priorityScore = {
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    };
    
    // 우선순위로 먼저 정렬
    const priorityDiff = priorityScore[b.priority || 'MEDIUM'] - priorityScore[a.priority || 'MEDIUM'];
    if (priorityDiff !== 0) return priorityDiff;
    
    // 같은 우선순위면 마감일로 정렬
    return new Date(a.endDate) - new Date(b.endDate);
  });
  
  // 리소스별 작업 할당 정보 초기화
  const resourceAssignments = resources.map(resource => ({
    resourceId: resource.id,
    resourceName: resource.name,
    resourceType: resource.type,
    skills: resource.skills || [],
    capacity: resource.capacity || 8,
    assignedTasks: [],
    totalLoad: 0
  }));
  
  // 각 작업을 적절한 리소스에 할당
  sortedTasks.forEach(task => {
    // 고정 할당 확인
    const fixedAssignment = fixedAssignments.find(fa => fa.taskId === task.id);
    
    if (fixedAssignment) {
      // 고정 할당된 리소스에 작업 배정
      const targetResourceIdx = resourceAssignments.findIndex(
        r => r.resourceId === fixedAssignment.resourceId
      );
      
      if (targetResourceIdx >= 0) {
        resourceAssignments[targetResourceIdx].assignedTasks.push(task.id);
        resourceAssignments[targetResourceIdx].totalLoad += task.effort || 8;
        
        distributionPlan.push({
          taskId: task.id,
          taskName: task.name,
          priority: task.priority || 'MEDIUM',
          effort: task.effort || 8,
          startDate: task.startDate,
          endDate: task.endDate,
          resourceId: resourceAssignments[targetResourceIdx].resourceId,
          resourceName: resourceAssignments[targetResourceIdx].resourceName,
          isFixed: true,
          reason: '고정 할당 작업'
        });
      }
    } else {
      // 요구 스킬을 가진 적합한 리소스 필터링
      let eligibleResources = resourceAssignments.filter(resource => {
        // 리소스 타입 일치 확인
        const typeMatch = !task.resourceType || resource.resourceType === task.resourceType;
        
        // 필요 스킬 보유 확인
        const skillMatch = !task.requiredSkills || task.requiredSkills.length === 0 || 
          task.requiredSkills.every(skillId => resource.skills.includes(skillId));
        
        return typeMatch && skillMatch;
      });
      
      if (eligibleResources.length === 0) {
        // 적합한 리소스가 없으면 모든 리소스 고려
        eligibleResources = resourceAssignments;
      }
      
      // 가장 부하가 적은 리소스 선택
      const targetResourceIdx = eligibleResources.length > 0 ? 
        resourceAssignments.findIndex(r => r.resourceId === 
          eligibleResources.sort((a, b) => a.totalLoad - b.totalLoad)[0].resourceId
        ) : -1;
      
      if (targetResourceIdx >= 0) {
        resourceAssignments[targetResourceIdx].assignedTasks.push(task.id);
        resourceAssignments[targetResourceIdx].totalLoad += task.effort || 8;
        
        distributionPlan.push({
          taskId: task.id,
          taskName: task.name,
          priority: task.priority || 'MEDIUM',
          effort: task.effort || 8,
          startDate: task.startDate,
          endDate: task.endDate,
          resourceId: resourceAssignments[targetResourceIdx].resourceId,
          resourceName: resourceAssignments[targetResourceIdx].resourceName,
          isFixed: false,
          reason: '자동 할당'
        });
      }
    }
  });
  
  return distributionPlan;
};

/**
 * 부하 균형을 위한 작업 재분배
 * @param {Array} initialPlan - 초기 분배 계획
 * @param {Array} resources - 리소스 목록
 * @param {Object} constraints - 제약 조건
 * @returns {Array} 최적화된 분배 계획
 */
exports.balanceTaskLoad = (initialPlan, resources, constraints = {}) => {
  // 최적화 결과 계획
  let optimizedPlan = [...initialPlan];
  
  // 리소스별 작업 할당
  const resourceLoads = this.calculateResourceLoadsFromPlan(optimizedPlan, resources);
  
  // 불균형 판단 (평균 부하에서 20% 이상 벗어나는 경우)
  const avgLoad = resourceLoads.reduce((sum, r) => sum + r.loadPercent, 0) / resourceLoads.length;
  
  // 과부하 및 저부하 리소스 식별
  const overloadedResources = resourceLoads.filter(r => r.loadPercent > avgLoad * 1.2);
  const underutilizedResources = resourceLoads.filter(r => r.loadPercent < avgLoad * 0.8);
  
  // 최대 반복 횟수 설정
  const maxIterations = 10;
  let iteration = a;
  let improved = true;
  
  // 개선이 없거나 최대 반복 횟수에 도달할 때까지 반복
  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;
    
    // 1. 과부하 리소스에서 저부하 리소스로 작업 이동
    for (const overloadedResource of overloadedResources) {
      // 이동 가능한 작업 찾기 (고정되지 않은 작업)
      const movableTasks = optimizedPlan.filter(task => 
        task.resourceId === overloadedResource.resourceId && !task.isFixed
      );
      
      // 우선순위가 낮은 순서로 정렬
      const sortedTasks = movableTasks.sort((a, b) => {
        const priorityScore = {
          'HIGH': 3,
          'MEDIUM': 2,
          'LOW': 1
        };
        return priorityScore[a.priority] - priorityScore[b.priority];
      });
      
      // 각 작업에 대해 이동 시도
      for (const task of sortedTasks) {
        // 이 작업이 이동될 수 있는 저부하 리소스 찾기
        const suitableResources = underutilizedResources.filter(targetResource => {
          // 타입 일치 확인
          const typeMatch = !task.resourceType || 
            resources.find(r => r.id === targetResource.resourceId)?.type === task.resourceType;
          
          // 스킬 일치 확인
          const requiredSkills = initialPlan.find(t => t.taskId === task.taskId)?.requiredSkills || [];
          const resourceSkills = resources.find(r => r.id === targetResource.resourceId)?.skills || [];
          
          const skillMatch = requiredSkills.length === 0 || 
            requiredSkills.every(skillId => resourceSkills.includes(skillId));
          
          return typeMatch && skillMatch;
        });
        
        if (suitableResources.length > 0) {
          // 가장 부하가 낮은 리소스 선택
          const targetResource = suitableResources.sort((a, b) => a.loadPercent - b.loadPercent)[0];
          
          // 작업 이동
          const taskIndex = optimizedPlan.findIndex(t => t.taskId === task.taskId);
          optimizedPlan[taskIndex] = {
            ...optimizedPlan[taskIndex],
            resourceId: targetResource.resourceId,
            resourceName: resources.find(r => r.id === targetResource.resourceId)?.name,
            reason: `부하 균형을 위한 재분배 (${overloadedResource.resourceName}에서 ${targetResource.resourceName}로)`
          };
          
          // 리소스 부하 업데이트
          overloadedResource.loadPercent -= (task.effort / overloadedResource.capacity) * 100;
          targetResource.loadPercent += (task.effort / targetResource.capacity) * 100;
          
          improved = true;
          break; // 한 번에 하나의 작업만 이동
        }
      }
      
      // 이번 과부하 리소스에서 작업 이동에 성공했으면 다음 과부하 리소스로
      if (improved) break;
    }
    
    // 이번 반복에서 개선이 없으면 종료
    if (!improved) break;
    
    // 리소스 부하 재계산
    const updatedResourceLoads = this.calculateResourceLoadsFromPlan(optimizedPlan, resources);
    
    // 과부하 및 저부하 리소스 다시 식별
    const updatedAvgLoad = updatedResourceLoads.reduce((sum, r) => sum + r.loadPercent, 0) / updatedResourceLoads.length;
    overloadedResources.length = 0;
    underutilizedResources.length = 0;
    
    overloadedResources.push(...updatedResourceLoads.filter(r => r.loadPercent > updatedAvgLoad * 1.2));
    underutilizedResources.push(...updatedResourceLoads.filter(r => r.loadPercent < updatedAvgLoad * 0.8));
  }
  
  return optimizedPlan;
};

/**
 * 분배 계획에서 리소스별 부하 계산
 * @param {Array} plan - 작업 분배 계획
 * @param {Array} resources - 리소스 목록
 * @returns {Array} 리소스별 부하 정보
 */
exports.calculateResourceLoadsFromPlan = (plan, resources) => {
  const resourceLoads = resources.map(resource => {
    // 이 리소스에 할당된 작업 필터링
    const assignedTasks = plan.filter(task => task.resourceId === resource.id);
    
    // 총 작업량
    const totalEffort = assignedTasks.reduce((sum, task) => sum + (task.effort || 0), 0);
    
    // 부하율 계산 (%)
    const loadPercent = ((totalEffort / resource.capacity) * 100) || 0;
    
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      assignedTasks: assignedTasks.map(t => t.taskId),
      taskCount: assignedTasks.length,
      totalEffort,
      capacity: resource.capacity,
      loadPercent: parseFloat(loadPercent.toFixed(2))
    };
  });
  
  return resourceLoads;
};

/**
 * 분배 계획 분석
 * @param {Array} plan - 작업 분배 계획
 * @param {Array} resources - 리소스 목록
 * @returns {Object} 분석 결과
 */
exports.analyzeDistributionPlan = (plan, resources) => {
  // 리소스별 부하 계산
  const resourceLoads = this.calculateResourceLoadsFromPlan(plan, resources);
  
  // 평균 부하 계산
  const totalLoad = resourceLoads.reduce((sum, r) => sum + r.loadPercent, 0);
  const avgLoad = resourceLoads.length > 0 ? totalLoad / resourceLoads.length : 0;
  
  // 부하 표준편차 계산
  const loadVariance = resourceLoads.reduce((sum, r) => sum + Math.pow(r.loadPercent - avgLoad, 2), 0) / resourceLoads.length;
  const loadStdDev = Math.sqrt(loadVariance);
  
  // 과부하 및 저부하 리소스 수
  const overloadedResources = resourceLoads.filter(r => r.loadPercent > 100).length;
  const highLoadResources = resourceLoads.filter(r => r.loadPercent > 80 && r.loadPercent <= 100).length;
  const normalLoadResources = resourceLoads.filter(r => r.loadPercent >= 30 && r.loadPercent <= 80).length;
  const underutilizedResources = resourceLoads.filter(r => r.loadPercent < 30).length;
  
  // 부하 균형 점수 계산 (0-100, 높을수록 균형)
  const maxStdDev = avgLoad; // 최악의 경우 (모든 부하가 한 리소스에 집중)
  const balanceScore = 100 * (1 - (loadStdDev / maxStdDev));
  
  return {
    resourceLoads,
    totalTasks: plan.length,
    fixedTasks: plan.filter(t => t.isFixed).length,
    avgLoad: parseFloat(avgLoad.toFixed(2)),
    loadStdDev: parseFloat(loadStdDev.toFixed(2)),
    overloadedResources,
    highLoadResources,
    normalLoadResources,
    underutilizedResources,
    balanceScore: Math.max(0, Math.min(100, parseFloat(balanceScore.toFixed(2))))
  };
};

/**
 * 작업 이동 추천 생성
 * @param {Array} tasks - 작업 목록
 * @param {Array} resources - 리소스 목록
 * @param {String} startDate - 시작일 (YYYY-MM-DD)
 * @param {String} endDate - 종료일 (YYYY-MM-DD)
 * @param {Number} threshold - 부하 임계값 (기본 80%)
 * @returns {Array} 추천 사항 목록
 */
exports.generateMoveRecommendations = async (tasks, resources, startDate, endDate, threshold = 80) => {
  try {
    // 1. 각 리소스의 부하 계산
    const resourceLoads = [];
    
    for (const resource of resources) {
      // 이 리소스의 작업 필터링
      const resourceTasks = tasks.filter(task => task.resourceId === resource.id);
      
      // 이 리소스의 부하 계산
      const resourceLoad = loadCalculationUtils.calculateResourceLoad(
        resourceTasks, 
        resource, 
        startDate, 
        endDate
      );
      
      resourceLoads.push(resourceLoad);
    }
    
    // 2. 과부하 리소스 식별
    const overloadedResources = resourceLoads.filter(resource => {
      // 임계값을 초과하는 날이 있는 리소스 찾기
      return resource.loadByDate.some(day => day.load > threshold);
    });
    
    // 3. 저부하 리소스 식별
    const underutilizedResources = resourceLoads.filter(resource => {
      // 평균 부하가 임계값의 50% 미만인 리소스 찾기
      return resource.avgLoad < (threshold * 0.5);
    });
    
    // 4. 이동 가능한 작업 식별
    const movableTasks = [];
    
    for (const resource of overloadedResources) {
      // 과부하 날짜 식별
      const overloadedDates = resource.loadByDate
        .filter(day => day.load > threshold)
        .map(day => day.date);
      
      for (const date of overloadedDates) {
        // 해당 날짜에 할당된 작업
        const dailyTasks = resource.loadByDate.find(day => day.date === date)?.tasks || [];
        
        // 작업 상세 정보 조회
        for (const taskInfo of dailyTasks) {
          const taskDetail = tasks.find(t => t.id === taskInfo.id);
          
          if (taskDetail && !taskDetail.isFixed && taskDetail.priority !== 'HIGH') {
            movableTasks.push({
              task: taskDetail,
              overloadDate: date,
              resourceId: resource.resourceId,
              resourceName: resource.resourceName,
              contribution: taskInfo.hours // 이 날짜에 기여하는 작업 시간
            });
          }
        }
      }
    }
    
    // 5. 각 이동 가능 작업에 대해 대상 리소스 찾기
    const recommendations = [];
    
    for (const movableTask of movableTasks) {
      // 이 작업을 수행할 수 있는 적합한 대상 리소스 찾기
      const suitableTargetResources = underutilizedResources.filter(targetResource => {
        // 1. 같은 리소스 타입인지 확인
        const sourceResource = resources.find(r => r.id === movableTask.resourceId);
        const sameType = sourceResource && targetResource.resourceType === sourceResource.resourceType;
        
        // 2. 필요한 스킬셋이 있는지 확인
        const hasRequiredSkills = !movableTask.task.requiredSkills || 
          movableTask.task.requiredSkills.length === 0 ||
          movableTask.task.requiredSkills.every(skillId => 
            targetResource.skills.includes(skillId)
          );
        
        // 3. 해당 날짜에 용량이 있는지 확인
        const overloadDate = movableTask.overloadDate;
        const targetDateLoad = targetResource.loadByDate.find(day => day.date === overloadDate);
        const hasCapacity = targetDateLoad && 
          (targetDateLoad.load + ((movableTask.contribution / targetDateLoad.capacity) * 100)) <= threshold;
        
        return sameType && hasRequiredSkills && hasCapacity;
      });
      
      if (suitableTargetResources.length > 0) {
        // 가장 적합한 리소스 (가장 부하가 낮은 리소스) 선택
        const bestTargetResource = suitableTargetResources.sort((a, b) => a.avgLoad - b.avgLoad)[0];
        
        // 추천 사항 생성
        recommendations.push({
          taskId: movableTask.task.id,
          taskName: movableTask.task.name,
          currentResourceId: movableTask.resourceId,
          currentResourceName: movableTask.resourceName,
          suggestedResourceId: bestTargetResource.resourceId,
          suggestedResourceName: bestTargetResource.resourceName,
          overloadDate: movableTask.overloadDate,
          expectedLoadReduction: parseFloat(
            ((movableTask.contribution / resources.find(r => r.id === movableTask.resourceId).dailyCapacity) * 100).toFixed(2)
          ),
          reason: `${movableTask.resourceName}의 과부하(${movableTask.overloadDate}) 해소를 위한 작업 재분배`
        });
      }
    }
    
    return recommendations;
  } catch (error) {
    logger.error(`작업 이동 추천 생성 오류: ${error.message}`);
    throw error;
  }
};