import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  ScheduleOutlined,
  LineChartOutlined,
  ToolOutlined,
  MessageOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

const { Sider } = Layout;

const MainSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const collapsed = useSelector(state => state.ui.sidebarCollapsed);

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  // 현재 선택된 메뉴 항목 결정
  const selectedKeys = [location.pathname === '/' ? '/dashboard' : location.pathname];

  // 메뉴 항목
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '대시보드',
      onClick: () => navigate('/')
    },
    {
      key: '/resources',
      icon: <TeamOutlined />,
      label: '리소스 관리',
      onClick: () => navigate('/resources')
    },
    {
      key: '/tasks',
      icon: <ScheduleOutlined />,
      label: '작업 관리',
      onClick: () => navigate('/tasks')
    },
    {
      key: '/optimization',
      icon: <ToolOutlined />,
      label: '부하 최적화 도구',
      onClick: () => navigate('/optimization')
    },
    {
      key: '/reports',
      icon: <LineChartOutlined />,
      label: '보고서 및 분석',
      onClick: () => navigate('/reports')
    },
    {
      key: '/collaboration',
      icon: <MessageOutlined />,
      label: '협업 및 알림',
      onClick: () => navigate('/collaboration')
    },
    {
      key: '/test',
      icon: <ExperimentOutlined />,
      label: '테스트 페이지',
      onClick: () => navigate('/test')
    }
  ];

  return (
    <Sider 
      width={220} 
      theme="light"
      collapsible
      collapsed={collapsed}
      trigger={null}
      style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}
    >
      <div className="logo-container" style={{ 
        padding: '16px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        marginBottom: '8px'
      }}>
        {!collapsed ? (
          <h1 style={{ margin: 0, fontSize: '18px' }}>작업 부하 관리</h1>
        ) : (
          <h1 style={{ margin: 0, fontSize: '18px' }}>WM</h1>
        )}
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        items={menuItems}
        style={{ border: 'none' }}
      />
      
      <div style={{ 
        position: 'absolute', 
        bottom: '16px', 
        width: '100%', 
        textAlign: 'center' 
      }}>
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
          onClick={toggleSidebar}
          style={{ width: '90%' }}
        >
          {!collapsed && '메뉴 접기'}
        </Button>
      </div>
    </Sider>
  );
};

export default MainSidebar;