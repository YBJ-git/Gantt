/**
 * 부하 최적화 리듀서
 */
import * as types from '../types/loadOptimizationTypes';

// 초기 상태
const initialState = {
  // 부하 데이터
  loadData: null,
  
  // 리소스별 부하 데이터
  resourceLoad: [],
  
  // 부하 최적화 추천 사항
  optimizationRecommendations: null,
  
  // 작업 자동 재분배 결과
  redistributionPlan: null,
  
  // 부하 최적화 적용 결과
  optimizationResult: null,
  
  // 부하 예측 분석 결과
  loadPrediction: null,
  
  // UI 상태
  dateRange: {
    startDate: null,
    endDate: null
  },
  selectedProject: null,
  selectedTeam: null,
  selectedResources: [],
  loadThreshold: 80,
  
  // 로딩 상태
  loading: {
    loadData: false,
    resourceLoad: false,
    recommendations: false,
    autoDistribute: false,
    applyOptimization: false,
    predictLoad: false
  },
  
  // 오류 상태
  error: {
    loadData: null,
    resourceLoad: null,
    recommendations: null,
    autoDistribute: null,
    applyOptimization: null,
    predictLoad: null
  }
};

// 리듀서 함수
const loadOptimizationReducer = (state = initialState, action) => {
  switch (action.type) {
    // 부하 데이터 조회
    case types.FETCH_LOAD_DATA_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          loadData: true
        },
        error: {
          ...state.error,
          loadData: null
        }
      };
      
    case types.FETCH_LOAD_DATA_SUCCESS:
      return {
        ...state,
        loadData: action.payload,
        loading: {
          ...state.loading,
          loadData: false
        }
      };
      
    case types.FETCH_LOAD_DATA_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          loadData: false
        },
        error: {
          ...state.error,
          loadData: action.payload
        }
      };
      
    // 리소스별 부하 분석
    case types.FETCH_RESOURCE_LOAD_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          resourceLoad: true
        },
        error: {
          ...state.error,
          resourceLoad: null
        }
      };
      
    case types.FETCH_RESOURCE_LOAD_SUCCESS:
      return {
        ...state,
        resourceLoad: action.payload,
        loading: {
          ...state.loading,
          resourceLoad: false
        }
      };
      
    case types.FETCH_RESOURCE_LOAD_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          resourceLoad: false
        },
        error: {
          ...state.error,
          resourceLoad: action.payload
        }
      };
      
    // 부하 최적화 추천 사항
    case types.FETCH_OPTIMIZATION_RECOMMENDATIONS_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          recommendations: true
        },
        error: {
          ...state.error,
          recommendations: null
        }
      };
      
    case types.FETCH_OPTIMIZATION_RECOMMENDATIONS_SUCCESS:
      return {
        ...state,
        optimizationRecommendations: action.payload,
        loading: {
          ...state.loading,
          recommendations: false
        }
      };
      
    case types.FETCH_OPTIMIZATION_RECOMMENDATIONS_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          recommendations: false
        },
        error: {
          ...state.error,
          recommendations: action.payload
        }
      };
      
    // 작업 자동 재분배
    case types.AUTO_DISTRIBUTE_TASKS_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          autoDistribute: true
        },
        error: {
          ...state.error,
          autoDistribute: null
        }
      };
      
    case types.AUTO_DISTRIBUTE_TASKS_SUCCESS:
      return {
        ...state,
        redistributionPlan: action.payload,
        loading: {
          ...state.loading,
          autoDistribute: false
        }
      };
      
    case types.AUTO_DISTRIBUTE_TASKS_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          autoDistribute: false
        },
        error: {
          ...state.error,
          autoDistribute: action.payload
        }
      };
      
    // 부하 최적화 적용
    case types.APPLY_LOAD_OPTIMIZATION_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          applyOptimization: true
        },
        error: {
          ...state.error,
          applyOptimization: null
        }
      };
      
    case types.APPLY_LOAD_OPTIMIZATION_SUCCESS:
      return {
        ...state,
        optimizationResult: action.payload,
        loading: {
          ...state.loading,
          applyOptimization: false
        }
      };
      
    case types.APPLY_LOAD_OPTIMIZATION_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          applyOptimization: false
        },
        error: {
          ...state.error,
          applyOptimization: action.payload
        }
      };
      
    // 부하 예측 분석
    case types.PREDICT_FUTURE_LOAD_REQUEST:
      return {
        ...state,
        loading: {
          ...state.loading,
          predictLoad: true
        },
        error: {
          ...state.error,
          predictLoad: null
        }
      };
      
    case types.PREDICT_FUTURE_LOAD_SUCCESS:
      return {
        ...state,
        loadPrediction: action.payload,
        loading: {
          ...state.loading,
          predictLoad: false
        }
      };
      
    case types.PREDICT_FUTURE_LOAD_FAILURE:
      return {
        ...state,
        loading: {
          ...state.loading,
          predictLoad: false
        },
        error: {
          ...state.error,
          predictLoad: action.payload
        }
      };
      
    // UI 상태 관리
    case types.SET_DATE_RANGE:
      return {
        ...state,
        dateRange: action.payload
      };
      
    case types.SET_SELECTED_PROJECT:
      return {
        ...state,
        selectedProject: action.payload
      };
      
    case types.SET_SELECTED_TEAM:
      return {
        ...state,
        selectedTeam: action.payload
      };
      
    case types.SET_SELECTED_RESOURCES:
      return {
        ...state,
        selectedResources: action.payload
      };
      
    case types.SET_LOAD_THRESHOLD:
      return {
        ...state,
        loadThreshold: action.payload
      };
      
    // 상태 초기화
    case types.RESET_LOAD_OPTIMIZATION_STATE:
      return {
        ...initialState,
        // 사용자 선택 값은 유지
        dateRange: state.dateRange,
        selectedProject: state.selectedProject,
        selectedTeam: state.selectedTeam,
        loadThreshold: state.loadThreshold
      };
      
    default:
      return state;
  }
};

export default loadOptimizationReducer;
