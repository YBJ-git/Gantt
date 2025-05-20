/**
 * 부하 최적화 액션 생성자
 */
import * as types from '../types/loadOptimizationTypes';
import loadOptimizationService from '../../services/loadOptimizationService';
import { message } from 'antd';

// 부하 데이터 조회
export const fetchLoadData = (params) => async (dispatch) => {
  dispatch({ type: types.FETCH_LOAD_DATA_REQUEST });
  
  try {
    const response = await loadOptimizationService.getLoadData(params);
    dispatch({
      type: types.FETCH_LOAD_DATA_SUCCESS,
      payload: response.data
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: types.FETCH_LOAD_DATA_FAILURE,
      payload: error.message
    });
    message.error('부하 데이터 조회 중 오류가 발생했습니다.');
    throw error;
  }
};

// 리소스별 부하 분석
export const fetchResourceLoad = (params) => async (dispatch) => {
  dispatch({ type: types.FETCH_RESOURCE_LOAD_REQUEST });
  
  try {
    const response = await loadOptimizationService.getResourceLoad(params);
    dispatch({
      type: types.FETCH_RESOURCE_LOAD_SUCCESS,
      payload: response.data
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: types.FETCH_RESOURCE_LOAD_FAILURE,
      payload: error.message
    });
    message.error('리소스별 부하 분석 중 오류가 발생했습니다.');
    throw error;
  }
};

// 부하 최적화 추천 사항
export const fetchOptimizationRecommendations = (params) => async (dispatch) => {
  dispatch({ type: types.FETCH_OPTIMIZATION_RECOMMENDATIONS_REQUEST });
  
  try {
    const response = await loadOptimizationService.getLoadOptimizationRecommendations(params);
    dispatch({
      type: types.FETCH_OPTIMIZATION_RECOMMENDATIONS_SUCCESS,
      payload: response.data
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: types.FETCH_OPTIMIZATION_RECOMMENDATIONS_FAILURE,
      payload: error.message
    });
    message.error('부하 최적화 추천 사항 조회 중 오류가 발생했습니다.');
    throw error;
  }
};

// 작업 자동 재분배
export const autoDistributeTasks = (data) => async (dispatch) => {
  dispatch({ type: types.AUTO_DISTRIBUTE_TASKS_REQUEST });
  
  try {
    const response = await loadOptimizationService.autoDistributeTasks(data);
    dispatch({
      type: types.AUTO_DISTRIBUTE_TASKS_SUCCESS,
      payload: response.data
    });
    message.success('작업 자동 재분배가 완료되었습니다.');
    return response.data;
  } catch (error) {
    dispatch({
      type: types.AUTO_DISTRIBUTE_TASKS_FAILURE,
      payload: error.message
    });
    message.error('작업 자동 재분배 중 오류가 발생했습니다.');
    throw error;
  }
};

// 부하 최적화 적용
export const applyLoadOptimization = (data) => async (dispatch) => {
  dispatch({ type: types.APPLY_LOAD_OPTIMIZATION_REQUEST });
  
  try {
    const response = await loadOptimizationService.applyLoadOptimization(data);
    dispatch({
      type: types.APPLY_LOAD_OPTIMIZATION_SUCCESS,
      payload: response.data
    });
    message.success('부하 최적화가 성공적으로 적용되었습니다.');
    return response.data;
  } catch (error) {
    dispatch({
      type: types.APPLY_LOAD_OPTIMIZATION_FAILURE,
      payload: error.message
    });
    message.error('부하 최적화 적용 중 오류가 발생했습니다.');
    throw error;
  }
};

// 부하 예측 분석
export const predictFutureLoad = (data) => async (dispatch) => {
  dispatch({ type: types.PREDICT_FUTURE_LOAD_REQUEST });
  
  try {
    const response = await loadOptimizationService.predictFutureLoad(data);
    dispatch({
      type: types.PREDICT_FUTURE_LOAD_SUCCESS,
      payload: response.data
    });
    return response.data;
  } catch (error) {
    dispatch({
      type: types.PREDICT_FUTURE_LOAD_FAILURE,
      payload: error.message
    });
    message.error('부하 예측 분석 중 오류가 발생했습니다.');
    throw error;
  }
};

// 날짜 범위 설정
export const setDateRange = (startDate, endDate) => ({
  type: types.SET_DATE_RANGE,
  payload: { startDate, endDate }
});

// 선택된 프로젝트 설정
export const setSelectedProject = (projectId) => ({
  type: types.SET_SELECTED_PROJECT,
  payload: projectId
});

// 선택된 팀 설정
export const setSelectedTeam = (teamId) => ({
  type: types.SET_SELECTED_TEAM,
  payload: teamId
});

// 선택된 리소스 설정
export const setSelectedResources = (resourceIds) => ({
  type: types.SET_SELECTED_RESOURCES,
  payload: resourceIds
});

// 부하 임계값 설정
export const setLoadThreshold = (threshold) => ({
  type: types.SET_LOAD_THRESHOLD,
  payload: threshold
});

// 부하 최적화 상태 초기화
export const resetLoadOptimizationState = () => ({
  type: types.RESET_LOAD_OPTIMIZATION_STATE
});
