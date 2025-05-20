import React, { createContext, useContext, useState } from 'react';
import { message } from 'antd';

const NotificationContext = createContext();

// useNotification에서 useNotifications로 이름 변경
export const useNotifications = () => useContext(NotificationContext);

// 기존 함수도 유지 (하위 호환성을 위해)
export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // 알림 추가
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      read: false,
      timestamp: new Date(),
      ...notification
    };
    
    setNotifications([newNotification, ...notifications]);
    
    // 화면에 표시 (Ant Design message 사용)
    if (notification.showMessage !== false) {
      message.info(notification.message);
    }
    
    return newNotification.id;
  };
  
  // 알림 읽음 처리
  const markAsRead = (notificationId) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // 모든 알림 읽음 처리
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };
  
  // 알림 삭제
  const removeNotification = (notificationId) => {
    setNotifications(
      notifications.filter(notification => notification.id !== notificationId)
    );
  };
  
  // 모든 알림 삭제
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  
  // 미읽은 알림 수 계산
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Context 값
  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;