/**
 * Load Calculation Utilities
 * 작업 부하 계산을 위한 유틸리티 함수들
 */
const { isWeekend, getWorkingDays, calculateWorkingDays } = require('./dateUtils');
const logger = require('./logger');

/**
 * 리소스별 부하 계산
 * @param {Array} tasks - 작업 목록
 * @param {Object} resource - 리소스 정보
 * @param {String} startDate - 시작일 (YYYY-MM-DD)
 * @param {String} endDate - 종료일 (YYYY-MM-DD)
 * @returns {Object} 리소스 부하 데이터
 */
exports.calculateResourceLoad = (tasks, resource, startDate, endDate) => {
  try {
    // 날짜 범위 생성
    const dateRange = this.getDateRange(new Date(startDate), new Date(endDate));
    
    // 일별 부하 계산
    const loadByDate = dateRange.map(date => {
      const dateObj = new Date(date);
      const dateString = dateObj.toISOString().split('T')[0];
      
      // 해당 날짜에 진행 중인 작업 필터링
      const dailyTasks = tasks.filter(task => {
        const taskStartDate = new Date(task.startDate);
        const taskEndDate = new Date(task.endDate);
        return dateObj >= taskStartDate && dateObj <= taskEndDate;
      });
      
      // 일일 작업량 계산
      let dailyWorkHours = 0;
      const assignedTasks = [];
      
      dailyTasks.forEach(task => {
        // 주말 제외 작업 기간 (일)
        const workingDays = calculateWorkingDays(
          new Date(task.startDate), 
          new Date(task.endDate)
        );
        
        // 일별 작업량 (시간)
        let dailyEffort;
        
        if (workingDays === 0) {
          // 작업 기간이 전부 주말인 경우
          dailyEffort = 0;
        } else if (task.effort !== undefined) {
          // 총 작업량을 작업일수로 나누어 일별 작업량 계산
          dailyEffort = task.effort / workingDays;
        } else if (task.duration !== undefined) {
          // 작업 지속 시간을 사용
          dailyEffort = task.duration / workingDays;
        } else {
          // 기본값 설정
          dailyEffort = 8 / workingDays; // 기본 8시간 작업
        }
        
        // 주말인 경우 작업량 0
        if (isWeekend(dateObj) && !task.workOnWeekend) {
          dailyEffort = 0;
        }
        
        // 작업량이 있는 경우에만 추가
        if (dailyEffort > 0) {
          dailyWorkHours += dailyEffort;
          assignedTasks.push({
            id: task.id,
            name: task.name,
            hours: parseFloat(dailyEffort.toFixed(2))
          });
        }
      });
      
      // 리소스 일일 용량 (기본 8시간)
      const dailyCapacity = resource.dailyCapacity || 8;
      
      // 주말인 경우 용량 조정
      const actualCapacity = isWeekend(dateObj) ? 
        (resource.weekendCapacity || 0) : dailyCapacity;
      
      // 부하율 계산 (%)
      const load = parseFloat(((dailyWorkHours / actualCapacity) * 100).toFixed(2));
      
      // 부하 상태 결정
      let loadStatus = 'NORMAL';      // 0-80%
      if (load > 100) {
        loadStatus = 'OVERLOAD';      // 100% 초과
      } else if (load > 80) {
        loadStatus = 'HIGH';          // 80-100%
      } else if (load < 30) {
        loadStatus = 'UNDERUTILIZED'; // 30% 미만
      }
      
      return {
        date: dateString,
        tasks: assignedTasks,
        workHours: parseFloat(dailyWorkHours.toFixed(2)),
        capacity: actualCapacity,
        load: load,
        status: loadStatus
      };
    });
    
    // 평균 부하 계산 (주말 제외)
    const workingDaysLoad = loadByDate.filter(
      day => !isWeekend(new Date(day.date)) || day.capacity > 0
    );
    
    const totalLoad = workingDaysLoad.reduce((sum, day) => sum + day.load, 0);
    const avgLoad = workingDaysLoad.length > 0 ? 
      totalLoad / workingDaysLoad.length : 0;
    
    // 최대 부하 계산
    const maxLoad = workingDaysLoad.length > 0 ? 
      Math.max(...workingDaysLoad.map(day => day.load)) : 0;
    
    // 부하 점수 계산 (0-100, 높을수록 좋음)
    const loadScore = this.calculateLoadScore(workingDaysLoad);
    
    // 과부하/저부하 일수 계산
    const overloadedDays = workingDaysLoad.filter(day => day.load > 100).length;
    const underutilizedDays = workingDaysLoad.filter(day => day.load < 30).length;
    
    return {
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      skills: resource.skills || [],
      capacity: resource.capacity,
      dailyCapacity: resource.dailyCapacity || 8,
      avgLoad: parseFloat(avgLoad.toFixed(2)),
      maxLoad: maxLoad,
      loadScore: loadScore,
      loadByDate: loadByDate,
      summary: {
        totalDays: workingDaysLoad.length,
        overloadedDays: overloadedDays,
        highLoadDays: workingDaysLoad.filter(day => day.load > 80 && day.load <= 100).length,
        normalDays: workingDaysLoad.filter(day => day.load >= 30 && day.load <= 80).length,
        underutilizedDays: underutilizedDays,
        overloadedPercent: parseFloat(((overloadedDays / workingDaysLoad.length) * 100).toFixed(2)),
        underutilizedPercent: parseFloat(((underutilizedDays / workingDaysLoad.length) * 100).toFixed(2))
      }
    };
  } catch (error) {
    logger.error(`리소스 부하 계산 오류: ${error.message}`);
    throw error;
  }
};

