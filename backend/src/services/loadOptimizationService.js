/**
 * Load Optimization Service
 * 작업 부하 최적화 관련 비즈니스 로직
 */
const loadOptimizationRepository = require('../repositories/loadOptimizationRepository');
const resourceRepository = require('../repositories/resourceRepository');
const taskRepository = require('../repositories/taskRepository');
const { calculateWorkingDays, isWeekend } = require('../utils/dateUtils');
const logger = require('../utils/logger');

// 부하 데이터 조회
exports.getLoadData = async (startDate, endDate, projectId, teamId) => {
  try {
    // 기본 날짜 범위 설정 (지정되지 않은 경우)
    if (!startDate || !endDate) {
      const today = new Date();
      startDate = startDate || new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
      endDate = endDate || new Date(today.setDate(today.getDate() + 60)).toISOString().split('T')[0];
    }
    
    // 1. 해당 기간의 작업 데이터 조회
    const tasks = await taskRepository.getTasksByDateRange(startDate, endDate, projectId, teamId);
    
    // 2. 리소스 정보 조회
    const resourceIds = [...new Set(tasks.map(task => task.resourceId))];
    const resources = await resourceRepository.getResourcesByIds(resourceIds);
    
    // 3. 부하 데이터 계산
    const loadData = calculateLoadData(tasks, resources, startDate, endDate);
    
    return loadData;
  } catch (error) {
    logger.error(`부하 데이터 조회 서비스 오류: ${error.message}`);
    throw error;
  }
};

// 리소스별 부하 분석
exports.getResourceLoad = async (resourceIds, startDate, endDate) => {
  try {
    // 리소스 ID가 지정되지 않은 경우 모든 리소스 조회
    let resources = [];
    if (!resourceIds || resourceIds.length === 0) {
      resources = await resourceRepository.getAllActiveResources();
    } else {
      resources = await resourceRepository.getResourcesByIds(resourceIds);
    }
    
    // 기간 내 작업 조회
    const tasks = await taskRepository.getTasksByResourceIds(resourceIds, startDate, endDate);
    
    // 리소스별 부하 계산
    const resourceLoadData = resources.map(resource => {
      const resourceTasks = tasks.filter(task => task.resourceId === resource.id);
      const loadByDate = calculateResourceLoadByDate(resourceTasks, resource, startDate, endDate);
      
      // 평균 부하 계산
      const totalLoad = loadByDate.reduce((sum, day) => sum + day.load, 0);
      const avgLoad = loadByDate.length > 0 ? totalLoad / loadByDate.length : 0;
      
      // 최대 부하 계산
      const maxLoad = loadByDate.length > 0 ? Math.max(...loadByDate.map(day => day.load)) : 0;
      
      return {
        resourceId: resource.id,
        resourceName: resource.name,
        resourceType: resource.type,
        capacity: resource.capacity,
        avgLoad: parseFloat(avgLoad.toFixed(2)),
        maxLoad: maxLoad,
        loadByDate: loadByDate
      };
    });
    
    return resourceLoadData;
  } catch (error) {
    logger.error(`리소스별 부하 분석 서비스 오류: ${error.message}`);
    throw error;
  }
};

// 부하 최적화 추천 사항
exports.getLoadOptimizationRecommendations = async (projectId, teamId, startDate, endDate, threshold) => {
  try {
    // 1. 부하 데이터 조회
    const loadData = await this.getLoadData(startDate, endDate, projectId, teamId);
    
    // 2. 과부하 리소스 식별
    const overloadedResources = loadData.resourceLoads.filter(resource => {
      // 최대 부하가 임계값을 초과하는 리소스 찾기
      return resource.maxLoad > threshold;
    });
    
    // 3. 부하가 낮은 리소스 식별
    const underutilizedResources = loadData.resourceLoads.filter(resource => {
      // 평균 부하가 임계값의 50% 미만인 리소스 찾기
      return resource.avgLoad < (threshold * 0.5);
    });
    
    // 4. 옮길 수 있는 작업 식별
    const movableTasks = await identifyMovableTasks(overloadedResources, startDate, endDate);
    
    // 5. 최적화 추천 사항 생성
    const recommendations = generateOptimizationRecommendations(
      movableTasks, 
      overloadedResources, 
      underutilizedResources,
      threshold
    );
    
    // 6. 최적화 기록 저장
    const optimizationId = await loadOptimizationRepository.saveOptimizationRecommendations(
      projectId, 
      recommendations, 
      startDate, 
      endDate, 
      threshold
    );
    
    return {
      optimizationId,
      overloadedResources,
      underutilizedResources,
      recommendations
    };
  } catch (error) {
    logger.error(`부하 최적화 추천 서비스 오류: ${error.message}`);
    throw error;
  }
};

