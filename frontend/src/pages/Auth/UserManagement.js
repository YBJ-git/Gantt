import React, { useState, useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useRole, ROLES } from 'contexts/RoleContext';
import './UserManagement.css';

const UserManagement = () => {
  const { getAllUsers, changeUserRole } = useAuth();
  const { roles, loading: roleLoading } = useRole();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 사용자 목록 로드
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await getAllUsers();
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (err) {
        setError(err.message || '사용자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [getAllUsers]);
  
  // 필터링 적용
  useEffect(() => {
    let result = [...users];
    
    // 검색어 필터
    if (searchTerm) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // 역할 필터
    if (roleFilter) {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter]);
  
  // 검색어 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // 역할 필터 변경 핸들러
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };
  
  // 역할 변경 핸들러
  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      
      // 사용자 목록 업데이트
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      setSuccessMessage('사용자 역할이 변경되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || '역할을 변경하는데 실패했습니다.');
      
      // 3초 후 에러 메시지 제거
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };
  
  // 정렬 기능
  const sortUsers = (field) => {
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });
    
    setFilteredUsers(sortedUsers);
  };
  
  if (loading || roleLoading) {
    return <div className="loading-container">사용자 정보를 불러오는 중...</div>;
  }
  
  return (
    <div className="user-management-container">
      <div className="card shadow-md">
        <div className="card-header">
          <h2>사용자 관리</h2>
          <p className="text-muted">시스템 내 사용자 역할 및 권한을 관리합니다</p>
        </div>
        
        <div className="card-body">
          {error && (
            <div className="alert alert-danger">{error}</div>
          )}
          
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
          
          <div className="filters-container">
            <div className="search-container">
              <input
                type="text"
                className="form-control search-input"
                placeholder="사용자명, 이메일로 검색..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i className="search-icon">🔍</i>
            </div>
            
            <div className="role-filter-container">
              <select
                className="form-control"
                value={roleFilter}
                onChange={handleRoleFilterChange}
              >
                <option value="">모든 역할</option>
                <option value={ROLES.ADMIN}>관리자</option>
                <option value={ROLES.MANAGER}>매니저</option>
                <option value={ROLES.WORKER}>작업자</option>
                <option value={ROLES.USER}>일반 사용자</option>
              </select>
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th onClick={() => sortUsers('username')}>사용자명</th>
                  <th onClick={() => sortUsers('email')}>이메일</th>
                  <th onClick={() => sortUsers('firstName')}>이름</th>
                  <th onClick={() => sortUsers('role')}>현재 역할</th>
                  <th>역할 변경</th>
                  <th>마지막 로그인</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{`${user.firstName || ''} ${user.lastName || ''}`}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role === ROLES.ADMIN ? '관리자' :
                           user.role === ROLES.MANAGER ? '매니저' :
                           user.role === ROLES.WORKER ? '작업자' : '일반 사용자'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-control role-select"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.role === ROLES.ADMIN && user.id === 1} // 기본 관리자는 변경 불가
                        >
                          <option value={ROLES.ADMIN}>관리자</option>
                          <option value={ROLES.MANAGER}>매니저</option>
                          <option value={ROLES.WORKER}>작업자</option>
                          <option value={ROLES.USER}>일반 사용자</option>
                        </select>
                      </td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '없음'}</td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                          {user.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results">
                      검색 결과가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-label">전체 사용자:</span>
              <span className="stat-value">{users.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">관리자:</span>
              <span className="stat-value">
                {users.filter(user => user.role === ROLES.ADMIN).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">매니저:</span>
              <span className="stat-value">
                {users.filter(user => user.role === ROLES.MANAGER).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">작업자:</span>
              <span className="stat-value">
                {users.filter(user => user.role === ROLES.WORKER).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">일반 사용자:</span>
              <span className="stat-value">
                {users.filter(user => user.role === ROLES.USER).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
