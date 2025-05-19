import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  BarChartOutlined, 
  TeamOutlined, 
  AppstoreOutlined,
  MessageOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainSidebar.scss';

const { Sider } = Layout;

const MainSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 현재 경로에 따라 선택된 메뉴 항목 결정
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    if (path.startsWith('/reports')) return ['reports'];
    if (path.startsWith('/resources')) return ['resources'];
    if (path.startsWith('/tasks')) return ['tasks'];
    if (path.startsWith('/collaboration')) return ['collaboration'];
    if (path.startsWith('/optimization')) return ['optimization'];
    return ['dashboard'];
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
      onClick: () => navigate('/')
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: '보고서 및 분석',
      onClick: () => navigate('/reports')
    },
    {
      key: 'resources',
      icon: <TeamOutlined />,
      label: '리소스 관리',
      onClick: () => navigate('/resources')
    },
    {
      key: 'tasks',
      icon: <AppstoreOutlined />,
      label: '작업 관리',
      onClick: () => navigate('/tasks')
    },
    {
      key: 'collaboration',
      icon: <MessageOutlined />,
      label: '협업 및 알림',
      onClick: () => navigate('/collaboration')
    },
    {
      key: 'optimization',
      icon: <ToolOutlined />,
      label: '부하 최적화',
      onClick: () => navigate('/optimization')
    }
  ];

  return (
    <Sider
      width={220}
      collapsible
      collapsed={collapsed}
      onCollapse={value => setCollapsed(value)}
      className="main-sidebar"
    >
      <Menu
        mode="inline"
        selectedKeys={getSelectedKey()}
        className="sidebar-menu"
        items={menuItems}
      />
    </Sider>
  );
};

export default MainSidebar;
