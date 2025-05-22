import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { message } from 'antd';
import webSocketService from '../services/websocket/WebSocketService';
import { useAuth } from './AuthContext';

// 초기 상태
const initialState = {
  isConnected: false,
  isConnecting: false,
  connectionState: 'disconnected',
  lastConnectedAt: null,
  reconnectAttempts: 0,
  error: null,
  notifications: [],
  unreadCount: 0,
  typingUsers: new Map(),
  onlineUsers: new Set(),
  roomMessages: new Map(),
  connectionHistory: []
};

// 액션 타입
const actionTypes = {
  SET_CONNECTION_STATE: 'SET_CONNECTION_STATE',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  SET_TYPING_USER: 'SET_TYPING_USER',
  REMOVE_TYPING_USER: 'REMOVE_TYPING_USER',
  UPDATE_ONLINE_USERS: 'UPDATE_ONLINE_USERS',
  ADD_ROOM_MESSAGE: 'ADD_ROOM_MESSAGE',
  ADD_CONNECTION_HISTORY: 'ADD_CONNECTION_HISTORY'
};

// 리듀서
const realtimeReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_CONNECTION_STATE:
      return {
        ...state,
        connectionState: action.payload,
        isConnecting: action.payload === 'connecting' || action.payload === 'reconnecting',
        isConnected: action.payload === 'connected',
        reconnectAttempts: action.meta?.reconnectAttempts || state.reconnectAttempts
      };

    case actionTypes.SET_CONNECTED:
      return {
        ...state,
        isConnected: true,
        isConnecting: false,
        connectionState: 'connected',
        lastConnectedAt: new Date(),
        reconnectAttempts: 0,
        error: null
      };

    case actionTypes.SET_DISCONNECTED:
      return {
        ...state,
        isConnected: false,
        isConnecting: false,
        connectionState: 'disconnected',
        typingUsers: new Map(),
        onlineUsers: new Set()
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isConnecting: false
      };

    case actionTypes.ADD_NOTIFICATION:
      const notification = {
        id: action.payload.id || Date.now().toString(),
        timestamp: new Date(),
        read: false,
        ...action.payload
      };
      
      return {
        ...state,
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };

    case actionTypes.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(
        n => n.id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length
      };

    case actionTypes.MARK_NOTIFICATION_READ:
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
      };

    case actionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case actionTypes.SET_TYPING_USER:
      const newTypingUsers = new Map(state.typingUsers);
      newTypingUsers.set(action.payload.userId, {
        username: action.payload.username,
        room: action.payload.room,
        timestamp: Date.now()
      });
      return {
        ...state,
        typingUsers: newTypingUsers
      };

    case actionTypes.REMOVE_TYPING_USER:
      const updatedTypingUsers = new Map(state.typingUsers);
      updatedTypingUsers.delete(action.payload);
      return {
        ...state,
        typingUsers: updatedTypingUsers
      };

    case actionTypes.UPDATE_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: new Set(action.payload)
      };

    case actionTypes.ADD_ROOM_MESSAGE:
      const roomMessages = new Map(state.roomMessages);
      const roomId = action.payload.roomId;
      const existingMessages = roomMessages.get(roomId) || [];
      roomMessages.set(roomId, [...existingMessages, action.payload.message]);
      
      return {
        ...state,
        roomMessages
      };

    case actionTypes.ADD_CONNECTION_HISTORY:
      return {
        ...state,
        connectionHistory: [
          action.payload,
          ...state.connectionHistory.slice(0, 49) // 최대 50개 기록 유지
        ]
      };

    default:
      return state;
  }
};

// 컨텍스트 생성
const RealtimeContext = createContext();

