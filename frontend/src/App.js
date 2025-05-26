import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthProvider } from 'contexts/AuthContext';
import { RoleProvider } from 'contexts/RoleContext';
import { NotificationProvider } from 'contexts/NotificationContext';
import ProtectedRoute from 'components/common/ProtectedRoute';
import ErrorBoundary from 'components/common/ErrorBoundary';
import Layout from 'components/layout/Layout';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('pages/Dashboard'));
const Login = lazy(() => import('pages/Auth/Login'));
const Register = lazy(() => import('pages/Auth/Register'));
const WorkerRegister = lazy(() => import('pages/Auth/WorkerRegister'));
const UserManagement = lazy(() => import('pages/Auth/UserManagement'));
const AccessDenied = lazy(() => import('pages/Auth/AccessDenied'));
const ForgotPassword = lazy(() => import('pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('pages/Auth/ResetPassword'));
const VerifyEmail = lazy(() => import('pages/Auth/VerifyEmail'));
const SocialCallback = lazy(() => import('pages/Auth/SocialCallback'));
const TaskManager = lazy(() => import('pages/TaskManager'));
const UserProfile = lazy(() => import('pages/Profile/UserProfile'));
const NotificationSettings = lazy(() => import('pages/Profile/NotificationSettings'));
const SessionManagement = lazy(() => import('pages/Profile/SessionManagement'));
const SimpleLogin = lazy(() => import('pages/SimpleLogin'));

// Loading component for Suspense fallback
const LoadingFallback = ({ message = '페이지를 로딩 중입니다...' }) => (
  <div className="loading-container">
    <Spin size="large" />
    <p className="loading-message">{message}</p>
  </div>
);

// Route configuration for better organization
const routes = [
  // Public routes
  {
    path: '/login',
    component: Login,
    public: true
  },
  {
    path: '/register',
    component: Register,
    public: true
  },
  {
    path: '/worker-register',
    component: WorkerRegister,
    public: true
  },
  {
    path: '/forgot-password',
    component: ForgotPassword,
    public: true
  },
  {
    path: '/reset-password',
    component: ResetPassword,
    public: true
  },
  {
    path: '/verify-email',
    component: VerifyEmail,
    public: true
  },
  {
    path: '/auth/callback/:provider',
    component: SocialCallback,
    public: true
  },
  {
    path: '/access-denied',
    component: AccessDenied,
    public: true
  },
  {
    path: '/debug-login',
    component: SimpleLogin,
    public: true
  },
  
  // Protected routes
  {
    path: '/',
    component: Dashboard,
    protected: true
  },
  {
    path: '/dashboard',
    component: Dashboard,
    protected: true
  },
  {
    path: '/tasks',
    component: TaskManager,
    protected: true
  },
  {
    path: '/profile',
    component: UserProfile,
    protected: true
  },
  {
    path: '/notifications',
    component: NotificationSettings,
    protected: true
  },
  {
    path: '/sessions',
    component: SessionManagement,
    protected: true
  },
  
  // Admin routes
  {
    path: '/admin/users',
    component: UserManagement,
    protected: true,
    requiredRoles: ['admin', 'manager']
  }
];

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RoleProvider>
          <NotificationProvider>
            <div className="App">
              <Routes>
                {routes.map((route, index) => {
                  const Component = route.component;
                  
                  if (route.public) {
                    return (
                      <Route
                        key={index}
                        path={route.path}
                        element={
                          <Suspense fallback={<LoadingFallback />}>
                            <Component />
                          </Suspense>
                        }
                      />
                    );
                  }
                  
                  if (route.protected) {
                    return (
                      <Route
                        key={index}
                        path={route.path}
                        element={
                          <ProtectedRoute requiredRoles={route.requiredRoles}>
                            <Layout>
                              <Suspense fallback={<LoadingFallback />}>
                                <Component />
                              </Suspense>
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                    );
                  }
                  
                  return null;
                })}
                
                {/* 404 페이지 */}
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <div className="not-found">
                        <h1>404 - 페이지를 찾을 수 없습니다</h1>
                        <p>요청하신 페이지가 존재하지 않습니다.</p>
                        <a href="/">홈으로 돌아가기</a>
                      </div>
                    </Suspense>
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
