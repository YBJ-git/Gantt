import axios from 'axios';

// API URL 설정
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 - 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 에러 메시지 추출 헬퍼 함수
const getErrorMessage = (error) => {
  if (error.response && error.response.data) {
    return error.response.data.message || error.response.data.error || '서버 오류가 발생했습니다.';
  }
  return error.message || '알 수 없는 오류가 발생했습니다.';
};

// 대시보드 서비스
const dashboardService = {
  // 대시보드 데이터 조회
  async getDashboardData() {
    try {
      const response = await api.get('/dashboard/data');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 히트맵 데이터 조회
  async getHeatmapData(startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/dashboard/heatmap?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
};

export default dashboardService;