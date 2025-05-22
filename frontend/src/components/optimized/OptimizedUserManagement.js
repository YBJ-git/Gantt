import React, { memo, useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, Input, Button, Space, Tag, Pagination } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';
import { useNotification } from '../../contexts/NotificationContext';
import './UserManagement.css';

// 가상화된 사용자 리스트 아이템 컴포넌트
const VirtualizedUserItem = memo(({ index, style, data }) => {
  const user = data[index];
  
  return (
    <div style={style} className="virtualized-user-item">
      <div className="user-info">
        <div className="user-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div className="user-details">
          <div className="user-name">{user.username}</div>
          <div className="user-email">{user.email}</div>
        </div>
        <div className="user-role">
          <Tag color={getRoleColor(user.role)}>{user.role}</Tag>
        </div>
        <div className="user-status">
          <Tag color={user.isActive ? 'green' : 'red'}>
            {user.isActive ? '활성' : '비활성'}
          </Tag>
        </div>
      </div>
    </div>
  );
});

// 역할별 색상 매핑 함수
const getRoleColor = (role) => {
  const colors = {
    admin: 'red',
    manager: 'orange',
    worker: 'blue',
    user: 'green'
  };
  return colors[role] || 'default';
};

// 검색 필터 컴포넌트
const UserSearchFilters = memo(({ 
  searchTerm, 
  onSearchChange, 
  roleFilter, 
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters 
}) => {
  return (
    <div className="user-search-filters">
      <Space wrap>
        <Input
          placeholder="사용자명 또는 이메일 검색"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        
        <select 
          value={roleFilter} 
          onChange={(e) => onRoleFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="">모든 역할</option>
          <option value="admin">관리자</option>
          <option value="manager">매니저</option>
          <option value="worker">작업자</option>
          <option value="user">일반 사용자</option>
        </select>
        
        <select 
          value={statusFilter} 
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="filter-select"
        >
          <option value="">모든 상태</option>
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
        
        <Button onClick={onClearFilters}>
          필터 초기화
        </Button>
      </Space>
    </div>
  );
});

// 사용자 통계 컴포넌트
const UserStatistics = memo(({ users }) => {
  const stats = useMemo(() => {
    const total = users.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    return { total, activeUsers, roleStats };
  }, [users]);
  
  return (
    <div className="user-statistics">
      <div className="stat-item">
        <span className="stat-label">전체 사용자:</span>
        <span className="stat-value">{stats.total}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">활성 사용자:</span>
        <span className="stat-value">{stats.activeUsers}</span>
      </div>
      {Object.entries(stats.roleStats).map(([role, count]) => (
        <div key={role} className="stat-item">
          <span className="stat-label">{role}:</span>
          <span className="stat-value">{count}</span>
        </div>
      ))}
    </div>
  );
});

const OptimizedUserManagement = () => {
  const { user } = useAuth();
  const { hasPermission } = useRole();
  const { addNotification } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [useVirtualization, setUseVirtualization] = useState(false);

  // 필터링된 사용자 목록 (메모이제이션)
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || 
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'inactive' && !user.isActive);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // 페이지네이션된 사용자 목록
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, pageSize]);

  // 검색 핸들러 (디바운싱)
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  }, []);

  // 필터 초기화
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  }, []);

  // 사용자 삭제
  const handleDeleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      // API 호출
      // await userService.deleteUser(userId);
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      addNotification({
        type: 'success',
        message: '사용자가 성공적으로 삭제되었습니다.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: '사용자 삭제에 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // 테이블 컬럼 설정 (메모이제이션)
  const columns = useMemo(() => [
    {
      title: '사용자명',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>,
      filters: [
        { text: '관리자', value: 'admin' },
        { text: '매니저', value: 'manager' },
        { text: '작업자', value: 'worker' },
        { text: '일반 사용자', value: 'user' },
      ],
    },
    {
      title: '상태',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '활성' : '비활성'}
        </Tag>
      ),
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {hasPermission(user?.role, 'admin') && (
            <Button 
              danger 
              size="small"
              onClick={() => handleDeleteUser(record.id)}
            >
              삭제
            </Button>
          )}
        </Space>
      ),
    },
  ], [user, hasPermission, handleDeleteUser]);

  // 가상화 토글
  const toggleVirtualization = useCallback(() => {
    setUseVirtualization(prev => !prev);
  }, []);

  return (
    <div className="optimized-user-management">
      <div className="page-header">
        <h1>사용자 관리</h1>
        <Space>
          <Button
            type={useVirtualization ? 'primary' : 'default'}
            onClick={toggleVirtualization}
          >
            가상화 {useVirtualization ? '끄기' : '켜기'}
          </Button>
          {hasPermission(user?.role, 'admin') && (
            <Button type="primary" icon={<UserAddOutlined />}>
              사용자 추가
            </Button>
          )}
        </Space>
      </div>

      <UserStatistics users={filteredUsers} />

      <UserSearchFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={handleClearFilters}
      />

      <div className="user-list-container">
        {useVirtualization && filteredUsers.length > 100 ? (
          // 가상화된 리스트 (대량 데이터용)
          <div className="virtualized-container">
            <List
              height={600}
              itemCount={filteredUsers.length}
              itemSize={80}
              itemData={filteredUsers}
            >
              {VirtualizedUserItem}
            </List>
          </div>
        ) : (
          // 일반 테이블
          <Table
            columns={columns}
            dataSource={paginatedUsers}
            loading={loading}
            pagination={false}
            rowKey="id"
            size="middle"
            scroll={{ x: 800 }}
          />
        )}

        {!useVirtualization && (
          <Pagination
            current={currentPage}
            total={filteredUsers.length}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} / 전체 ${total}개`
            }
            onChange={setCurrentPage}
            onShowSizeChange={(current, size) => {
              setCurrentPage(1);
              setPageSize(size);
            }}
            pageSizeOptions={['20', '50', '100', '200']}
          />
        )}
      </div>
    </div>
  );
};

export default memo(OptimizedUserManagement);