/**
 * 시스템 전체 부하 계산
 * @param {Array} resourceLoads - 리소스별 부하 데이터 목록
 * @param {String} startDate - 시작일 (YYYY-MM-DD)
 * @param {String} endDate - 종료일 (YYYY-MM-DD)
 * @returns {Object} 시스템 부하 데이터
 */
exports.calculateSystemLoad = (resourceLoads, startDate, endDate) => {
  try {
    const dateRange = this.getDateRange(new Date(startDate), new Date(endDate));
    
    // 일자별 시스템 부하 계산
    const systemLoadByDate = dateRange.map(date => {
      const dateString = date.toISOString().split('T')[0];
      
      // 해당 날짜의 모든 리소스 부하 데이터 가져오기
      const resourceLoadsForDate = resourceLoads.map(resource => {
        const dayLoad = resource.loadByDate.find(day => day.date === dateString);
        return dayLoad || { load: 0, status: 'NORMAL' };
      });
      
      // 유효한 리소스 수 (용량이 있는 리소스)
      const activeResources = resourceLoadsForDate.filter(day => day.capacity > 0);
      
      // 평균 시스템 부하 계산
      const avgSystemLoad = activeResources.length > 0 ? 
        activeResources.reduce((sum, day) => sum + day.load, 0) / activeResources.length : 0;
      
      // 부하 상태별 리소스 수
      const overloadedCount = activeResources.filter(day => day.load > 100).length;
      const highLoadCount = activeResources.filter(day => day.load > 80 && day.load <= 100).length;
      const normalCount = activeResources.filter(day => day.load >= 30 && day.load <= 80).length;
      const underutilizedCount = activeResources.filter(day => day.load < 30).length;
      
      // 시스템 부하 상태 결정
      let systemStatus = 'NORMAL';
      
      // 과부하 리소스가 30% 이상이면 시스템 과부하
      if (overloadedCount > 0 && (overloadedCount / activeResources.length) >= 0.3) {
        systemStatus = 'OVERLOAD';
      } 
      // 고부하 리소스가 50% 이상이면 시스템 고부하
      else if (highLoadCount > 0 && ((highLoadCount + overloadedCount) / activeResources.length) >= 0.5) {
        systemStatus = 'HIGH';
      }
      // 저부하 리소스가 50% 이상이면 시스템 저부하
      else if (underutilizedCount > 0 && (underutilizedCount / activeResources.length) >= 0.5) {
        systemStatus = 'UNDERUTILIZED';
      }
      
      return {
        date: dateString,
        load: parseFloat(avgSystemLoad.toFixed(2)),
        status: systemStatus,
        resourcesCount: activeResources.length,
        overloadedCount: overloadedCount,
        highLoadCount: highLoadCount,
        normalCount: normalCount,
        underutilizedCount: underutilizedCount
      };
    });
    
    // 시스템 부하 요약 계산
    const workingDaysLoad = systemLoadByDate.filter(
      day => !isWeekend(new Date(day.date)) || day.resourcesCount > 0
    );
    
    const totalLoad = workingDaysLoad.reduce((sum, day) => sum + day.load, 0);
    const avgLoad = workingDaysLoad.length > 0 ? 
      totalLoad / workingDaysLoad.length : 0;
    
    // 최대 부하 계산
    const maxLoad = workingDaysLoad.length > 0 ? 
      Math.max(...workingDaysLoad.map(day => day.load)) : 0;
    
    // 부하 점수 계산 (0-100, 높을수록 균형)
    const loadScore = this.calculateSystemLoadScore(workingDaysLoad);
    
    // 부하 상태별 일수 계산
    const overloadedDays = workingDaysLoad.filter(day => day.status === 'OVERLOAD').length;
    const highLoadDays = workingDaysLoad.filter(day => day.status === 'HIGH').length;
    const normalDays = workingDaysLoad.filter(day => day.status === 'NORMAL').length;
    const underutilizedDays = workingDaysLoad.filter(day => day.status === 'UNDERUTILIZED').length;
    
    return {
      startDate,
      endDate,
      avgLoad: parseFloat(avgLoad.toFixed(2)),
      maxLoad: maxLoad,
      loadScore: loadScore,
      systemLoadByDate: systemLoadByDate,
      summary: {
        totalDays: workingDaysLoad.length,
        overloadedDays: overloadedDays,
        highLoadDays: highLoadDays,
        normalDays: normalDays,
        underutilizedDays: underutilizedDays,
        balanceIndex: parseFloat(loadScore.toFixed(2)), // 부하 균형 지수 (높을수록 균형)
        healthScore: parseFloat(((normalDays / workingDaysLoad.length) * 100).toFixed(2)) // 시스템 건강도
      }
    };
  } catch (error) {
    logger.error(`시스템 부하 계산 오류: ${error.message}`);
    throw error;
  }
};

