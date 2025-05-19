import React, { createContext, useState, useContext, useEffect } from 'react';

// 초기 더미 알림 데이터
const initialNotifications = [
  {
    id: 1,
    message: '개발자 C의 작업 부하가 임계치를 초과했습니다.',
    timestamp: new Date().getTime() - 3600000,
    read: false,
    type: 'warning',
    link: '/resources/3' // 개발자 C의 리소스 페이지 링크
  },
  {
    id: 2,
    message: '새로운 최적화 추천이 생성되었습니다.',
    timestamp: new Date().getTime() - 7200000,
    read: false,
    type: 'info',
    link: '/optimization'
  },
  {
    id: 3,
    message: '홍길동님이 작업 "백엔드 개발"에 댓글을 남겼습니다.',
    timestamp: new Date().getTime() - 86400000,
    read: true,
    type: 'message',
    link: '/tasks/102'
  }
];

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  
  // 새 알림 추가
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: Date.now(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // 브라우저 알림 표시 (권한이 있는 경우)
    if (Notification.permission === 'granted') {
      new Notification('작업 부하 관리 시스템', {
        body: notification.message
      });
    }
  };
  
  // 알림을 읽음으로 표시
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };
  
  // 모든 알림을 읽음으로 표시
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };
  
  // 알림 삭제
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };
  
  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);
  
  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