// 작업 자동 재분배
exports.autoDistributeTasks = async (projectId, tasks, resources, constraints) => {
  try {
    // 1. 작업 및 리소스 데이터 검증
    if (!tasks || tasks.length === 0 || !resources || resources.length === 0) {
      throw new Error('유효한 작업 및 리소스 데이터가 필요합니다.');
    }
    
    // 2. 최적화 알고리즘 실행
    const redistributionPlan = await optimizeTaskDistribution(tasks, resources, constraints);
    
    // 3. 재분배 계획 결과 분석
    const resultAnalysis = analyzeRedistributionResult(redistributionPlan, resources);
    
    // 4. 재분배 계획 저장
    const redistributionId = await loadOptimizationRepository.saveRedistributionPlan(
      projectId,
      redistributionPlan,
      resultAnalysis
    );
    
    return {
      redistributionId,
      plan: redistributionPlan,
      analysis: resultAnalysis
    };
  } catch (error) {
    logger.error(`작업 자동 재분배 서비스 오류: ${error.message}`);
    throw error;
  }
};

// 부하 최적화 적용
exports.applyLoadOptimization = async (optimizationId, modifications) => {
  try {
    // 1. 최적화 정보 조회
    const optimization = await loadOptimizationRepository.getOptimizationById(optimizationId);
    if (!optimization) {
      throw new Error('존재하지 않는 최적화 ID입니다.');
    }
    
    // 2. 작업 수정 적용
    const updateResults = await Promise.all(modifications.map(async (mod) => {
      return await taskRepository.updateTaskResource(mod.taskId, mod.newResourceId);
    }));
    
    // 3. 적용 결과 저장
    const appliedOptimizationId = await loadOptimizationRepository.saveAppliedOptimization(
      optimizationId,
      modifications,
      updateResults
    );
    
    // 4. 최적화 후 부하 분석
    const postOptimizationLoad = await this.getLoadData(
      optimization.startDate,
      optimization.endDate,
      optimization.projectId,
      null
    );
    
    return {
      appliedOptimizationId,
      modifications,
      postOptimizationLoad
    };
  } catch (error) {
    logger.error(`부하 최적화 적용 서비스 오류: ${error.message}`);
    throw error;
  }
};

// 부하 예측 분석
exports.predictFutureLoad = async (projectId, teamId, startDate, endDate, newTasks) => {
  try {
    // 1. 현재 부하 데이터 조회
    const currentLoadData = await this.getLoadData(startDate, endDate, projectId, teamId);
    
    // 2. 새 작업 추가 시 예상 부하 계산
    const resources = await resourceRepository.getResourcesByTeamId(teamId);
    
    // 3. 새 작업 포함 부하 계산
    const predictedLoadData = calculatePredictedLoad(currentLoadData, resources, newTasks, startDate, endDate);
    
    // 4. 예측 데이터 저장
    const predictionId = await loadOptimizationRepository.savePrediction(
      projectId,
      teamId,
      startDate,
      endDate,
      newTasks,
      predictedLoadData
    );
    
    return {
      predictionId,
      currentLoad: currentLoadData,
      predictedLoad: predictedLoadData,
      difference: calculateLoadDifference(currentLoadData, predictedLoadData)
    };
  } catch (error) {
    logger.error(`부하 예측 분석 서비스 오류: ${error.message}`);
    throw error;
  }
};

// 내부 도우미 함수들

