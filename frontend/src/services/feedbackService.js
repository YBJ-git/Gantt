import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

class FeedbackService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/feedback`,
      timeout: 10000,
    });

    // 요청 인터셉터 - 토큰 자동 추가
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터 - 오류 처리
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('Feedback API Error:', error);
        
        if (error.response?.status === 401) {
          // 토큰 만료 시 로그아웃 처리
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // 피드백 제출
  async submitFeedback(feedbackData) {
    try {
      const response = await this.api.post('/', feedbackData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 전송에 실패했습니다.');
    }
  }

  // 피드백 목록 조회 (관리자용)
  async getFeedbacks(filters = {}) {
    try {
      const response = await this.api.get('/', { params: filters });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 목록 조회에 실패했습니다.');
    }
  }

  // 특정 피드백 조회
  async getFeedback(feedbackId) {
    try {
      const response = await this.api.get(`/${feedbackId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 조회에 실패했습니다.');
    }
  }

  // 피드백 상태 업데이트 (관리자용)
  async updateFeedbackStatus(feedbackId, status, comment = '') {
    try {
      const response = await this.api.patch(`/${feedbackId}/status`, {
        status,
        comment
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 상태 업데이트에 실패했습니다.');
    }
  }

  // 피드백에 답변 작성 (관리자용)
  async respondToFeedback(feedbackId, responseData) {
    try {
      const response = await this.api.post(`/${feedbackId}/response`, responseData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 답변 작성에 실패했습니다.');
    }
  }

  // 사용자 피드백 통계 조회
  async getFeedbackStats(userId = null) {
    try {
      const params = userId ? { userId } : {};
      const response = await this.api.get('/stats', { params });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 통계 조회에 실패했습니다.');
    }
  }

  // 피드백 카테고리별 통계
  async getCategoryStats(dateRange = {}) {
    try {
      const response = await this.api.get('/stats/categories', { params: dateRange });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '카테고리별 통계 조회에 실패했습니다.');
    }
  }

  // 만족도 통계
  async getSatisfactionStats(dateRange = {}) {
    try {
      const response = await this.api.get('/stats/satisfaction', { params: dateRange });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '만족도 통계 조회에 실패했습니다.');
    }
  }

  // 피드백 검색
  async searchFeedbacks(searchTerm, filters = {}) {
    try {
      const response = await this.api.get('/search', {
        params: { q: searchTerm, ...filters }
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 검색에 실패했습니다.');
    }
  }

  // 피드백 삭제 (관리자용)
  async deleteFeedback(feedbackId) {
    try {
      const response = await this.api.delete(`/${feedbackId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 삭제에 실패했습니다.');
    }
  }

  // 피드백 대량 처리 (관리자용)
  async bulkUpdateFeedbacks(feedbackIds, updateData) {
    try {
      const response = await this.api.patch('/bulk', {
        feedbackIds,
        updateData
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 대량 처리에 실패했습니다.');
    }
  }

  // 피드백 내보내기 (관리자용)
  async exportFeedbacks(format = 'csv', filters = {}) {
    try {
      const response = await this.api.get('/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      
      // 파일 다운로드 처리
      const blob = new Blob([response], { type: response.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `feedbacks_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: '피드백 데이터가 다운로드되었습니다.' };
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 내보내기에 실패했습니다.');
    }
  }

  // 템플릿 응답 조회 (관리자용)
  async getResponseTemplates() {
    try {
      const response = await this.api.get('/templates');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '응답 템플릿 조회에 실패했습니다.');
    }
  }

  // 템플릿 응답 생성 (관리자용)
  async createResponseTemplate(templateData) {
    try {
      const response = await this.api.post('/templates', templateData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '응답 템플릿 생성에 실패했습니다.');
    }
  }

  // 피드백 태그 추가 (관리자용)
  async addFeedbackTags(feedbackId, tags) {
    try {
      const response = await this.api.post(`/${feedbackId}/tags`, { tags });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 태그 추가에 실패했습니다.');
    }
  }

  // 피드백 우선순위 변경 (관리자용)
  async updateFeedbackPriority(feedbackId, priority) {
    try {
      const response = await this.api.patch(`/${feedbackId}/priority`, { priority });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 우선순위 변경에 실패했습니다.');
    }
  }

  // 피드백 할당 (관리자용)
  async assignFeedback(feedbackId, assigneeId) {
    try {
      const response = await this.api.patch(`/${feedbackId}/assign`, { assigneeId });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || '피드백 할당에 실패했습니다.');
    }
  }
}

const feedbackService = new FeedbackService();

export default feedbackService;
