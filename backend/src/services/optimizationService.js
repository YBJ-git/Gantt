/**
 * Optimization Service
 * 작업 부하 최적화 관련 비즈니스 로직 - 성능 최적화 버전
 */
const sql = require('mssql');
const config = require('../config/config');
const cache = require('../utils/cache');
const { logger, logError } = require('../utils/logger');
const loadOptimizationRepository = require('../repositories/loadOptimizationRepository');
const resourceRepository = require('../repositories/resourceRepository');
const taskRepository = require('../repositories/taskRepository');
const { calculateWorkingDays, isWeekend } = require('../utils/dateUtils');
const optimizationAlgorithm = require('../utils/optimizationAlgorithm');

// 부하 데이터 조회 - 캐싱 적용 버전
exports.getLoadData = async (startDate, endDate, projectId, teamId) => {
  try {
    // 캐시 키 생성
    const cacheKey = `loadData_${startDate}_${endDate}_${projectId || 'all'}_${teamId || 'all'}`;
    
    // 캐시 확인
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      logger.info(`부하 데이터 캐시 적중: ${cacheKey}`);
      return cachedData;
    }
    
    // 기본 날짜 범위 설정 (지정되지 않은 경우)
    if (!startDate || !endDate) {
      const today = new Date();
      startDate = startDate || new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
      endDate = endDate || new Date(today.setDate(today.getDate() + 60)).toISOString().split('T')[0];
    }
    
    // 1. 해당 기간의 작업 데이터 조회 - 최적화된 쿼리 사용
    const tasks = await taskRepository.getTasksByDateRangeOptimized(startDate, endDate, projectId, teamId);
    
    // 2. 리소스 정보 조회 - ID 목록 최적화
    const resourceIds = [...new Set(tasks.map(task => task.resourceId))];
    const resources = await resourceRepository.getResourcesByIdsOptimized(resourceIds);
    
    // 3. 부하 데이터 계산
    const loadData = calculateLoadData(tasks, resources, startDate, endDate);
    
    // 결과 캐싱 (30분)
    await cache.set(cacheKey, loadData, 1800);
    
    return loadData;
  } catch (error) {
    logError(error, { service: 'optimizationService', method: 'getLoadData' });
    throw error;
  }
};

// 리소스별 부하 분석 - 병렬 처리 및 캐싱 적용
exports.getResourceLoad = async (resourceIds, startDate, endDate) => {
  try {
    // 캐시 키 생성
    const resourceIdsKey = resourceIds?.length > 0 ? resourceIds.sort().join('_') : 'all';
    const cacheKey = `resourceLoad_${resourceIdsKey}_${startDate}_${endDate}`;
    
    // 캐시 확인
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      logger.info(`리소스 부하 캐시 적중: ${cacheKey}`);
      return cachedData;
    }
    
    // 리소스 ID가 지정되지 않은 경우 모든 리소스 조회
    let resources = [];
    if (!resourceIds || resourceIds.length === 0) {
      resources = await resourceRepository.getAllActiveResourcesOptimized();
    } else {
      resources = await resourceRepository.getResourcesByIdsOptimized(resourceIds);
    }
    
    // 기간 내 작업 조회 - 한번에 모든 리소스의 작업 조회 (N+1 문제 방지)
    const allResourceIds = resources.map(r => r.id);
    const tasks = await taskRepository.getTasksByResourceIdsOptimized(allResourceIds, startDate, endDate);
    
    // 리소스별 작업 그룹화
    const tasksByResource = {};
    allResourceIds.forEach(id => tasksByResource[id] = []);
    
    tasks.forEach(task => {
      if (tasksByResource[task.resourceId]) {
        tasksByResource[task.resourceId].push(task);
      }
    });
    
    // 병렬 처리로 리소스별 부하 계산
    const resourceLoadData = await Promise.all(resources.map(async (resource) => {
      const resourceTasks = tasksByResource[resource.id] || [];
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
    }));
    
    // 결과 캐싱 (15분)
    await cache.set(cacheKey, resourceLoadData, 900);
    
    return resourceLoadData;
  } catch (error) {
    logError(error, { service: 'optimizationService', method: 'getResourceLoad' });
    throw error;
  }
};

