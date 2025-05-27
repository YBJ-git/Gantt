import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const WorkerRegister = lazy(() => import('./pages/Auth/WorkerRegister'));
const UserManagement = lazy(() => import('./pages/Auth/UserManagement'));
const AccessDenied = lazy(() => import('./pages/Auth/AccessDenied'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'));
const SocialCallback = lazy(() => import('./pages/Auth/SocialCallback'));
const TaskManager = lazy(() => import('./pages/TaskManager'));
const UserProfile = lazy(() => import('./pages/Profile/UserProfile'));
const NotificationSettings = lazy(() => import('./pages/Profile/NotificationSettings'));
const SessionManagement = lazy(() => import('./pages/Profile/SessionManagement'));
const SimpleLogin = lazy(() => import('./pages/SimpleLogin'));

// Loading component for Suspense fallback
const LoadingFallback = ({ message = '페이지를 로딩 중입니다...' }) => (
  <div className="loading-container">
    <Spin size="large" />
    <p className="loading-message">{message}</p>
  </div>
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
                    <Suspense fallback={<LoadingFallback />}>
                      <Login />
                    </Suspense>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Register />
                    </Suspense>
                  }
                />
                <Route
                  path="/worker-register"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <WorkerRegister />
                    </Suspense>
                  }
                />
                <Route
                  path="/forgot-password"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ForgotPassword />
                    </Suspense>
                  }
                />
                <Route
                  path="/reset-password"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ResetPassword />
                    </Suspense>
                  }
                />
                <Route
                  path="/verify-email"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <VerifyEmail />
                    </Suspense>
                  }
                />
                <Route
                  path="/auth/callback/:provider"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SocialCallback />
                    </Suspense>
                  }
                />
                <Route
                  path="/access-denied"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AccessDenied />
                    </Suspense>
                  }
                />
                <Route
                  path="/debug-login"
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SimpleLogin />
                    </Suspense>
                  }
                />
                
                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <Dashboard />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <TaskManager />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <UserProfile />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <NotificationSettings />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Suspense fallback={<LoadingFallback />}>
                          <SessionManagement />
                        </Suspense>
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
                        <Suspense fallback={<LoadingFallback />}>
                          <UserManagement />
                        </Suspense>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                
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
