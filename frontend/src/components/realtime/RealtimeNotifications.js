import React, { useState, useEffect, useRef } from 'react';
import { 
  Badge, 
  Dropdown, 
  List, 
  Empty, 
  Typography, 
  Space, 
  Button, 
  Tooltip,
  Divider,
  Avatar,
  Tag
} from 'antd';
import { 
  BellOutlined, 
  CloseOutlined, 
  CheckOutlined,
  DeleteOutlined,
  SettingOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import { useRealtime } from '../../contexts/RealtimeContext';
import { useNotification } from '../../contexts/NotificationContext';
import './RealtimeNotifications.css';

const { Text, Title } = Typography;

const RealtimeNotifications = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    connectionState,
    markNotificationAsRead,
    removeNotification,
    clearNotifications,
    connect,
    disconnect
  } = useRealtime();
  
  const { addNotification } = useNotification();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  
  const notificationSound = useRef(null);

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        addNotification({
          type: 'success',
          message: '브라우저 알림이 활성화되었습니다.'
        });
      }
    }
  };

  // 알림 소리 재생
  const playNotificationSound = () => {
    if (notificationSound.current) {
      notificationSound.current.currentTime = 0;
      notificationSound.current.play().catch(console.error);
    }
  };

  // 새 알림 처리
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      
      // 읽지 않은 알림인 경우 소리 재생
      if (!latestNotification.read) {
        playNotificationSound();
      }
    }
  }, [notifications]);

  // 알림 아이템 렌더링
  const renderNotificationItem = (item) => {
    const handleMarkAsRead = (e) => {
      e.stopPropagation();
      markNotificationAsRead(item.id);
    };

    const handleRemove = (e) => {
      e.stopPropagation();
      removeNotification(item.id);
    };

    const getNotificationIcon = (type) => {
      switch (type) {
        case 'task':
          return '📋';
        case 'user':
          return '👤';
        case 'system':
          return '⚙️';
        case 'alert':
          return '⚠️';
        default:
          return '📢';
      }
    };

    const getNotificationColor = (type) => {
      switch (type) {
        case 'task':
          return '#1890ff';
        case 'user':
          return '#52c41a';
        case 'system':
          return '#722ed1';
        case 'alert':
          return '#fa541c';
        default:
          return '#13c2c2';
      }
    };

    return (
      <List.Item
        key={item.id}
        className={`notification-item ${!item.read ? 'unread' : ''}`}
        actions={[
          !item.read && (
            <Tooltip title="읽음으로 표시">
              <Button 
                type="text" 
                size="small" 
                icon={<CheckOutlined />}
                onClick={handleMarkAsRead}
              />
            </Tooltip>
          ),
          <Tooltip title="삭제">
            <Button 
              type="text" 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              danger
            />
          </Tooltip>
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={
            <Avatar 
              size="small" 
              style={{ backgroundColor: getNotificationColor(item.type) }}
            >
              {getNotificationIcon(item.type)}
            </Avatar>
          }
          title={
            <Space>
              <Text strong={!item.read} className="notification-title">
                {item.title}
              </Text>
              {!item.read && <Tag color="red" size="small">NEW</Tag>}
            </Space>
          }
          description={
            <div className="notification-content">
              <Text className="notification-message">
                {item.message}
              </Text>
              <Text type="secondary" className="notification-time">
                {formatTimeAgo(item.timestamp)}
              </Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  // 시간 포맷 함수
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}분 전`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    } else {
      return time.toLocaleDateString();
    }
  };

  // 연결 상태 표시
  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return {
          icon: <WifiOutlined style={{ color: '#52c41a' }} />,
          text: '연결됨',
          color: '#52c41a'
        };
      case 'connecting':
      case 'reconnecting':
        return {
          icon: <WifiOutlined style={{ color: '#1890ff' }} />,
          text: '연결 중...',
          color: '#1890ff'
        };
      case 'disconnected':
      default:
        return {
          icon: <DisconnectOutlined style={{ color: '#ff4d4f' }} />,
          text: '연결 끊김',
          color: '#ff4d4f'
        };
    }
  };

  const connectionStatus = getConnectionStatus();

  // 드롭다운 메뉴 콘텐츠
  const dropdownContent = (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <Space justify="space-between" style={{ width: '100%' }}>
          <Title level={5} style={{ margin: 0 }}>
            알림 ({unreadCount}개 읽지 않음)
          </Title>
          <Space>
            <Tooltip title="연결 상태">
              <Space size={4}>
                {connectionStatus.icon}
                <Text style={{ color: connectionStatus.color, fontSize: 12 }}>
                  {connectionStatus.text}
                </Text>
              </Space>
            </Tooltip>
            <Tooltip title="모두 삭제">
              <Button 
                type="text" 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={clearNotifications}
                disabled={notifications.length === 0}
              />
            </Tooltip>
          </Space>
        </Space>
      </div>

      <Divider style={{ margin: '8px 0' }} />

      {/* 브라우저 알림 권한 요청 */}
      {notificationPermission === 'default' && (
        <div className="notification-permission-request">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary">
              실시간 알림을 받으려면 브라우저 알림을 허용해 주세요.
            </Text>
            <Button 
              size="small" 
              type="primary" 
              onClick={requestNotificationPermission}
            >
              알림 허용
            </Button>
          </Space>
          <Divider style={{ margin: '8px 0' }} />
        </div>
      )}

      <div className="notifications-list">
        {notifications.length > 0 ? (
          <List
            dataSource={notifications.slice(0, 10)} // 최대 10개만 표시
            renderItem={renderNotificationItem}
            size="small"
          />
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="새로운 알림이 없습니다"
            style={{ padding: '20px 0' }}
          />
        )}
      </div>

      {notifications.length > 10 && (
        <div className="notifications-footer">
          <Divider style={{ margin: '8px 0' }} />
          <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
            {notifications.length - 10}개의 알림이 더 있습니다
          </Text>
        </div>
      )}

      {!isConnected && (
        <div className="connection-actions">
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button 
              size="small" 
              type="primary" 
              onClick={connect}
              loading={connectionState === 'connecting'}
            >
              다시 연결
            </Button>
          </Space>
        </div>
      )}
    </div>
  );

  return (
    <div className="realtime-notifications">
      {/* 알림 소리용 오디오 엘리먼트 */}
      <audio
        ref={notificationSound}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
      </audio>

      <Dropdown
        overlay={dropdownContent}
        trigger={['click']}
        placement="bottomRight"
        overlayClassName="notifications-dropdown-overlay"
        open={dropdownVisible}
        onOpenChange={setDropdownVisible}
      >
        <Button 
          type="text" 
          className="notification-button"
          size="large"
        >
          <Badge 
            count={unreadCount} 
            size="small"
            offset={[0, 0]}
          >
            <BellOutlined 
              style={{ 
                fontSize: 18,
                color: isConnected ? '#1890ff' : '#999'
              }} 
            />
          </Badge>
        </Button>
      </Dropdown>
    </div>
  );
};

export default RealtimeNotifications;
