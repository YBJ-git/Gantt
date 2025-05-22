import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { useRole } from 'contexts/RoleContext';

/**
 * 권한 기반 보호된 라우트 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {React.Component} props.component - 렌더링할 컴포넌트
 * @param {string|string[]} [props.requiredPermission] - 필요한 권한 (단일 권한 또는 권한 배열)
 * @param {boolean} [props.requireAll=false] - 여러 권한이 모두 필요한지 여부 (true: AND, false: OR)
 * @param {boolean} [props.requireAuth=true] - 인증이 필요한지 여부
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({
  component: Component,
  requiredPermission,
  requireAll = false,
  requireAuth = true,
  ...rest
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading: roleLoading } = useRole();
  
  // 로딩 중이면 로딩 표시
  if (authLoading || roleLoading) {
    return <div className="loading-container">인증 확인 중...</div>;
  }
  
  // 인증이 필요한 경우 로그인 여부 확인
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }
  
  // 권한 확인이 필요한 경우
  if (requiredPermission) {
    let hasRequiredPermission = false;
    
    if (Array.isArray(requiredPermission)) {
      // 여러 권한이 필요한 경우
      hasRequiredPermission = requireAll
        ? hasAllPermissions(requiredPermission)  // AND 조건 (모든 권한 필요)
        : hasAnyPermission(requiredPermission);  // OR 조건 (하나 이상의 권한 필요)
    } else {
      // 단일 권한이 필요한 경우
      hasRequiredPermission = hasPermission(requiredPermission);
    }
    
    // 권한이 없으면 접근 거부 페이지로 리다이렉트
    if (!hasRequiredPermission) {
      return <Navigate to="/access-denied" />;
    }
  }
  
  // 모든 조건을 충족하면 요청된 컴포넌트 렌더링
  return <Component {...rest} />;
};

export default ProtectedRoute;
