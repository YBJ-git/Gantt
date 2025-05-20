import { combineReducers } from 'redux';
import dashboardReducer from './dashboardReducer';

const rootReducer = combineReducers({
  dashboard: dashboardReducer,
  ui: (state = { sidebarCollapsed: false, darkMode: false, loading: false }, action) => {
    switch (action.type) {
      case 'TOGGLE_SIDEBAR':
        return {
          ...state,
          sidebarCollapsed: !state.sidebarCollapsed
        };
      case 'TOGGLE_DARK_MODE':
        return {
          ...state,
          darkMode: !state.darkMode
        };
      case 'SET_LOADING':
        return {
          ...state,
          loading: action.payload
        };
      default:
        return state;
    }
  }
});

export default rootReducer;