// 리소스별 부하 데이터 계산
function calculateLoadData(tasks, resources, startDate, endDate) {
  // 날짜 범위 생성
  const dateRange = getDateRange(new Date(startDate), new Date(endDate));
  
  // 리소스별 부하 계산
  const resourceLoads = resources.map(resource => {
    const resourceTasks = tasks.filter(task => task.resourceId === resource.id);
    const loadByDate = calculateResourceLoadByDate(resourceTasks, resource, startDate, endDate);
    
    // 평균 부하 계산
    const workingDaysLoad = loadByDate.filter(day => !isWeekend(new Date(day.date)));
    const totalLoad = workingDaysLoad.reduce((sum, day) => sum + day.load, 0);
    const avgLoad = workingDaysLoad.length > 0 ? totalLoad / workingDaysLoad.length : 0;
    
    // 최대 부하 계산
    const maxLoad = workingDaysLoad.length > 0 ? Math.max(...workingDaysLoad.map(day => day.load)) : 0;
    
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      capacity: resource.capacity,
      avgLoad: parseFloat(avgLoad.toFixed(2)),
      maxLoad: maxLoad,
      loadByDate: loadByDate
    };
  });
  
  // 전체 시스템 부하 계산
  const systemLoadByDate = calculateSystemLoadByDate(resourceLoads, dateRange);
  
  return {
    startDate,
    endDate,
    resourceLoads,
    systemLoadByDate
  };
}

// 날짜 범위 배열 생성
function getDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// 리소스별 일자별 부하 계산
function calculateResourceLoadByDate(tasks, resource, startDate, endDate) {
  const dateRange = getDateRange(new Date(startDate), new Date(endDate));
  
  return dateRange.map(date => {
    const dateString = date.toISOString().split('T')[0];
    const dailyTasks = tasks.filter(task => {
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = new Date(task.endDate);
      return date >= taskStartDate && date <= taskEndDate;
    });
    
    // 일일 작업 시간 계산
    let dailyWorkHours = 0;
    dailyTasks.forEach(task => {
      const taskDuration = calculateWorkingDays(new Date(task.startDate), new Date(task.endDate));
      const dailyHours = (task.effort || task.duration) / taskDuration;
      dailyWorkHours += dailyHours;
    });
    
    // 리소스 일일 용량 (기본 8시간)
    const dailyCapacity = resource.dailyCapacity || 8;
    
    // 부하율 계산 (%)
    const load = parseFloat(((dailyWorkHours / dailyCapacity) * 100).toFixed(2));
    
    return {
      date: dateString,
      tasks: dailyTasks.map(t => t.id),
      workHours: dailyWorkHours,
      capacity: dailyCapacity,
      load: load
    };
  });
}

// 시스템 전체 일자별 부하 계산
function calculateSystemLoadByDate(resourceLoads, dateRange) {
  return dateRange.map(date => {
    const dateString = date.toISOString().split('T')[0];
    
    // 해당 날짜의 모든 리소스 부하 데이터 가져오기
    const resourcesLoad = resourceLoads.map(resource => {
      const dayLoad = resource.loadByDate.find(day => day.date === dateString);
      return dayLoad ? dayLoad.load : 0;
    });
    
    // 평균 시스템 부하 계산
    const avgSystemLoad = resourcesLoad.length > 0 ? 
      resourcesLoad.reduce((sum, load) => sum + load, 0) / resourceLoads.length : 0;
    
    return {
      date: dateString,
      load: parseFloat(avgSystemLoad.toFixed(2)),
      resourcesCount: resourceLoads.length,
      overloadedCount: resourcesLoad.filter(load => load > 100).length
    };
  });
}

// 옮길 수 있는 작업 식별
async function identifyMovableTasks(overloadedResources, startDate, endDate) {
  const movableTasks = [];
  
  for (const resource of overloadedResources) {
    // 과부하 날짜 식별
    const overloadedDates = resource.loadByDate
      .filter(day => day.load > 100)
      .map(day => day.date);
    
    // 해당 날짜의 작업 조회
    for (const date of overloadedDates) {
      const dayData = resource.loadByDate.find(day => day.date === date);
      if (dayData && dayData.tasks && dayData.tasks.length > 0) {
        // 작업 상세 정보 조회
        const taskDetails = await taskRepository.getTasksByIds(dayData.tasks);
        
        // 이동 가능한 작업 필터링 (우선순위, 종속성, 전문성 등 고려)
        const movableDayTasks = taskDetails.filter(task => {
          // 이동 가능 여부 판단 로직 (예: 높은 우선순위 작업은 이동하지 않음)
          return task.priority !== 'HIGH' && !task.isFixed;
        }).map(task => ({
          ...task,
          overloadDate: date,
          resourceId: resource.resourceId,
          resourceName: resource.resourceName
        }));
        
        movableTasks.push(...movableDayTasks);
      }
    }
  }
  
  return movableTasks;
}

