import axios from 'axios';

// API URL 설정
const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://gantt-c1oh.onrender.com';

console.log('🔔 NotificationService - API_URL:', API_URL);
console.log('🔔 NotificationService - REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

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

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => response,
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

// 알림 서비스
const notificationService = {
  // 알림 목록 조회
  async getNotifications(params = {}) {
    try {
      const { page = 1, limit = 10, read = null, type = null } = params;
      
      let url = `/api/notifications?page=${page}&limit=${limit}`;
      
      if (read !== null) {
        url += `&read=${read}`;
      }
      
      if (type !== null) {
        url += `&type=${type}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 알림 읽음 처리
  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 모든 알림 읽음 처리
  async markAllAsRead() {
    try {
      const response = await api.put('/api/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 알림 설정 조회
  async getNotificationSettings() {
    try {
      const response = await api.get('/api/notifications/settings');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 알림 설정 업데이트
  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/api/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 특정 유형의 알림 활성화/비활성화
  async toggleNotificationType(type, enabled) {
    try {
      const response = await api.put(`/api/notifications/settings/type/${type}`, { enabled });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 특정 채널의 알림 활성화/비활성화
  async toggleNotificationChannel(channel, enabled) {
    try {
      const response = await api.put(`/api/notifications/settings/channel/${channel}`, { enabled });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
};

export default notificationService;
