/**
 * Redux 스토어 설정
 */
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

// Redux DevTools 설정
const composeEnhancers = 
  (process.env.NODE_ENV === 'development' && 
   typeof window !== 'undefined' && 
   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || 
  compose;

// 미들웨어 설정
const middleware = [thunk];

// 스토어 생성
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;