// 최적화 추천 사항 생성
function generateOptimizationRecommendations(movableTasks, overloadedResources, underutilizedResources, threshold) {
  const recommendations = [];
  
  movableTasks.forEach(task => {
    // 이 작업이 속한 과부하 리소스 찾기
    const sourceResource = overloadedResources.find(r => r.resourceId === task.resourceId);
    
    // 이 작업을 수행할 수 있는 적합한 대상 리소스 찾기
    const suitableTargetResources = underutilizedResources.filter(targetResource => {
      // 1. 같은 리소스 타입인지 확인
      const sameType = targetResource.resourceType === sourceResource.resourceType;
      
      // 2. 필요한 스킬셋이 있는지 확인
      const hasRequiredSkills = task.requiredSkills ? 
        task.requiredSkills.every(skillId => targetResource.skills?.includes(skillId)) : true;
      
      // 3. 해당 날짜에 용량이 있는지 확인
      const overloadDate = task.overloadDate;
      const targetDateLoad = targetResource.loadByDate.find(day => day.date === overloadDate);
      const hasCapacity = targetDateLoad && (targetDateLoad.load + task.effort) <= threshold;
      
      return sameType && hasRequiredSkills && hasCapacity;
    });
    
    if (suitableTargetResources.length > 0) {
      // 가장 적합한 리소스 (가장 부하가 낮은 리소스) 선택
      const bestTargetResource = suitableTargetResources.sort((a, b) => a.avgLoad - b.avgLoad)[0];
      
      // 추천 사항 생성
      recommendations.push({
        taskId: task.id,
        taskName: task.name,
        currentResourceId: task.resourceId,
        currentResourceName: task.resourceName,
        suggestedResourceId: bestTargetResource.resourceId,
        suggestedResourceName: bestTargetResource.resourceName,
        overloadDate: task.overloadDate,
        expectedLoadReduction: parseFloat(((task.effort / sourceResource.capacity) * 100).toFixed(2)),
        reason: `${sourceResource.resourceName}의 과부하(${task.overloadDate}) 해소를 위한 작업 재분배`
      });
    }
  });
  
  return recommendations;
}

