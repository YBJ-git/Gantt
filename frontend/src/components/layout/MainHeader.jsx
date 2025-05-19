import React, { useState } from 'react';
import { Layout, Menu, Typography, Badge, Dropdown, Avatar, Space, Button } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import './MainHeader.scss';

const { Header } = Layout;
const { Title } = Typography;

const MainHeader = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotifications();
  const [unreadCount, setUnreadCount] = useState(notifications?.filter(n => !n.read).length || 0);

  const handleMenuClick = ({ key }) => {
    if (key === 'profile') {
      // 프로필 페이지로 이동
    } else if (key === 'settings') {
      // 설정 페이지로 이동
    } else if (key === 'logout') {
      // 로그아웃 처리
    }
  };

  const handleNotificationRead = (id) => {
    markAsRead(id);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const userMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        내 프로필
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        설정
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        로그아웃
      </Menu.Item>
    </Menu>
  );

  const notificationItems = notifications?.map(notification => ({
    key: notification.id,
    label: (
      <div onClick={() => handleNotificationRead(notification.id)}>
        <p className={notification.read ? 'notification-read' : 'notification-unread'}>
          {notification.message}
        </p>
        <small>{new Date(notification.timestamp).toLocaleString()}</small>
      </div>
    )
  })) || [];

  const notificationMenu = (
    <Menu
      items={notificationItems.length ? notificationItems : [{ key: 'empty', label: '알림이 없습니다' }]}
      style={{ maxHeight: '400px', overflow: 'auto', width: '300px' }}
    />
  );

  return (
    <Header className="main-header">
      <div className="logo" onClick={() => navigate('/')}>
        WMS
      </div>
      <Title level={3} className="header-title">
        작업 부하 관리 시스템
      </Title>
      <div className="header-right">
        <Space size="large">
          <Button 
            type="text" 
            icon={<QuestionCircleOutlined />} 
            onClick={() => navigate('/help')}
          />
          <Dropdown overlay={notificationMenu} placement="bottomRight" trigger={['click']}>
            <Badge count={unreadCount} overflowCount={99}>
              <Button
                type="text"
                icon={<BellOutlined />}
                className="notification-button"
              />
            </Badge>
          </Dropdown>
          <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
            <Avatar icon={<UserOutlined />} />
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default MainHeader;
