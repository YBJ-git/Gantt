import axios from 'axios';

// API URL 설정
const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://gantt-c1oh.onrender.com';

console.log('🌍 AuthService - API_URL:', API_URL);
console.log('🌍 AuthService - REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

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

// 응답 인터셉터 - 에러 처리 및 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 인증 오류 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // 로그인 페이지로 리다이렉트 (필요시 구현)
      // window.location.href = '/login';
    }
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

// 인증 관련 서비스
const authService = {
  // 로그인
  async login(username, password) {
    try {
      console.log('🔐 로그인 시도:', {
        username,
        baseURL: API_URL,
        fullURL: `${API_URL}/api/users/login`,
        timestamp: new Date().toISOString()
      });
      
      const response = await api.post('/api/users/login', { username, password });
      
      console.log('✅ 로그인 응답:', {
        status: response.status,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ 로그인 오류:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 소셜 로그인
  async socialLogin(provider, token) {
    try {
      const response = await api.post('/api/users/social-login', { provider, token });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 소셜 로그인 URL 가져오기
  getSocialLoginUrl(provider) {
    return `${API_URL}/api/users/auth/${provider}`;
  },

  // 회원가입
  async register(userData) {
    try {
      const response = await api.post('/api/users/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 작업자 등록
  async registerWorker(userData) {
    try {
      const response = await api.post('/api/users/register-worker', userData);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 현재 로그인한 사용자 정보 조회
  async getCurrentUser() {
    try {
      const response = await api.get('/api/users/me');
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 사용자 프로필 업데이트
  async updateUserProfile(userData) {
    try {
      const response = await api.put('/api/users/me', userData);
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 비밀번호 변경
  async changePassword(currentPassword, newPassword) {
    try {
      await api.put('/api/users/change-password', { currentPassword, newPassword });
      return true;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 관리자용 - 모든 사용자 조회
  async getAllUsers() {
    try {
      const response = await api.get('/api/users');
      return response.data.users;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 관리자용 - 특정 사용자 조회
  async getUserById(userId) {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 관리자용 - 사용자 정보 업데이트
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 관리자용 - 사용자 역할 변경
  async changeUserRole(userId, role) {
    try {
      const response = await api.put(`/api/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 관리자용 - 사용자 상태 변경 (활성화/비활성화)
  async toggleUserStatus(userId, status) {
    try {
      const response = await api.put(`/api/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // 관리자용 - 사용자 삭제
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 이메일 인증 요청
  async requestEmailVerification(email) {
    try {
      const response = await api.post('/api/users/request-verification', { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 이메일 인증 확인
  async verifyEmail(token) {
    try {
      const response = await api.post('/api/users/verify-email', { token });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 비밀번호 찾기 요청
  async requestPasswordReset(email) {
    try {
      const response = await api.post('/api/users/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  // 비밀번호 재설정
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/api/users/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
};

export default authService;