// 작업 재분배 최적화 알고리즘
async function optimizeTaskDistribution(tasks, resources, constraints) {
  // 작업 분배 최적화 알고리즘 (휴리스틱 기반)
  const redistributionPlan = [];
  
  // 1. 작업을 우선순위와 마감일로 정렬
  const sortedTasks = [...tasks].sort((a, b) => {
    // 우선순위 점수 (높음=3, 중간=2, 낮음=1)
    const priorityScore = {
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    };
    
    // 우선순위로 먼저 정렬
    const priorityDiff = priorityScore[b.priority] - priorityScore[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // 같은 우선순위면 마감일로 정렬
    return new Date(a.endDate) - new Date(b.endDate);
  });
  
  // 2. 리소스 초기 부하 계산
  const resourceLoad = resources.map(resource => ({
    resourceId: resource.id,
    resourceName: resource.name,
    resourceType: resource.type,
    skills: resource.skills || [],
    capacity: resource.capacity,
    currentLoad: 0,
    assignedTasks: []
  }));
  
  // 3. 제약 조건 적용 (특정 작업은 특정 리소스에만 할당)
  const fixedAssignments = constraints?.fixedAssignments || [];
  
  // 4. 작업 할당
  for (const task of sortedTasks) {
    // 고정 할당이 있는지 확인
    const fixedAssignment = fixedAssignments.find(fa => fa.taskId === task.id);
    
    if (fixedAssignment) {
      // 고정 할당된 리소스에 작업 배정
      const targetResource = resourceLoad.find(r => r.resourceId === fixedAssignment.resourceId);
      if (targetResource) {
        targetResource.assignedTasks.push(task.id);
        targetResource.currentLoad += task.effort || 0;
        
        redistributionPlan.push({
          taskId: task.id,
          taskName: task.name,
          resourceId: targetResource.resourceId,
          resourceName: targetResource.resourceName,
          isFixed: true
        });
      }
    } else {
      // 요구 스킬을 가진 리소스 필터링
      let eligibleResources = resourceLoad.filter(resource => {
        // 작업 유형과 리소스 유형이 일치하는지 확인
        const typeMatch = !task.resourceType || resource.resourceType === task.resourceType;
        
        // 필요 스킬을 보유했는지 확인
        const skillMatch = !task.requiredSkills || task.requiredSkills.length === 0 || 
          task.requiredSkills.every(skillId => resource.skills.includes(skillId));
        
        return typeMatch && skillMatch;
      });
      
      if (eligibleResources.length === 0) {
        // 적합한 리소스가 없으면 모든 리소스 고려
        eligibleResources = resourceLoad;
      }
      
      // 가장 부하가 적은 리소스 선택
      const targetResource = eligibleResources.sort((a, b) => a.currentLoad - b.currentLoad)[0];
      
      // 작업 할당
      targetResource.assignedTasks.push(task.id);
      targetResource.currentLoad += task.effort || 0;
      
      redistributionPlan.push({
        taskId: task.id,
        taskName: task.name,
        resourceId: targetResource.resourceId,
        resourceName: targetResource.resourceName,
        isFixed: false
      });
    }
  }
  
  return redistributionPlan;
}

// 재분배 결과 분석
function analyzeRedistributionResult(redistributionPlan, resources) {
  // 리소스별 할당 작업 수 및 부하 계산
  const resourceStats = resources.map(resource => {
    const assignedTasks = redistributionPlan.filter(item => item.resourceId === resource.id);
    const taskCount = assignedTasks.length;
    
    // 원래 리소스에 할당되어 있던 작업 수
    const originalTaskCount = resource.originalTasks?.length || 0;
    
    // 변화량 계산
    const taskCountChange = taskCount - originalTaskCount;
    
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      taskCount,
      taskCountChange,
      isBalanced: Math.abs(taskCountChange) <= 2 // 작업 수 변화가 2개 이하면 균형 상태로 간주
    };
  });
  
  // 전체 분석 결과
  return {
    totalTasks: redistributionPlan.length,
    resourceStats: resourceStats,
    balanceScore: calculateBalanceScore(resourceStats),
    fixedAssignments: redistributionPlan.filter(item => item.isFixed).length
  };
}

// 부하 균형 점수 계산 (0-100, 높을수록 균형)
function calculateBalanceScore(resourceStats) {
  if (resourceStats.length <= 1) return 100;
  
  // 작업 수 표준편차 계산
  const taskCounts = resourceStats.map(stats => stats.taskCount);
  const avgTaskCount = taskCounts.reduce((sum, count) => sum + count, 0) / taskCounts.length;
  const variance = taskCounts.reduce((sum, count) => sum + Math.pow(count - avgTaskCount, 2), 0) / taskCounts.length;
  const stdDev = Math.sqrt(variance);
  
  // 표준편차가 0이면 완벽한 균형
  if (stdDev === 0) return 100;
  
  // 최대 불균형 (모든 작업이 한 리소스에 집중)
  const worstCase = Math.sqrt(Math.pow(avgTaskCount * resourceStats.length, 2) + Math.pow(0, 2) * (resourceStats.length - 1)) / resourceStats.length;
  
  // 균형 점수 계산 (0-100, 높을수록 균형)
  const balanceScore = 100 * (1 - (stdDev / worstCase));
  
  return Math.max(0, Math.min(100, parseFloat(balanceScore.toFixed(2))));
}

