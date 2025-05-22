import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth } from './AuthContext';
import roleService from '../services/roleService';

// 역할 컨텍스트 생성
export const RoleContext = createContext();

// 역할 및 권한 정의
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WORKER: 'worker',
  USER: 'user'
};

// 각 역할별 권한 정의
export const PERMISSIONS = {
  // 모든 기능 접근 권한
  [ROLES.ADMIN]: [
    'view_dashboard',
    'create_task',
    'edit_task',
    'delete_task',
    'view_task',
    'assign_task',
    'manage_users',
    'view_reports',
    'generate_reports',
    'view_resources',
    'manage_resources',
    'manage_roles',
    'manage_departments',
    'view_all_projects'
  ],
  // 프로젝트 관리자 권한
  [ROLES.MANAGER]: [
    'view_dashboard',
    'create_task',
    'edit_task',
    'delete_task',
    'view_task',
    'assign_task',
    'view_team_members',
    'view_reports',
    'generate_reports',
    'view_resources',
    'manage_resources_limited',
    'view_department_projects'
  ],
  // 작업자 권한
  [ROLES.WORKER]: [
    'view_dashboard',
    'view_task',
    'update_task_status',
    'view_assigned_tasks',
    'log_work_hours',
    'view_personal_reports',
    'view_team_resources'
  ],
  // 일반 사용자 권한
  [ROLES.USER]: [
    'view_dashboard',
    'view_public_tasks',
    'view_public_reports'
  ]
};

// 역할 컨텍스트 제공자 컴포넌트
export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 모든 역할 정보 가져오기
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        if (user && user.role === ROLES.ADMIN) {
          const allRoles = await roleService.getAllRoles();
          setRoles(allRoles);
        }
      } catch (err) {
        console.error('역할 정보 조회 중 오류:', err);
        setError('역할 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  // 사용자 권한 설정
  useEffect(() => {
    if (user && user.role) {
      // 해당 역할의 권한 설정
      setUserPermissions(PERMISSIONS[user.role] || []);
    } else {
      setUserPermissions([]);
    }
  }, [user]);

  // 역할 생성 (관리자만 가능)
  const createRole = useCallback(async (roleName, permissions) => {
    try {
      if (!user || user.role !== ROLES.ADMIN) {
        throw new Error('역할 생성 권한이 없습니다.');
      }
      
      setLoading(true);
      const newRole = await roleService.createRole(roleName, permissions);
      
      setRoles(prevRoles => [...prevRoles, newRole]);
      return newRole;
    } catch (err) {
      setError(err.message || '역할 생성 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 역할 수정 (관리자만 가능)
  const updateRole = useCallback(async (roleId, updatedData) => {
    try {
      if (!user || user.role !== ROLES.ADMIN) {
        throw new Error('역할 수정 권한이 없습니다.');
      }
      
      setLoading(true);
      const updatedRole = await roleService.updateRole(roleId, updatedData);
      
      setRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === roleId ? updatedRole : role
        )
      );
      
      return updatedRole;
    } catch (err) {
      setError(err.message || '역할 수정 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 역할 삭제 (관리자만 가능)
  const deleteRole = useCallback(async (roleId) => {
    try {
      if (!user || user.role !== ROLES.ADMIN) {
        throw new Error('역할 삭제 권한이 없습니다.');
      }
      
      setLoading(true);
      await roleService.deleteRole(roleId);
      
      setRoles(prevRoles => 
        prevRoles.filter(role => role.id !== roleId)
      );
    } catch (err) {
      setError(err.message || '역할 삭제 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 권한 확인 함수
  const hasPermission = useCallback((permission) => {
    return userPermissions.includes(permission);
  }, [userPermissions]);

  // 여러 권한 확인 함수 (AND 조건)
  const hasAllPermissions = useCallback((requiredPermissions) => {
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }, [userPermissions]);

  // 여러 권한 중 하나라도 있는지 확인 (OR 조건)
  const hasAnyPermission = useCallback((requiredPermissions) => {
    return requiredPermissions.some(permission => 
      userPermissions.includes(permission)
    );
  }, [userPermissions]);

  // 특정 사용자에게 역할 할당 (관리자만 가능)
  const assignRoleToUser = useCallback(async (userId, roleId) => {
    try {
      if (!user || user.role !== ROLES.ADMIN) {
        throw new Error('역할 할당 권한이 없습니다.');
      }
      
      setLoading(true);
      await roleService.assignRoleToUser(userId, roleId);
    } catch (err) {
      setError(err.message || '역할 할당 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 컨텍스트 값
  const value = {
    roles,
    loading,
    error,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    ROLES,
    PERMISSIONS
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

// 컨텍스트 사용을 위한 훅
export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// 권한 확인 HOC (고차 컴포넌트)
export const withPermission = (WrappedComponent, requiredPermission) => {
  return (props) => {
    const { hasPermission, loading } = useRole();
    
    if (loading) {
      return <div>권한 확인 중...</div>;
    }
    
    if (!hasPermission(requiredPermission)) {
      return <div>접근 권한이 없습니다.</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// 여러 권한 확인 HOC (AND 조건)
export const withAllPermissions = (WrappedComponent, requiredPermissions) => {
  return (props) => {
    const { hasAllPermissions, loading } = useRole();
    
    if (loading) {
      return <div>권한 확인 중...</div>;
    }
    
    if (!hasAllPermissions(requiredPermissions)) {
      return <div>접근 권한이 없습니다.</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// 여러 권한 중 하나 확인 HOC (OR 조건)
export const withAnyPermission = (WrappedComponent, requiredPermissions) => {
  return (props) => {
    const { hasAnyPermission, loading } = useRole();
    
    if (loading) {
      return <div>권한 확인 중...</div>;
    }
    
    if (!hasAnyPermission(requiredPermissions)) {
      return <div>접근 권한이 없습니다.</div>;
    }
    
    return <WrappedComponent {...props} />;
  };
};