// 부하 최적화 추천 사항 - 성능 최적화 버전
exports.getLoadOptimizationRecommendations = async (projectId, teamId, startDate, endDate, threshold) => {
  try {
    // 1. 부하 데이터 조회 (캐싱 활용)
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
    
    // 4. 옮길 수 있는 작업 식별 - 배치 처리 최적화
    const movableTasks = await identifyMovableTasksOptimized(overloadedResources, startDate, endDate);
    
    // 5. 최적화 추천 사항 생성 - 알고리즘 분리 및 성능 향상
    const recommendations = optimizationAlgorithm.generateRecommendations(
      movableTasks, 
      overloadedResources, 
      underutilizedResources,
      threshold
    );
    
    // 6. 최적화 기록 저장 - 비동기 처리로 응답 시간 단축
    const optimizationId = await loadOptimizationRepository.saveOptimizationRecommendationsOptimized(
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
    logError(error, { service: 'optimizationService', method: 'getLoadOptimizationRecommendations' });
    throw error;
  }
};

// 작업 자동 재분배 - 벌크 처리 최적화
exports.autoDistributeTasks = async (projectId, tasks, resources, constraints) => {
  try {
    // 1. 작업 및 리소스 데이터 검증
    if (!tasks || tasks.length === 0 || !resources || resources.length === 0) {
      throw new Error('유효한 작업 및 리소스 데이터가 필요합니다.');
    }
    
    // 2. 최적화 알고리즘 실행 - 웹 워커 활용
    const redistributionPlan = await optimizationAlgorithm.optimizeTaskDistribution(
      tasks, 
      resources, 
      constraints
    );
    
    // 3. 재분배 계획 결과 분석
    const resultAnalysis = optimizationAlgorithm.analyzeRedistributionResult(
      redistributionPlan, 
      resources
    );
    
    // 4. 재분배 계획 저장 - 배치 처리
    const batchSize = 100; // 한 번에 처리할 최대 항목 수
    const batches = [];
    
    for (let i = 0; i < redistributionPlan.length; i += batchSize) {
      batches.push(redistributionPlan.slice(i, i + batchSize));
    }
    
    // 각 배치 저장 작업을 병렬로 처리
    const saveBatchPromises = batches.map(async (batch, index) => {
      const batchId = `${projectId}_batch_${index}`;
      return await loadOptimizationRepository.saveRedistributionPlanBatch(
        projectId,
        batch,
        batchId
      );
    });
    
    // 모든 배치 저장이 완료될 때까지 대기
    await Promise.all(saveBatchPromises);
    
    // 최종 결과 저장
    const redistributionId = await loadOptimizationRepository.saveRedistributionResult(
      projectId,
      resultAnalysis
    );
    
    return {
      redistributionId,
      plan: redistributionPlan,
      analysis: resultAnalysis
    };
  } catch (error) {
    logError(error, { service: 'optimizationService', method: 'autoDistributeTasks' });
    throw error;
  }
};

// 부하 최적화 적용 - 트랜잭션 처리 추가
exports.applyLoadOptimization = async (optimizationId, modifications) => {
  const pool = await sql.connect(config.database);
  const transaction = new sql.Transaction(pool);
  
  try {
    // 트랜잭션 시작
    await transaction.begin();
    
    // 1. 최적화 정보 조회
    const optimization = await loadOptimizationRepository.getOptimizationById(optimizationId, transaction);
    if (!optimization) {
      throw new Error('존재하지 않는 최적화 ID입니다.');
    }
    
    // 2. 작업 수정 적용 - 벌크 업데이트로 최적화
    const updateResults = await taskRepository.updateTaskResourcesBulk(modifications, transaction);
    
    // 3. 적용 결과 저장
    const appliedOptimizationId = await loadOptimizationRepository.saveAppliedOptimization(
      optimizationId,
      modifications,
      updateResults,
      transaction
    );
    
    // 트랜잭션 커밋
    await transaction.commit();
    
    // 캐시 무효화 - 변경된 데이터에 대한 캐시 삭제
    await cache.invalidatePattern(`loadData_*_*_${optimization.projectId}_*`);
    await cache.invalidatePattern(`resourceLoad_*_*_*`);
    
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
    // 오류 발생 시 트랜잭션 롤백
    if (transaction._aborted) {
      logger.info('Transaction already aborted');
    } else {
      await transaction.rollback();
      logger.info('Transaction rolled back due to error');
    }
    
    logError(error, { service: 'optimizationService', method: 'applyLoadOptimization' });
    throw error;
  } finally {
    // 연결 종료
    if (pool.connected) {
      await pool.close();
    }
  }
};

// 부하 예측 분석 - 스트리밍 처리 최적화
exports.predictFutureLoad = async (projectId, teamId, startDate, endDate, newTasks) => {
  try {
    // 1. 현재 부하 데이터 조회 (캐싱 활용)
    const currentLoadData = await this.getLoadData(startDate, endDate, projectId, teamId);
    
    // 2. 리소스 정보 조회 - 최적화된 메서드 사용
    const resources = await resourceRepository.getResourcesByTeamIdOptimized(teamId);
    
    // 3. 새 작업 포함 부하 계산 - 스트리밍 처리
    const predictedLoadData = calculatePredictedLoadStreaming(
      currentLoadData, 
      resources, 
      newTasks, 
      startDate, 
      endDate
    );
    
    // 4. 차이 계산
    const difference = calculateLoadDifference(currentLoadData, predictedLoadData);
    
    // 5. 예측 데이터 저장 - 비동기 처리 (응답 대기 없음)
    loadOptimizationRepository.savePredictionAsync(
      projectId,
      teamId,
      startDate,
      endDate,
      newTasks,
      predictedLoadData
    ).catch(err => {
      logger.error('예측 데이터 비동기 저장 오류', err);
    });
    
    // 바로 결과 반환
    return {
      predictionId: `prediction_${Date.now()}`, // 임시 ID
      currentLoad: currentLoadData,
      predictedLoad: predictedLoadData,
      difference
    };
  } catch (error) {
    logError(error, { service: 'optimizationService', method: 'predictFutureLoad' });
    throw error;
  }
};

// 워크로드 최적화 실행 - 배치 처리 개선
exports.optimizeWorkloads = async (workloadData, constraints) => {
  try {
    // 캐시 키 생성
    const cacheKey = `optimizeWorkloads_${JSON.stringify(constraints)}_${Date.now().toString().substring(0, 8)}`;
    
    // 결과 캐싱
    const cachedResult = await cache.get(cacheKey);
    if (cachedResult) {
      logger.info(`워크로드 최적화 캐시 적중: ${cacheKey}`);
      return cachedResult;
    }
    
    // 데이터 검증
    if (!workloadData || !workloadData.tasks || !workloadData.resources) {
      throw new Error('유효한 워크로드 데이터가 필요합니다.');
    }
    
    // 알고리즘 실행
    const optimizationResult = await optimizationAlgorithm.optimizeWorkloads(workloadData, constraints);
    
    // 결과 캐싱 (5분)
    await cache.set(cacheKey, optimizationResult, 300);
    
    return optimizationResult;
  } catch (error) {
    logError(error, { service: 'optimizationService', method: 'optimizeWorkloads' });
    throw error;
  }
};

// 워크로드 데이터 배치 업데이트
exports.updateWorkloadsBatch = async (workloads) => {
  const pool = await sql.connect(config.database);
  const transaction = new sql.Transaction(pool);
  
  try {
    // 트랜잭션 시작
    await transaction.begin();
    
    // 1. 테이블 변수 생성
    const table = new sql.Table('Workloads');
    table.create = false;
    table.columns.add('TaskResourceId', sql.Int, {nullable: false});
    table.columns.add('WorkloadValue', sql.Decimal(5, 2), {nullable: false});
    table.columns.add('UpdatedAt', sql.DateTime, {nullable: false});
    
    // 2. 데이터 추가
    workloads.forEach(item => {
      table.rows.add(
        item.taskResourceId,
        item.workloadValue,
        new Date()
      );
    });
    
    // 3. 벌크 업데이트 실행
    const request = new sql.Request(transaction);
    request.bulk(table);
    
    // MERGE 문 실행 (INSERT 또는 UPDATE)
    await request.query(`
      MERGE INTO Workloads AS target
      USING (SELECT TaskResourceId, WorkloadValue, UpdatedAt FROM @workloadsTable) AS source
      ON target.TaskResourceId = source.TaskResourceId
      WHEN MATCHED THEN
        UPDATE SET WorkloadValue = source.WorkloadValue, UpdatedAt = source.UpdatedAt
      WHEN NOT MATCHED THEN
        INSERT (TaskResourceId, WorkloadValue, UpdatedAt)
        VALUES (source.TaskResourceId, source.WorkloadValue, source.UpdatedAt);
    `);
    
    // 트랜잭션 커밋
    await transaction.commit();
    
    // 캐시 무효화
    await cache.invalidatePattern('loadData_*');
    await cache.invalidatePattern('resourceLoad_*');
    
    return { 
      success: true, 
      message: '워크로드가 성공적으로 업데이트되었습니다.', 
      count: workloads.length 
    };
  } catch (error) {
    // 오류 발생 시 롤백
    if (transaction._aborted) {
      logger.info('Transaction already aborted');
    } else {
      await transaction.rollback();
      logger.info('Transaction rolled back due to error');
    }
    
    logError(error, { service: 'optimizationService', method: 'updateWorkloadsBatch' });
    throw error;
  } finally {
    // 연결 종료
    if (pool.connected) {
      await pool.close();
    }
  }
};

// ==================== 내부 도우미 함수 최적화 버전 ====================

// 리소스별 부하 데이터 계산 - 병렬 처리
function calculateLoadData(tasks, resources, startDate, endDate) {
  // 날짜 범위 생성
  const dateRange = getDateRange(new Date(startDate), new Date(endDate));
  
  // 작업을 리소스별로 분류
  const tasksByResource = {};
  resources.forEach(resource => {
    tasksByResource[resource.id] = tasks.filter(task => task.resourceId === resource.id);
  });
  
  // 리소스별 부하 계산 (병렬 처리)
  const resourceLoads = resources.map(resource => {
    const resourceTasks = tasksByResource[resource.id] || [];
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

// 리소스별 일자별 부하 계산 - 메모이제이션 적용
function calculateResourceLoadByDate(tasks, resource, startDate, endDate) {
  const dateRange = getDateRange(new Date(startDate), new Date(endDate));
  const taskDateCache = new Map(); // 메모이제이션
  
  return dateRange.map(date => {
    const dateString = date.toISOString().split('T')[0];
    
    // 해당 날짜의 작업 구하기 (캐싱 활용)
    const dailyTasks = tasks.filter(task => {
      const cacheKey = `${task.id}_${dateString}`;
      
      // 캐시에 있으면 캐시값 반환
      if (taskDateCache.has(cacheKey)) {
        return taskDateCache.get(cacheKey);
      }
      
      // 날짜 계산
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = new Date(task.endDate);
      const isInRange = date >= taskStartDate && date <= taskEndDate;
      
      // 결과 캐싱
      taskDateCache.set(cacheKey, isInRange);
      return isInRange;
    });
    
    // 일일 작업 시간 계산
    let dailyWorkHours = 0;
    dailyTasks.forEach(task => {
      const taskDuration = calculateWorkingDays(new Date(task.startDate), new Date(task.endDate));
      const dailyHours = (task.effort || task.duration) / (taskDuration || 1); // 0으로 나누기 방지
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

// 시스템 전체 일자별 부하 계산 - 성능 최적화
function calculateSystemLoadByDate(resourceLoads, dateRange) {
  // 날짜별 부하를 효율적으로 계산하기 위한 맵 구조 생성
  const loadByDateMap = new Map();
  
  // 모든 날짜에 대한 초기 데이터 설정
  dateRange.forEach(date => {
    const dateString = date.toISOString().split('T')[0];
    loadByDateMap.set(dateString, {
      date: dateString,
      totalLoad: 0,
      resourcesCount: resourceLoads.length,
      overloadedCount: 0
    });
  });
  
  // 리소스별 부하 데이터로 시스템 부하 계산
  resourceLoads.forEach(resource => {
    resource.loadByDate.forEach(dayLoad => {
      const systemDayLoad = loadByDateMap.get(dayLoad.date);
      
      if (systemDayLoad) {
        systemDayLoad.totalLoad += dayLoad.load;
        
        // 과부하 리소스 카운트
        if (dayLoad.load > 100) {
          systemDayLoad.overloadedCount++;
        }
      }
    });
  });
  
  // 결과 변환 및 평균 계산
  return Array.from(loadByDateMap.values()).map(item => {
    return {
      date: item.date,
      load: parseFloat((item.totalLoad / item.resourcesCount || 0).toFixed(2)),
      resourcesCount: item.resourcesCount,
      overloadedCount: item.overloadedCount
    };
  });
}

// 날짜 범위 배열 생성 - 메모리 최적화
function getDateRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const endDateTime = endDate.getTime();
  
  while (currentDate.getTime() <= endDateTime) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// 옮길 수 있는 작업 식별 - 배치 처리 최적화
async function identifyMovableTasksOptimized(overloadedResources, startDate, endDate) {
  // 모든 과부하 날짜와 작업 ID를 수집
  const taskIdsToFetch = new Set();
  const overloadDataByTask = new Map();
  
  // 리소스별 과부하 날짜와 작업 식별
  overloadedResources.forEach(resource => {
    // 과부하 날짜 찾기
    const overloadedDates = resource.loadByDate
      .filter(day => day.load > 100)
      .map(day => day.date);
    
    // 각 과부하 날짜의 작업 수집
    overloadedDates.forEach(date => {
      const dayData = resource.loadByDate.find(day => day.date === date);
      
      if (dayData && dayData.tasks && dayData.tasks.length > 0) {
        dayData.tasks.forEach(taskId => {
          taskIdsToFetch.add(taskId);
          
          // 작업별 과부하 정보 저장
          if (!overloadDataByTask.has(taskId)) {
            overloadDataByTask.set(taskId, {
              overloadDates: [],
              resourceId: resource.resourceId,
              resourceName: resource.resourceName
            });
          }
          
          overloadDataByTask.get(taskId).overloadDates.push(date);
        });
      }
    });
  });
  
  // 모든 작업 정보 한 번에 조회 (N+1 문제 방지)
  const taskIds = Array.from(taskIdsToFetch);
  if (taskIds.length === 0) return [];
  
  const taskDetails = await taskRepository.getTasksByIdsOptimized(taskIds);
  
  // 이동 가능한 작업 필터링
  const movableTasks = taskDetails
    .filter(task => {
      // 이동 가능 여부 판단 로직 (예: 높은 우선순위 작업은 이동하지 않음)
      return task.priority !== 'HIGH' && !task.isFixed;
    })
    .map(task => {
      const overloadInfo = overloadDataByTask.get(task.id);
      if (!overloadInfo) return null;
      
      // 첫 번째 과부하 날짜만 사용
      const firstOverloadDate = overloadInfo.overloadDates[0];
      
      return {
        ...task,
        overloadDate: firstOverloadDate,
        resourceId: overloadInfo.resourceId,
        resourceName: overloadInfo.resourceName
      };
    })
    .filter(task => task !== null);
  
  return movableTasks;
}

// 부하 예측 계산 - 스트리밍 처리
function calculatePredictedLoadStreaming(currentLoadData, resources, newTasks, startDate, endDate) {
  // 현재 부하 데이터 복사 (깊은 복사)
  const predictedLoadData = JSON.parse(JSON.stringify(currentLoadData));
  
  // 리소스별 작업 배치 처리
  const resourceBatches = {};
  
  // 새 작업을 리소스별로 분류
  newTasks.forEach(newTask => {
    const resourceId = newTask.resourceId;
    if (!resourceBatches[resourceId]) {
      resourceBatches[resourceId] = [];
    }
    resourceBatches[resourceId].push(newTask);
  });
  
  // 리소스별로 처리
  Object.keys(resourceBatches).forEach(resourceId => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;
    
    // 해당 리소스의 부하 데이터 찾기
    const resourceLoadIndex = predictedLoadData.resourceLoads.findIndex(rl => rl.resourceId === resourceId);
    if (resourceLoadIndex < 0) return;
    
    // 리소스의 작업들 처리
    const resourceTasks = resourceBatches[resourceId];
    const dailyCapacity = resource.dailyCapacity || 8;
    
    // 날짜별 추가 부하 집계
    const additionalLoadByDate = {};
    
    resourceTasks.forEach(task => {
      const taskStartDate = new Date(task.startDate);
      const taskEndDate = new Date(task.endDate);
      const workingDays = calculateWorkingDays(taskStartDate, taskEndDate);
      const dailyEffort = task.effort / workingDays;
      
      // 날짜별 부하 추가
      const dateRange = getDateRange(taskStartDate, taskEndDate);
      dateRange.forEach(date => {
        if (date < new Date(startDate) || date > new Date(endDate)) return;
        
        const dateString = date.toISOString().split('T')[0];
        
        if (!additionalLoadByDate[dateString]) {
          additionalLoadByDate[dateString] = {
            workHours: 0,
            tasks: []
          };
        }
        
        additionalLoadByDate[dateString].workHours += dailyEffort;
        additionalLoadByDate[dateString].tasks.push(task.id);
      });
    });
    
    // 기존 부하 데이터에 추가 부하 적용
    predictedLoadData.resourceLoads[resourceLoadIndex].loadByDate.forEach(dayData => {
      const additional = additionalLoadByDate[dayData.date];
      if (additional) {
        dayData.workHours += additional.workHours;
        dayData.load = parseFloat(((dayData.workHours / dailyCapacity) * 100).toFixed(2));
        dayData.tasks.push(...additional.tasks);
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
