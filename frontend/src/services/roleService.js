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

const roleService = {
  // 모든 역할 조회
  getAllRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 특정 역할 조회
  getRoleById: async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 새 역할 생성
  createRole: async (roleName, permissions) => {
    try {
      const response = await api.post('/roles', {
        name: roleName,
        permissions
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 역할 정보 수정
  updateRole: async (roleId, updatedData) => {
    try {
      const response = await api.put(`/roles/${roleId}`, updatedData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 역할 삭제
  deleteRole: async (roleId) => {
    try {
      await api.delete(`/roles/${roleId}`);
    } catch (error) {
      throw handleError(error);
    }
  },

  // 사용자에게 역할 할당
  assignRoleToUser: async (userId, roleId) => {
    try {
      const response = await api.post('/user-roles', {
        userId,
        roleId
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 사용자의 역할 변경
  changeUserRole: async (userId, roleId) => {
    try {
      const response = await api.put(`/user-roles/${userId}`, {
        roleId
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 사용자의 모든 역할 조회
  getUserRoles: async (userId) => {
    try {
      const response = await api.get(`/user-roles/${userId}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 특정 역할을 가진 모든 사용자 조회
  getUsersByRole: async (roleId) => {
    try {
      const response = await api.get(`/roles/${roleId}/users`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // 권한 체크
  checkPermission: async (userId, permission) => {
    try {
      const response = await api.get(`/permissions/check`, {
        params: { userId, permission }
      });
      return response.data.hasPermission;
    } catch (error) {
      throw handleError(error);
    }
  }
};

// 에러 핸들링 헬퍼 함수
const handleError = (error) => {
  if (error.response) {
    // 서버 응답 에러
    const { status, data } = error.response;
    
    if (status === 401) {
      return new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    
    if (status === 403) {
      return new Error('이 작업을 수행할 권한이 없습니다.');
    }
    
    if (status === 404) {
      return new Error('요청한 리소스를 찾을 수 없습니다.');
    }
    
    if (data && data.message) {
      return new Error(data.message);
    }
  }
  
  // 기타 에러
  return new Error('서버와 통신 중 오류가 발생했습니다.');
};

export default roleService;
