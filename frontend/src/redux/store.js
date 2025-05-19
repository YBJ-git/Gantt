import { createStore } from 'redux';

// 초기 상태
const initialState = {
  tasks: [],
  resources: [],
  projects: [],
  ui: {
    sidebarCollapsed: false,
    darkMode: false,
    loading: false
  }
};

// 리듀서
function rootReducer(state = initialState, action) {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarCollapsed: !state.ui.sidebarCollapsed
        }
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        ui: {
          ...state.ui,
          darkMode: !state.ui.darkMode
        }
      };
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload
        }
      };
    default:
      return state;
  }
}

// 스토어 생성
const store = createStore(rootReducer);

export default store;