// Provider 컴포넌트
export const RealtimeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(realtimeReducer, initialState);
  const { user, token } = useAuth();

  // WebSocket 연결
  const connect = useCallback(async () => {
    if (!user || !token) {
      console.log('User not authenticated, skipping WebSocket connection');
      return;
    }

    if (state.isConnected || state.isConnecting) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
      await webSocketService.connect(wsUrl, token);
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    }
  }, [user, token, state.isConnected, state.isConnecting]);

  // WebSocket 연결 해제
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // 메시지 전송
  const sendMessage = useCallback((type, data) => {
    const success = webSocketService.send({
      type,
      data,
      timestamp: Date.now(),
      userId: user?.id
    });

    if (!success) {
      message.warning('메시지 전송에 실패했습니다. 연결 상태를 확인해 주세요.');
    }

    return success;
  }, [user]);

  // 실시간 알림 추가
  const addRealtimeNotification = useCallback((notification) => {
    dispatch({ type: actionTypes.ADD_NOTIFICATION, payload: notification });
    
    // 브라우저 알림 표시
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title || '새 알림', {
        body: notification.message,
        icon: '/logo192.png',
        tag: notification.id
      });
    }
  }, []);

  // 알림 읽음 처리
  const markNotificationAsRead = useCallback((notificationId) => {
    dispatch({ type: actionTypes.MARK_NOTIFICATION_READ, payload: notificationId });
    
    // 서버에도 읽음 상태 전송
    sendMessage('mark_notification_read', { notificationId });
  }, [sendMessage]);

  // 타이핑 상태 전송
  const sendTypingStatus = useCallback((room, isTyping) => {
    sendMessage('typing', { room, isTyping });
  }, [sendMessage]);

  // 방 참가
  const joinRoom = useCallback((roomId) => {
    sendMessage('join_room', { roomId });
  }, [sendMessage]);

  // 방 떠나기
  const leaveRoom = useCallback((roomId) => {
    sendMessage('leave_room', { roomId });
  }, [sendMessage]);

  // WebSocket 이벤트 핸들러 설정
  useEffect(() => {
    // 연결 상태 변화 핸들러
    webSocketService.onStateChange = (newState, oldState) => {
      dispatch({ 
        type: actionTypes.SET_CONNECTION_STATE, 
        payload: newState,
        meta: { oldState }
      });

      // 연결 기록 추가
      dispatch({
        type: actionTypes.ADD_CONNECTION_HISTORY,
        payload: {
          timestamp: new Date(),
          state: newState,
          previousState: oldState
        }
      });
    };

    // 연결 성공 핸들러
    webSocketService.onOpen = () => {
      dispatch({ type: actionTypes.SET_CONNECTED });
      message.success('실시간 연결이 설정되었습니다.');
    };

    // 연결 종료 핸들러
    webSocketService.onClose = () => {
      dispatch({ type: actionTypes.SET_DISCONNECTED });
    };

    // 오류 핸들러
    webSocketService.onError = (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      message.error('실시간 연결에 문제가 발생했습니다.');
    };

    // 재연결 핸들러
    webSocketService.onReconnect = (attempt) => {
      message.info(`재연결 시도 중... (${attempt}번째)`);
    };

    return () => {
      // 이벤트 핸들러 정리
      webSocketService.onStateChange = null;
      webSocketService.onOpen = null;
      webSocketService.onClose = null;
      webSocketService.onError = null;
      webSocketService.onReconnect = null;
    };
  }, []);

  // 메시지 타입별 핸들러 등록
  useEffect(() => {
    // 알림 메시지 핸들러
    const handleNotification = (data) => {
      addRealtimeNotification(data.data);
    };

    // 타이핑 상태 핸들러
    const handleTyping = (data) => {
      const { userId, username, room, isTyping } = data.data;
      
      if (isTyping) {
        dispatch({
          type: actionTypes.SET_TYPING_USER,
          payload: { userId, username, room }
        });
        
        // 3초 후 자동으로 타이핑 상태 제거
        setTimeout(() => {
          dispatch({
            type: actionTypes.REMOVE_TYPING_USER,
            payload: userId
          });
        }, 3000);
      } else {
        dispatch({
          type: actionTypes.REMOVE_TYPING_USER,
          payload: userId
        });
      }
    };

    // 온라인 사용자 업데이트 핸들러
    const handleOnlineUsers = (data) => {
      dispatch({
        type: actionTypes.UPDATE_ONLINE_USERS,
        payload: data.data.users
      });
    };

    // 룸 메시지 핸들러
    const handleRoomMessage = (data) => {
      dispatch({
        type: actionTypes.ADD_ROOM_MESSAGE,
        payload: {
          roomId: data.data.roomId,
          message: data.data
        }
      });
    };

    // 리스너 등록
    webSocketService.addEventListener('notification', handleNotification);
    webSocketService.addEventListener('typing', handleTyping);
    webSocketService.addEventListener('online_users', handleOnlineUsers);
    webSocketService.addEventListener('room_message', handleRoomMessage);

    return () => {
      // 리스너 제거
      webSocketService.removeEventListener('notification', handleNotification);
      webSocketService.removeEventListener('typing', handleTyping);
      webSocketService.removeEventListener('online_users', handleOnlineUsers);
      webSocketService.removeEventListener('room_message', handleRoomMessage);
    };
  }, [addRealtimeNotification]);

  // 사용자 인증 상태에 따른 연결 관리
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // 페이지 가시성 변화에 따른 연결 관리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨진 경우
        console.log('Page hidden, reducing WebSocket activity');
      } else {
        // 페이지가 다시 보이는 경우
        console.log('Page visible, resuming WebSocket activity');
        if (user && token && !state.isConnected) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, token, state.isConnected, connect]);

  const value = {
    // 상태
    ...state,
    
    // 액션
    connect,
    disconnect,
    sendMessage,
    addRealtimeNotification,
    markNotificationAsRead,
    sendTypingStatus,
    joinRoom,
    leaveRoom,
    
    // 유틸리티
    clearNotifications: () => dispatch({ type: actionTypes.CLEAR_NOTIFICATIONS }),
    removeNotification: (id) => dispatch({ type: actionTypes.REMOVE_NOTIFICATION, payload: id }),
    getConnectionStats: () => webSocketService.getStats()
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// 커스텀 훅
export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
};

export default RealtimeContext;
