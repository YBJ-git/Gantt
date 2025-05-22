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

// 작업 관련 서비스
const taskService = {
  // 모든 작업 조회
  async getAllTasks(options = {}) {
    try {
      const { page = 1, limit = 20, status, priority, startDate, endDate, search } = options;
      
      // 쿼리 파라미터 생성
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 특정 작업 조회
  async getTaskById(taskId) {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data.task;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 프로젝트별 작업 조회
  async getTasksByProject(projectId, options = {}) {
    try {
      const { page = 1, limit = 20, status, priority } = options;
      
      // 쿼리 파라미터 생성
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      
      const response = await api.get(`/tasks/project/${projectId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 나에게 할당된 작업 조회
  async getMyTasks(options = {}) {
    try {
      const { page = 1, limit = 20, status, priority } = options;
      
      // 쿼리 파라미터 생성
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      
      const response = await api.get(`/tasks/assigned/me?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 특정 사용자에게 할당된 작업 조회
  async getUserTasks(userId, options = {}) {
    try {
      const { page = 1, limit = 20, status, priority } = options;
      
      // 쿼리 파라미터 생성
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      
      const response = await api.get(`/tasks/assigned/user/${userId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 부서별 작업 조회
  async getDepartmentTasks(departmentId, options = {}) {
    try {
      const { page = 1, limit = 20, status, priority } = options;
      
      // 쿼리 파라미터 생성
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      
      const response = await api.get(`/tasks/department/${departmentId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 공개 작업 조회
  async getPublicTasks(options = {}) {
    try {
      const { page = 1, limit = 20, status, priority } = options;
      
      // 쿼리 파라미터 생성
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      params.append('public', true);
      
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      
      const response = await api.get(`/tasks/public?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 작업 생성
  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 작업 업데이트
  async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data.task;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 작업 상태 변경
  async updateTaskStatus(taskId, status) {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status });
      return response.data.task;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 작업 삭제
  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 작업 담당자 할당
  async assignTask(taskId, resourceId) {
    try {
      const response = await api.put(`/tasks/${taskId}/assign`, { resourceId });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
};

export default taskService;
