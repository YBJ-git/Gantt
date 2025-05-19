import React from 'react';
import { Layout, Button, Avatar, Badge, Dropdown, Space, Tooltip, Typography } from 'antd';
import { 
  BellOutlined, 
  UserOutlined, 
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useNotification } from '../../contexts/NotificationContext';

const { Header } = Layout;
const { Text } = Typography;

const MainHeader = () => {
  const { notifications, unreadCount, markAllAsRead } = useNotification();

  // 사용자 메뉴 아이템
  const userMenuItems = {
    items: [
      {
        key: 'profile',
        label: '프로필 설정',
        icon: <UserOutlined />,
      },
      {
        key: 'settings',
        label: '시스템 설정',
        icon: <SettingOutlined />,
      },
      {
        key: 'help',
        label: '도움말',
        icon: <QuestionCircleOutlined />,
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        label: '로그아웃',
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
  };

  // 알림 메뉴 렌더링
  const notificationMenuItems = {
    items: [
      {
        key: 'header',
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>알림</Text>
            <Button 
              type="text" 
              size="small" 
              icon={<CheckOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
            >
              모두 읽음
            </Button>
          </div>
        ),
        disabled: true,
      },
      ...notifications.slice(0, 5).map(notification => ({
        key: notification.id,
        label: (
          <div>
            <Text style={{ opacity: notification.read ? 0.6 : 1 }}>
              {notification.message}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {new Date(notification.timestamp).toLocaleString()}
              </Text>
            </div>
          </div>
        ),
        icon: notification.read ? null : (
          <Badge color="blue" style={{ marginRight: '8px' }} />
        ),
      })),
      {
        type: 'divider',
      },
      {
        key: 'viewAll',
        label: '모든 알림 보기',
      },
    ],
  };

  return (
    <Header className="main-header" style={{ 
      background: '#fff', 
      padding: '0 16px', 
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      zIndex: 1
    }}>
      <Space size="large">
        {/* 알림 버튼 */}
        <Dropdown 
          menu={notificationMenuItems} 
          placement="bottomRight" 
          arrow={{ pointAtCenter: true }}
          trigger={['click']}
        >
          <Badge count={unreadCount} size="small">
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
        </Dropdown>
        
        {/* 사용자 메뉴 */}
        <Dropdown 
          menu={userMenuItems}
          placement="bottomRight" 
          arrow={{ pointAtCenter: true }}
          trigger={['click']}
        >
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text>관리자</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default MainHeader;