/**
 * 기간별 부하 분석
 * @param {Array} loadData - 부하 데이터 목록
 * @param {String} interval - 분석 간격 (day, week, month)
 * @returns {Array} 기간별 부하 데이터
 */
exports.analyzePeriodicalLoad = (loadData, interval = 'week') => {
  try {
    // 첫 번째와 마지막 날짜 확인
    const dates = loadData.map(item => new Date(item.date));
    const startDate = new Date(Math.min(...dates));
    const endDate = new Date(Math.max(...dates));
    
    // 기간별 데이터 그룹화
    const periodGroups = {};
    
    loadData.forEach(day => {
      const date = new Date(day.date);
      let periodKey;
      
      if (interval === 'day') {
        // 일별 그룹화
        periodKey = date.toISOString().split('T')[0];
      } else if (interval === 'week') {
        // 주별 그룹화 (주의 시작일 기준)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)); // 월요일로 설정
        periodKey = weekStart.toISOString().split('T')[0];
      } else if (interval === 'month') {
        // 월별 그룹화
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        throw new Error(`유효하지 않은 분석 간격: ${interval}`);
      }
      
      if (!periodGroups[periodKey]) {
        periodGroups[periodKey] = [];
      }
      
      periodGroups[periodKey].push(day);
    });
    
    // 기간별 평균 부하 계산
    const periodicalLoad = Object.keys(periodGroups).map(periodKey => {
      const periodData = periodGroups[periodKey];
      const totalLoad = periodData.reduce((sum, day) => sum + day.load, 0);
      const avgLoad = periodData.length > 0 ? totalLoad / periodData.length : 0;
      
      // 기간 내 작업일 수
      const workingDays = periodData.length;
      
      // 상태별 일수
      const overloadedDays = periodData.filter(day => day.status === 'OVERLOAD').length;
      const highLoadDays = periodData.filter(day => day.status === 'HIGH').length;
      const normalDays = periodData.filter(day => day.status === 'NORMAL').length;
      const underutilizedDays = periodData.filter(day => day.status === 'UNDERUTILIZED').length;
      
      // 기간 시작일과 종료일
      const periodStartDate = new Date(Math.min(...periodData.map(d => new Date(d.date))));
      const periodEndDate = new Date(Math.max(...periodData.map(d => new Date(d.date))));
      
      return {
        periodKey,
        startDate: periodStartDate.toISOString().split('T')[0],
        endDate: periodEndDate.toISOString().split('T')[0],
        avgLoad: parseFloat(avgLoad.toFixed(2)),
        maxLoad: Math.max(...periodData.map(day => day.load)),
        workingDays,
        overloadedDays,
        highLoadDays,
        normalDays,
        underutilizedDays,
        overloadedPercent: parseFloat(((overloadedDays / workingDays) * 100).toFixed(2)),
        healthScore: parseFloat(((normalDays / workingDays) * 100).toFixed(2))
      };
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    return periodicalLoad;
  } catch (error) {
    logger.error(`기간별 부하 분석 오류: ${error.message}`);
    throw error;
  }
};

/**
 * 리소스 부하 점수 계산 (0-100, 높을수록 균형)
 * @param {Array} loadByDate - 날짜별 부하 데이터
 * @returns {Number} 부하 점수
 */
exports.calculateLoadScore = (loadByDate) => {
  // 유효 데이터가 없으면 0 반환
  if (!loadByDate || loadByDate.length === 0) {
    return 0;
  }
  
  // 작업이 없는 경우 0 반환
  const hasWork = loadByDate.some(day => day.workHours > 0);
  if (!hasWork) {
    return 0;
  }
  
  // 일별 부하 점수 계산
  const dayScores = loadByDate.map(day => {
    const load = day.load;
    
    // 부하 점수 계산 (0-100, 80% 부하가 100점)
    let score;
    
    if (load <= 0) {
      score = 0; // 작업 없음
    } else if (load <= 30) {
      // 저부하 (30% 미만): 0-50점 선형 증가
      score = (load / 30) * 50;
    } else if (load <= 80) {
      // 적정 부하 (30-80%): 50-100점 선형 증가
      score = 50 + ((load - 30) / 50) * 50;
    } else if (load <= 100) {
      // 고부하 (80-100%): 100-80점 선형 감소
      score = 100 - ((load - 80) / 20) * 20;
    } else {
      // 과부하 (100% 초과): 80-0점 선형 감소, 150% 이상은 0점
      score = Math.max(0, 80 - ((load - 100) / 50) * 80);
    }
    
    return score;
  });
  
  // 평균 부하 점수 계산
  const avgScore = dayScores.reduce((sum, score) => sum + score, 0) / dayScores.length;
  
  return parseFloat(avgScore.toFixed(2));
};

/**
 * 시스템 부하 점수 계산 (0-100, 높을수록 균형)
 * @param {Array} systemLoadByDate - 날짜별 시스템 부하 데이터
 * @returns {Number} 시스템 부하 점수
 */
exports.calculateSystemLoadScore = (systemLoadByDate) => {
  if (!systemLoadByDate || systemLoadByDate.length === 0) {
    return 0;
  }
  
  // 각 날짜의 리소스 간 부하 균형 계산
  const balanceScores = systemLoadByDate.map(day => {
    // 시스템 부하가 적정 범위인지 (30-80%)
    const systemLoad = day.load;
    
    let loadBalanceScore;
    if (systemLoad <= 0) {
      loadBalanceScore = 0; // 작업 없음
    } else if (systemLoad <= 30) {
      // 저부하: 0-60점
      loadBalanceScore = (systemLoad / 30) * 60;
    } else if (systemLoad <= 80) {
      // 적정 부하: 60-100점
      loadBalanceScore = 60 + ((systemLoad - 30) / 50) * 40;
    } else if (systemLoad <= 100) {
      // 고부하: 100-70점
      loadBalanceScore = 100 - ((systemLoad - 80) / 20) * 30;
    } else {
      // 과부하: 70-0점
      loadBalanceScore = Math.max(0, 70 - ((systemLoad - 100) / 50) * 70);
    }
    
    // 리소스 간 부하 편차 (표준편차가 낮을수록 균형)
    const resourceBalance = 1 - (day.overloadedCount + day.underutilizedCount) / day.resourcesCount;
    
    // 종합 균형 점수 계산 (부하 적정성 70%, 리소스 간 균형 30%)
    return (loadBalanceScore * 0.7) + (resourceBalance * 100 * 0.3);
  });
  
  // 평균 균형 점수 계산
  const avgBalanceScore = balanceScores.reduce((sum, score) => sum + score, 0) / balanceScores.length;
  
  return parseFloat(avgBalanceScore.toFixed(2));
};

/**
 * 날짜 범위 배열 생성
 * @param {Date} startDate - 시작일
 * @param {Date} endDate - 종료일
 * @returns {Array} 날짜 배열
 */
exports.getDateRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};