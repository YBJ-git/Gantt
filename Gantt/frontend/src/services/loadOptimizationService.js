/**
 * Load Optimization API Service
 * 부하 최적화 관련 API 호출 서비스
 */
import axios from 'axios';
import { message } from 'antd';

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 설정 (토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정 (에러 처리 등)
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 오류 응답 처리
    const errorMessage = error.response?.data?.message || '서버와 통신 중 오류가 발생했습니다.';
    message.error(errorMessage);
    return Promise.reject(error);
  }
);

/**
 * 부하 최적화 API 서비스
 */
const loadOptimizationService = {
  /**
   * 부하 데이터 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
   * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
   * @param {string} params.projectId - 프로젝트 ID
   * @param {string} params.teamId - 팀 ID
   * @returns {Promise} 부하 데이터
   */
  getLoadData: async (params) => {
    try {
      return await apiClient.get('/loadOptimization/data', { params });
    } catch (error) {
      console.error('부하 데이터 조회 오류:', error);
      throw error;
    }
  },

  /**
   * 리소스별 부하 분석
   * @param {Object} params - 조회 파라미터
   * @param {string|Array} params.resourceIds - 리소스 ID 목록 (쉼표로 구분된 문자열 또는 배열)
   * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
   * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
   * @returns {Promise} 리소스별 부하 데이터
   */
  getResourceLoad: async (params) => {
    try {
      // 리소스 ID가 배열인 경우 쉼표로 구분된 문자열로 변환
      const requestParams = { ...params };
      if (Array.isArray(requestParams.resourceIds)) {
        requestParams.resourceIds = requestParams.resourceIds.join(',');
      }
      
      return await apiClient.get('/loadOptimization/resource', { params: requestParams });
    } catch (error) {
      console.error('리소스별 부하 분석 오류:', error);
      throw error;
    }
  },

  /**
   * 부하 최적화 추천 사항
   * @param {Object} params - 조회 파라미터
   * @param {string} params.projectId - 프로젝트 ID
   * @param {string} params.teamId - 팀 ID
   * @param {string} params.startDate - 시작일 (YYYY-MM-DD)
   * @param {string} params.endDate - 종료일 (YYYY-MM-DD)
   * @param {number} params.threshold - 부하 임계값 (기본값: 80)
   * @returns {Promise} 최적화 추천 사항
   */
  getLoadOptimizationRecommendations: async (params) => {
    try {
      return await apiClient.get('/loadOptimization/recommendations', { params });
    } catch (error) {
      console.error('부하 최적화 추천 오류:', error);
      throw error;
    }
  },

  /**
   * 작업 자동 재분배
   * @param {Object} data - 재분배 요청 데이터
   * @param {string} data.projectId - 프로젝트 ID
   * @param {Array} data.tasks - 작업 목록
   * @param {Array} data.resources - 리소스 목록
   * @param {Object} data.constraints - 제약 조건
   * @returns {Promise} 재분배 계획
   */
  autoDistributeTasks: async (data) => {
    try {
      return await apiClient.post('/loadOptimization/autoDistribute', data);
    } catch (error) {
      console.error('작업 자동 재분배 오류:', error);
      throw error;
    }
  },

  /**
   * 부하 최적화 적용
   * @param {Object} data - 최적화 적용 요청 데이터
   * @param {string} data.optimizationId - 최적화 ID
   * @param {Array} data.modifications - 변경 사항 목록
   * @returns {Promise} 적용 결과
   */
  applyLoadOptimization: async (data) => {
    try {
      return await apiClient.post('/loadOptimization/apply', data);
    } catch (error) {
      console.error('부하 최적화 적용 오류:', error);
      throw error;
    }
  },

  /**
   * 부하 예측 분석
   * @param {Object} data - 예측 요청 데이터
   * @param {string} data.projectId - 프로젝트 ID
   * @param {string} data.teamId - 팀 ID
   * @param {string} data.startDate - 시작일 (YYYY-MM-DD)
   * @param {string} data.endDate - 종료일 (YYYY-MM-DD)
   * @param {Array} data.newTasks - 새 작업 목록
   * @returns {Promise} 예측 결과
   */
  predictFutureLoad: async (data) => {
    try {
      return await apiClient.post('/loadOptimization/predict', data);
    } catch (error) {
      console.error('부하 예측 분석 오류:', error);
      throw error;
    }
  }
};

export default loadOptimizationService;