// 부하 예측 계산
function calculatePredictedLoad(currentLoadData, resources, newTasks, startDate, endDate) {
  // 현재 부하 데이터 복사
  const predictedLoadData = JSON.parse(JSON.stringify(currentLoadData));
  
  // 새 작업에 대한 부하 계산 및 추가
  newTasks.forEach(newTask => {
    const resourceId = newTask.resourceId;
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource) {
      // 해당 리소스의 부하 데이터 찾기
      const resourceLoadIndex = predictedLoadData.resourceLoads.findIndex(rl => rl.resourceId === resourceId);
      
      if (resourceLoadIndex >= 0) {
        // 작업 기간 내 날짜별 부하 계산
        const taskStartDate = new Date(newTask.startDate);
        const taskEndDate = new Date(newTask.endDate);
        const workingDays = calculateWorkingDays(taskStartDate, taskEndDate);
        const dailyEffort = newTask.effort / workingDays;
        
        // 리소스 일일 용량
        const dailyCapacity = resource.dailyCapacity || 8;
        
        // 날짜별 부하 업데이트
        const dateRange = getDateRange(taskStartDate, taskEndDate);
        dateRange.forEach(date => {
          if (date < new Date(startDate) || date > new Date(endDate)) return;
          
          const dateString = date.toISOString().split('T')[0];
          const dayIndex = predictedLoadData.resourceLoads[resourceLoadIndex].loadByDate.findIndex(d => d.date === dateString);
          
          if (dayIndex >= 0) {
            const dayData = predictedLoadData.resourceLoads[resourceLoadIndex].loadByDate[dayIndex];
            dayData.workHours += dailyEffort;
            dayData.load = parseFloat(((dayData.workHours / dailyCapacity) * 100).toFixed(2));
            dayData.tasks.push(newTask.id);
          }
        });
        
        // 평균 및 최대 부하 재계산
        const workingDaysLoad = predictedLoadData.resourceLoads[resourceLoadIndex].loadByDate.filter(
          day => !isWeekend(new Date(day.date))
        );
        const totalLoad = workingDaysLoad.reduce((sum, day) => sum + day.load, 0);
        predictedLoadData.resourceLoads[resourceLoadIndex].avgLoad = parseFloat(
          (totalLoad / workingDaysLoad.length).toFixed(2)
        );
        predictedLoadData.resourceLoads[resourceLoadIndex].maxLoad = Math.max(
          ...workingDaysLoad.map(day => day.load)
        );
      }
    }
  });
  
  // 시스템 전체 부하 재계산
  predictedLoadData.systemLoadByDate = calculateSystemLoadByDate(
    predictedLoadData.resourceLoads,
    getDateRange(new Date(startDate), new Date(endDate))
  );
  
  return predictedLoadData;
}

// 부하 차이 계산
function calculateLoadDifference(currentLoadData, predictedLoadData) {
  // 리소스별 부하 차이 계산
  const resourceLoadDiffs = currentLoadData.resourceLoads.map(currentResourceLoad => {
    const predictedResourceLoad = predictedLoadData.resourceLoads.find(
      r => r.resourceId === currentResourceLoad.resourceId
    );
    
    if (predictedResourceLoad) {
      return {
        resourceId: currentResourceLoad.resourceId,
        resourceName: currentResourceLoad.resourceName,
        avgLoadDiff: parseFloat((predictedResourceLoad.avgLoad - currentResourceLoad.avgLoad).toFixed(2)),
        maxLoadDiff: parseFloat((predictedResourceLoad.maxLoad - currentResourceLoad.maxLoad).toFixed(2)),
        overloadedDaysBefore: currentResourceLoad.loadByDate.filter(day => day.load > 100).length,
        overloadedDaysAfter: predictedResourceLoad.loadByDate.filter(day => day.load > 100).length
      };
    }
    
    return null;
  }).filter(diff => diff !== null);
  
  // 시스템 전체 부하 차이 계산
  const systemAvgLoadBefore = currentLoadData.systemLoadByDate.reduce((sum, day) => sum + day.load, 0) / 
    currentLoadData.systemLoadByDate.length;
  
  const systemAvgLoadAfter = predictedLoadData.systemLoadByDate.reduce((sum, day) => sum + day.load, 0) / 
    predictedLoadData.systemLoadByDate.length;
  
  return {
    resourceLoadDiffs,
    systemAvgLoadBefore: parseFloat(systemAvgLoadBefore.toFixed(2)),
    systemAvgLoadAfter: parseFloat(systemAvgLoadAfter.toFixed(2)),
    systemLoadDiff: parseFloat((systemAvgLoadAfter - systemAvgLoadBefore).toFixed(2))
  };
}