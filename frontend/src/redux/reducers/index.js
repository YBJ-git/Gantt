/**
 * 루트 리듀서
 */
import { combineReducers } from 'redux';
import loadOptimizationReducer from './loadOptimizationReducer';

// 루트 리듀서 생성
const rootReducer = combineReducers({
  loadOptimization: loadOptimizationReducer
  // 추가 리듀서 모듈이 있다면 여기에 추가
});

export default rootReducer;
