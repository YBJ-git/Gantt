// src/redux/selectors/loadOptimizationSelectors.js

// 리소스 부하 데이터 선택자
export const selectResourceLoadData = (state) => state.loadOptimization.resourceLoadData;

// 시간별 부하 데이터 선택자
export const selectTimelineLoadData = (state) => state.loadOptimization.timelineLoadData;

// 부하 최적화 추천 선택자
export const selectRecommendations = (state) => state.loadOptimization.recommendations;

// 작업 분배 결과 선택자
export const selectDistributionResult = (state) => state.loadOptimization.distributionResult;

// 로딩 상태 선택자
export const selectIsLoadingResourceData = (state) => state.loadOptimization.loadingResourceData;
export const selectIsLoadingRecommendations = (state) => state.loadOptimization.loadingRecommendations;
export const selectIsApplyingRecommendation = (state) => state.loadOptimization.applyingRecommendation;
export const selectIsRunningDistribution = (state) => state.loadOptimization.runningDistribution;

// 에러 상태 선택자
export const selectError = (state) => state.loadOptimization.error;

// 리소스별 최대 부하 선택자
export const selectMaxLoadByResource = (state) => {
  const resourceLoadData = selectResourceLoadData(state);
  
  const maxLoadByResource = {};
  
  resourceLoadData.forEach(resourceLoad => {
    const { resourceId, load } = resourceLoad;
    
    if (!maxLoadByResource[resourceId] || load > maxLoadByResource[resourceId]) {
      maxLoadByResource[resourceId] = load;
    }
  });
  
  return maxLoadByResource;
};

// 리소스별 부하 상태 선택자 (정상, 경고, 심각)
export const selectResourceLoadStatus = (state, warningThreshold = 70, criticalThreshold = 90) => {
  const resourceLoadData = selectResourceLoadData(state);
  const maxLoadByResource = selectMaxLoadByResource(state);
  
  const statusByResource = {};
  
  Object.entries(maxLoadByResource).forEach(([resourceId, maxLoad]) => {
    let status = 'normal';
    
    if (maxLoad >= criticalThreshold) {
      status = 'critical';
    } else if (maxLoad >= warningThreshold) {
      status = 'warning';
    }
    
    statusByResource[resourceId] = status;
  });
  
  return statusByResource;
};

// 전체 부하 통계 선택자
export const selectLoadStatistics = (state) => {
  const resourceLoadData = selectResourceLoadData(state);
  
  if (!resourceLoadData.length) {
    return {
      averageLoad: 0,
      maxLoad: 0,
      minLoad: 0,
      overloadedResourcesCount: 0,
      totalResourcesCount: 0
    };
  }
  
  const loads = resourceLoadData.map(item => item.load);
  const sum = loads.reduce((acc, load) => acc + load, 0);
  const maxLoad = Math.max(...loads);
  const minLoad = Math.min(...loads);
  const averageLoad = sum / loads.length;
  
  // 과부하 리소스 개수 (부하가 80% 이상)
  const overloadedResourcesCount = loads.filter(load => load >= 80).length;
  
  return {
    averageLoad,
    maxLoad,
    minLoad,
    overloadedResourcesCount,
    totalResourcesCount: resourceLoadData.length
  };
};