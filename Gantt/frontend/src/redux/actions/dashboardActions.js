// 대시보드 데이터 액션 타입
export const FETCH_DASHBOARD_REQUEST = 'FETCH_DASHBOARD_REQUEST';
export const FETCH_DASHBOARD_SUCCESS = 'FETCH_DASHBOARD_SUCCESS';
export const FETCH_DASHBOARD_FAILURE = 'FETCH_DASHBOARD_FAILURE';

// 대시보드 데이터 액션 생성자
export const fetchDashboardRequest = () => ({
  type: FETCH_DASHBOARD_REQUEST
});

export const fetchDashboardSuccess = (data) => ({
  type: FETCH_DASHBOARD_SUCCESS,
  payload: data
});

export const fetchDashboardFailure = (error) => ({
  type: FETCH_DASHBOARD_FAILURE,
  payload: error
});

// 대시보드 데이터 가져오기 액션 (thunk)
export const fetchDashboardData = () => {
  return async dispatch => {
    dispatch(fetchDashboardRequest());
    
    try {
      // 실제 구현에서는 API 호출
      // const response = await api.get('/dashboard');
      
      // 데모 목적을 위한 더미 데이터
      const mockData = {
        overallLoad: 72,
        resourcesCount: 18,
        tasksCount: 45,
        criticalTasks: 3,
        overdueTasksCount: 2,
        upcomingDeadlinesCount: 5,
        mostLoadedResources: [
          { id: 3, name: '개발자 C', utilization: 110, capacity: 40 },
          { id: 6, name: 'QA 엔지니어 A', utilization: 95, capacity: 40 },
          { id: 1, name: '개발자 A', utilization: 85, capacity: 40 }
        ],
        leastLoadedResources: [
          { id: 2, name: '개발자 B', utilization: 45, capacity: 40 },
          { id: 8, name: '마케팅 담당자 A', utilization: 50, capacity: 40 },
          { id: 5, name: '디자이너 B', utilization: 60, capacity: 40 }
        ],
        recentOptimizations: [
          { id: 1, timestamp: '2025-05-15T14:30:00', description: '개발자 C의 작업 부하 재분배' },
          { id: 2, timestamp: '2025-05-14T11:15:00', description: 'QA 엔지니어 일정 최적화' }
        ],
        upcomingDeadlines: [
          { id: 105, name: '테스트 자동화', resourceName: 'QA 엔지니어 A', deadline: '2025-05-30' },
          { id: 108, name: '통합 테스트', resourceName: 'QA 엔지니어 A', deadline: '2025-06-05' },
          { id: 107, name: 'API 개발', resourceName: '개발자 C', deadline: '2025-05-28' }
        ]
      };
      
      // 1초 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch(fetchDashboardSuccess(mockData));
    } catch (error) {
      dispatch(fetchDashboardFailure(error.message));
    }
  };
};
