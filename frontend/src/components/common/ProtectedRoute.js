import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';

/**
 * 권한 기반 보호된 라우트 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {React.Component} [props.component] - 렌더링할 컴포넌트 (deprecated, children 사용 권장)
 * @param {React.ReactNode} [props.children] - 렌더링할 자식 컴포넌트
 * @param {string|string[]} [props.requiredRoles] - 필요한 역할 (단일 역할 또는 역할 배열)
 * @param {string|string[]} [props.requiredPermission] - 필요한 권한 (단일 권한 또는 권한 배열)
 * @param {boolean} [props.requireAll=false] - 여러 권한이 모두 필요한지 여부 (true: AND, false: OR)
 * @param {boolean} [props.requireAuth=true] - 인증이 필요한지 여부
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({
  component: Component,
  children,
  requiredRoles,
  requiredPermission,
  requireAll = false,
  requireAuth = true,
  ...rest
}) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading: roleLoading } = useRole();
  
  console.log('🛡️ ProtectedRoute 상태:', {
    user: !!user,
    isAuthenticated,
    authLoading,
    roleLoading,
    currentPath: window.location.pathname
  });
  
  // 로딩 중이면 로딩 표시
  if (authLoading || roleLoading) {
    console.log('⏳ 인증 확인 중...');
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <div>인증 확인 중...</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          잠시만 기다려 주세요.
        </div>
      </div>
    );
  }
  
  // 인증이 필요한 경우 로그인 여부 확인
  if (requireAuth && !isAuthenticated) {
    console.log('🚫 미인증 상태 - 로그인 페이지로 리디렉션');
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  console.log('✅ 인증 통과 - 컴포넌트 렌더링');
  
  // 역할 확인 (간단한 역할 기반 접근 제어)
  if (requiredRoles && user) {
    const userRole = user.role;
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!rolesArray.includes(userRole)) {
      return <Navigate to="/access-denied" />;
    }
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
  if (Component) {
    return <Component {...rest} />;
  }
  
  return children || null;
};

export default ProtectedRoute;
