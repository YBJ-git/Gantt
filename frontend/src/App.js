import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';

// 안전한 lazy loading with error handling
const createLazyComponent = (importFunc, fallbackName = 'Component') => {
  const LazyComponent = React.lazy(() => 
    importFunc().catch(err => {
      console.error(`Failed to load ${fallbackName}:`, err);
      // 실패 시 기본 컴포넌트 반환
      return {
        default: () => (
          <div className="component-error">
            <h3>컴포넌트 로딩 실패</h3>
            <p>{fallbackName}을(를) 불러올 수 없습니다.</p>
            <button onClick={() => window.location.reload()}>페이지 새로고침</button>
          </div>
        )
      };
    })
  );
  
  LazyComponent.displayName = fallbackName;
  return LazyComponent;
};

// Lazy load components with error handling
const Dashboard = createLazyComponent(() => import('./pages/Dashboard'), 'Dashboard');
const Login = createLazyComponent(() => import('./pages/Auth/Login'), 'Login');
const Register = createLazyComponent(() => import('./pages/Auth/Register'), 'Register');
const WorkerRegister = createLazyComponent(() => import('./pages/Auth/WorkerRegister'), 'WorkerRegister');
const UserManagement = createLazyComponent(() => import('./pages/Auth/UserManagement'), 'UserManagement');
const AccessDenied = createLazyComponent(() => import('./pages/Auth/AccessDenied'), 'AccessDenied');
const ForgotPassword = createLazyComponent(() => import('./pages/Auth/ForgotPassword'), 'ForgotPassword');
const ResetPassword = createLazyComponent(() => import('./pages/Auth/ResetPassword'), 'ResetPassword');
const VerifyEmail = createLazyComponent(() => import('./pages/Auth/VerifyEmail'), 'VerifyEmail');
const SocialCallback = createLazyComponent(() => import('./pages/Auth/SocialCallback'), 'SocialCallback');
const TaskManager = createLazyComponent(() => import('./pages/TaskManager'), 'TaskManager');
const UserProfile = createLazyComponent(() => import('./pages/Profile/UserProfile'), 'UserProfile');
const NotificationSettings = createLazyComponent(() => import('./pages/Profile/NotificationSettings'), 'NotificationSettings');
const SessionManagement = createLazyComponent(() => import('./pages/Profile/SessionManagement'), 'SessionManagement');
const SimpleLogin = createLazyComponent(() => import('./pages/SimpleLogin'), 'SimpleLogin');

// Enhanced loading component for Suspense fallback
const LoadingFallback = ({ message = '페이지를 로딩 중입니다...' }) => (
  <div className="loading-container" style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    padding: '20px'
  }}>
    <Spin size="large" />
    <p className="loading-message" style={{ marginTop: '16px', color: '#666' }}>
      {message}
    </p>
  </div>
);

// Safe wrapper for routes
const SafeRoute = ({ element, fallbackMessage }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      {element}
    </Suspense>
  </ErrorBoundary>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RoleProvider>
          <NotificationProvider>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    <SafeRoute 
                      element={<Login />}
                      fallbackMessage="로그인 페이지 로딩 중..."
                    />
                  }
                />
                <Route
                  path="/register"
                  element={
                    <SafeRoute 
                      element={<Register />}
                      fallbackMessage="회원가입 페이지 로딩 중..."
                    />
                  }
                />
                <Route
                  path="/worker-register"
                  element={
                    <SafeRoute 
                      element={<WorkerRegister />}
                      fallbackMessage="작업자 등록 페이지 로딩 중..."
                    />
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <SafeRoute 
                      element={<ForgotPassword />}
                      fallbackMessage="비밀번호 찾기 페이지 로딩 중..."
                    />
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <SafeRoute 
                      element={<ResetPassword />}
                      fallbackMessage="비밀번호 재설정 페이지 로딩 중..."
                    />
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <SafeRoute 
                      element={<VerifyEmail />}
                      fallbackMessage="이메일 인증 페이지 로딩 중..."
                    />
                  }
                />
                <Route
                  path="/auth/callback/:provider"
                  element={
                    <SafeRoute 
                      element={<SocialCallback />}
                      fallbackMessage="소셜 로그인 처리 중..."
                    />
                  }
                />
                <Route
                  path="/access-denied"
                  element={
                    <SafeRoute 
                      element={<AccessDenied />}
                      fallbackMessage="접근 거부 페이지 로딩 중..."
                    />
                  }
                />
                <Route
                  path="/debug-login"
                  element={
                    <SafeRoute 
                      element={<SimpleLogin />}
                      fallbackMessage="디버그 로그인 페이지 로딩 중..."
                    />
                  }
                />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SafeRoute 
                          element={<Dashboard />}
                          fallbackMessage="대시보드 로딩 중..."
                        />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SafeRoute 
                          element={<Dashboard />}
                          fallbackMessage="대시보드 로딩 중..."
                        />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SafeRoute 
                          element={<TaskManager />}
                          fallbackMessage="작업 관리 페이지 로딩 중..."
                        />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SafeRoute 
                          element={<UserProfile />}
                          fallbackMessage="프로필 페이지 로딩 중..."
                        />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SafeRoute 
                          element={<NotificationSettings />}
                          fallbackMessage="알림 설정 페이지 로딩 중..."
                        />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <SafeRoute 
                          element={<SessionManagement />}
                          fallbackMessage="세션 관리 페이지 로딩 중..."
                        />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin routes */}
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRoles={['admin', 'manager']}>
                      <Layout>
                        <SafeRoute 
                          element={<UserManagement />}
                          fallbackMessage="사용자 관리 페이지 로딩 중..."
                        />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
                {/* 404 페이지 */}
                <Route
                  path="*"
                  element={
                    <SafeRoute 
                      element={
                        <div className="not-found" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '50vh',
                          textAlign: 'center'
                        }}>
                          <h1>404 - 페이지를 찾을 수 없습니다</h1>
                          <p>요청하신 페이지가 존재하지 않습니다.</p>
                          <a href="/" style={{ marginTop: '20px', color: '#1890ff' }}>홈으로 돌아가기</a>
                        </div>
                      }
                      fallbackMessage="페이지 로딩 중..."
                    />
                  }
                />
              </Routes>
            </div>
          </NotificationProvider>
        </RoleProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
