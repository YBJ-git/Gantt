/**
 * 부하 최적화 커스텀 Hook
 */
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLoadData,
  fetchResourceLoad,
  fetchOptimizationRecommendations,
  autoDistributeTasks,
  applyLoadOptimization,
  predictFutureLoad,
  setDateRange,
  setSelectedProject,
  setSelectedTeam,
  setSelectedResources,
  setLoadThreshold,
  resetLoadOptimizationState
} from '../redux/actions/loadOptimizationActions';

/**
 * 부하 최적화 기능에 대한 커스텀 Hook
 * @returns {Object} 부하 최적화 관련 상태 및 액션
 */
export const useLoadOptimization = () => {
  const dispatch = useDispatch();
  
  // Redux 상태 가져오기
  const loadOptimization = useSelector(state => state.loadOptimization);
  
  // 리소스 부하 데이터 조회
  const getLoadData = useCallback((params) => {
    return dispatch(fetchLoadData(params));
  }, [dispatch]);
  
  // 리소스별 부하 분석
  const getResourceLoad = useCallback((params) => {
    return dispatch(fetchResourceLoad(params));
  }, [dispatch]);
  
  // 부하 최적화 추천 사항 조회
  const getOptimizationRecommendations = useCallback((params) => {
    return dispatch(fetchOptimizationRecommendations(params));
  }, [dispatch]);
  
  // 작업 자동 재분배
  const distributeTasksAutomatically = useCallback((data) => {
    return dispatch(autoDistributeTasks(data));
  }, [dispatch]);
  
  // 부하 최적화 적용
  const applyOptimization = useCallback((data) => {
    return dispatch(applyLoadOptimization(data));
  }, [dispatch]);
  
  // 부하 예측 분석
  const predictLoad = useCallback((data) => {
    return dispatch(predictFutureLoad(data));
  }, [dispatch]);
  
  // 날짜 범위 설정
  const updateDateRange = useCallback((startDate, endDate) => {
    dispatch(setDateRange(startDate, endDate));
  }, [dispatch]);
  
  // 선택된 프로젝트 설정
  const updateSelectedProject = useCallback((projectId) => {
    dispatch(setSelectedProject(projectId));
  }, [dispatch]);
  
  // 선택된 팀 설정
  const updateSelectedTeam = useCallback((teamId) => {
    dispatch(setSelectedTeam(teamId));
  }, [dispatch]);
  
  // 선택된 리소스 설정
  const updateSelectedResources = useCallback((resourceIds) => {
    dispatch(setSelectedResources(resourceIds));
  }, [dispatch]);
  
  // 부하 임계값 설정
  const updateLoadThreshold = useCallback((threshold) => {
    dispatch(setLoadThreshold(threshold));
  }, [dispatch]);
  
  // 상태 초기화
  const resetState = useCallback(() => {
    dispatch(resetLoadOptimizationState());
  }, [dispatch]);
  
  // 최적화 추천 사항 적용 처리
  const handleApplyRecommendations = useCallback(async (selectedRecommendations) => {
    if (!loadOptimization.optimizationRecommendations) {
      return;
    }
    
    const optimizationId = loadOptimization.optimizationRecommendations.optimizationId;
    const modifications = selectedRecommendations.map(rec => ({
      taskId: rec.taskId,
      newResourceId: rec.suggestedResourceId
    }));
    
    await applyOptimization({
      optimizationId,
      modifications
    });
    
    // 적용 후 부하 데이터 갱신
    if (loadOptimization.dateRange.startDate && loadOptimization.dateRange.endDate) {
      await getLoadData({
        startDate: loadOptimization.dateRange.startDate,
        endDate: loadOptimization.dateRange.endDate,
        projectId: loadOptimization.selectedProject,
        teamId: loadOptimization.selectedTeam
      });
    }
  }, [
    loadOptimization.optimizationRecommendations,
    loadOptimization.dateRange,
    loadOptimization.selectedProject,
    loadOptimization.selectedTeam,
    applyOptimization,
    getLoadData
  ]);
  
  return {
    // 상태
    loadData: loadOptimization.loadData,
    resourceLoad: loadOptimization.resourceLoad,
    optimizationRecommendations: loadOptimization.optimizationRecommendations,
    redistributionPlan: loadOptimization.redistributionPlan,
    optimizationResult: loadOptimization.optimizationResult,
    loadPrediction: loadOptimization.loadPrediction,
    dateRange: loadOptimization.dateRange,
    selectedProject: loadOptimization.selectedProject,
    selectedTeam: loadOptimization.selectedTeam,
    selectedResources: loadOptimization.selectedResources,
    loadThreshold: loadOptimization.loadThreshold,
    loading: loadOptimization.loading,
    error: loadOptimization.error,
    
    // 액션
    getLoadData,
    getResourceLoad,
    getOptimizationRecommendations,
    distributeTasksAutomatically,
    applyOptimization,
    handleApplyRecommendations,
    predictLoad,
    updateDateRange,
    updateSelectedProject,
    updateSelectedTeam,
    updateSelectedResources,
    updateLoadThreshold,
    resetState
  };
};
