import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// 기본 알림 설정
const defaultSettings = {
  email: true,
  push: true,
  inApp: true,
  types: {
    task: true,
    system: true,
    security: true,
    activity: true
  }
};

// useNotification에서 useNotifications로 이름 변경
export const useNotifications = () => useContext(NotificationContext);

// 기존 함수도 유지 (하위 호환성을 위해)
export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    inApp: true,
    types: {
      task: true,
      system: true,
      security: true,
      activity: true
    }
  });
  
  const { user, isAuthenticated } = useAuth();
  
  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('알림 목록 조회 중 오류:', err);
      setError(err.message || '알림을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // 알림 설정 조회
  const fetchNotificationSettings = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await notificationService.getNotificationSettings();
      setSettings(data.settings || defaultSettings);
    } catch (err) {
      console.error('알림 설정 조회 중 오류:', err);
    }
  }, [isAuthenticated]);
  
  // 초기 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchNotificationSettings();
    }
  }, [isAuthenticated, fetchNotifications, fetchNotificationSettings]);
  
  // 실시간 알림 업데이트 (폴링 방식, 향후 웹소켓으로 대체 가능)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // 1분마다 업데이트
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, fetchNotifications]);

  // 알림 추가
  const addNotification = useCallback(async (notification) => {
    try {
      // 클라이언트 측 알림 생성
      const newNotification = {
        id: notification.id || Date.now(),
        read: false,
        timestamp: notification.timestamp || new Date(),
        type: notification.type || 'system',
        ...notification
      };
      
      // 화면에 표시 (인앱 알림 활성화 여부 확인)
      if (notification.showMessage !== false && settings.inApp && settings.types[notification.type || 'system']) {
        const messageType = notification.messageType || 'info';
        
        switch (messageType) {
          case 'success':
            message.success(notification.message);
            break;
          case 'error':
            message.error(notification.message);
            break;
          case 'warning':
            message.warning(notification.message);
            break;
          default:
            message.info(notification.message);
        }
      }
      
      // 알림 목록 업데이트
      setNotifications(prev => [newNotification, ...prev]);
      
      return newNotification.id;
    } catch (error) {
      console.error('알림 추가 중 오류:', error);
      throw error;
    }
  }, [settings]);
  
  // 알림 읽음 처리
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // 서버에 알림 읽음 상태 업데이트
      if (isAuthenticated) {
        await notificationService.markAsRead(notificationId);
      }
      
      // 클라이언트 알림 상태 업데이트
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('알림 읽음 처리 중 오류:', error);
      throw error;
    }
  }, [notifications, isAuthenticated]);
  
  // 모든 알림 읽음 처리
  const markAllAsRead = useCallback(async () => {
    try {
      // 서버에 모든 알림 읽음 상태 업데이트
      if (isAuthenticated) {
        await notificationService.markAllAsRead();
      }
      
      // 클라이언트 알림 상태 업데이트
      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('전체 알림 읽음 처리 중 오류:', error);
      throw error;
    }
  }, [notifications, isAuthenticated]);
  
  // 알림 삭제
  const removeNotification = useCallback((notificationId) => {
    setNotifications(
      notifications.filter(notification => notification.id !== notificationId)
    );
  }, [notifications]);
  
  // 모든 알림 삭제
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // 알림 설정 업데이트
  const updateNotificationSettings = useCallback(async (newSettings) => {
    try {
      // 서버에 알림 설정 업데이트
      if (isAuthenticated) {
        await notificationService.updateNotificationSettings(newSettings);
      }
      
      // 클라이언트 설정 업데이트
      setSettings(newSettings);
    } catch (error) {
      console.error('알림 설정 업데이트 중 오류:', error);
      throw error;
    }
  }, [isAuthenticated]);
  
  // 특정 알림 유형 활성화/비활성화
  const toggleNotificationType = useCallback(async (type, enabled) => {
    try {
      // 서버에 알림 유형 설정 업데이트
      if (isAuthenticated) {
        await notificationService.toggleNotificationType(type, enabled);
      }
      
      // 클라이언트 설정 업데이트
      setSettings(prev => ({
        ...prev,
        types: {
          ...prev.types,
          [type]: enabled
        }
      }));
    } catch (error) {
      console.error('알림 유형 설정 변경 중 오류:', error);
      throw error;
    }
  }, [isAuthenticated]);
  
  // 특정 알림 채널 활성화/비활성화
  const toggleNotificationChannel = useCallback(async (channel, enabled) => {
    try {
      // 서버에 알림 채널 설정 업데이트
      if (isAuthenticated) {
        await notificationService.toggleNotificationChannel(channel, enabled);
      }
      
      // 클라이언트 설정 업데이트
      setSettings(prev => ({
        ...prev,
        [channel]: enabled
      }));
    } catch (error) {
      console.error('알림 채널 설정 변경 중 오류:', error);
      throw error;
    }
  }, [isAuthenticated]);
  
  // 미읽은 알림 수 계산
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  // Context 값
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    fetchNotifications,
    updateNotificationSettings,
    toggleNotificationType,
    toggleNotificationChannel
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export { NotificationProvider };
export default NotificationProvider;