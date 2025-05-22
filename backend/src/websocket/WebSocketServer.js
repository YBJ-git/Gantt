const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { EventEmitter } = require('events');

class WebSocketServer extends EventEmitter {
  constructor(server, options = {}) {
    super();
    
    this.wss = new WebSocket.Server({ 
      server,
      path: options.path || '/ws',
      ...options 
    });
    
    this.clients = new Map(); // clientId -> { ws, user, rooms, lastPing }
    this.rooms = new Map(); // roomId -> Set<clientId>
    this.userSessions = new Map(); // userId -> Set<clientId>
    
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.heartbeatTimeout = options.heartbeatTimeout || 10000;
    
    this.setupHeartbeat();
    this.setupEventHandlers();
    
    console.log('WebSocket Server initialized');
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws, request) => {
      this.handleConnection(ws, request);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket Server error:', error);
      this.emit('error', error);
    });
  }

  async handleConnection(ws, request) {
    const clientId = this.generateClientId();
    let user = null;

    try {
      // URL에서 토큰 추출
      const url = new URL(request.url, `http://${request.headers.host}`);
      const token = url.searchParams.get('token');

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          user = decoded;
          console.log(`User ${user.id} connected via WebSocket`);
        } catch (jwtError) {
          console.error('Invalid JWT token:', jwtError.message);
          ws.close(1008, 'Invalid token');
          return;
        }
      }

      // 클라이언트 정보 저장
      this.clients.set(clientId, {
        ws,
        user,
        rooms: new Set(),
        lastPing: Date.now(),
        connectedAt: new Date()
      });

      // 사용자 세션 관리
      if (user) {
        if (!this.userSessions.has(user.id)) {
          this.userSessions.set(user.id, new Set());
        }
        this.userSessions.get(user.id).add(clientId);
        
        // 온라인 사용자 업데이트 브로드캐스트
        this.broadcastOnlineUsers();
      }

      // WebSocket 이벤트 핸들러 설정
      ws.on('message', (message) => {
        this.handleMessage(clientId, message);
      });

      ws.on('close', (code, reason) => {
        this.handleDisconnection(clientId, code, reason);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket client error (${clientId}):`, error);
        this.handleDisconnection(clientId, 1006, 'Connection error');
      });

      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastPing = Date.now();
        }
      });

      // 연결 성공 메시지 전송
      this.sendToClient(clientId, {
        type: 'connection',
        data: {
          clientId,
          message: 'Connected to WebSocket server',
          timestamp: new Date()
        }
      });

      this.emit('connection', { clientId, user, ws });

    } catch (error) {
      console.error('Error handling WebSocket connection:', error);
      ws.close(1011, 'Server error');
    }
  }

  handleMessage(clientId, message) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(clientId);
      
      if (!client) {
        console.error(`Client ${clientId} not found`);
        return;
      }

      // 하트비트 응답 처리
      if (data.type === 'ping') {
        client.lastPing = Date.now();
        this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
        return;
      }

      console.log(`Message from ${clientId} (${client.user?.username || 'anonymous'}):`, data);

      // 메시지 타입별 처리
      switch (data.type) {
        case 'join_room':
          this.handleJoinRoom(clientId, data.data);
          break;
          
        case 'leave_room':
          this.handleLeaveRoom(clientId, data.data);
          break;
          
        case 'room_message':
          this.handleRoomMessage(clientId, data.data);
          break;
          
        case 'typing':
          this.handleTyping(clientId, data.data);
          break;
          
        case 'notification':
          this.handleNotification(clientId, data.data);
          break;
          
        case 'mark_notification_read':
          this.handleMarkNotificationRead(clientId, data.data);
          break;
          
        default:
          console.log(`Unknown message type: ${data.type}`);
          this.emit('message', { clientId, type: data.type, data: data.data, client });
      }

    } catch (error) {
      console.error(`Error parsing message from ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'error',
        data: { message: 'Invalid message format' }
      });
    }
  }

  handleDisconnection(clientId, code, reason) {
    const client = this.clients.get(clientId);
    
    if (client) {
      console.log(`Client ${clientId} disconnected: ${code} ${reason}`);
      
      // 방에서 제거
      client.rooms.forEach(roomId => {
        this.leaveRoom(clientId, roomId);
      });
      
      // 사용자 세션에서 제거
      if (client.user) {
        const userSessions = this.userSessions.get(client.user.id);
        if (userSessions) {
          userSessions.delete(clientId);
          if (userSessions.size === 0) {
            this.userSessions.delete(client.user.id);
          }
        }
        
        // 온라인 사용자 업데이트 브로드캐스트
        this.broadcastOnlineUsers();
      }
      
      this.clients.delete(clientId);
      this.emit('disconnection', { clientId, client, code, reason });
    }
  }

  handleJoinRoom(clientId, data) {
    const { roomId } = data;
    const client = this.clients.get(clientId);
    
    if (!client || !roomId) return;

    this.joinRoom(clientId, roomId);
    
    this.sendToClient(clientId, {
      type: 'room_joined',
      data: { roomId, message: `Joined room ${roomId}` }
    });

    // 방의 다른 사용자들에게 알림
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      data: {
        roomId,
        user: client.user,
        message: `${client.user?.username || 'Anonymous'} joined the room`
      }
    }, clientId);
  }

  handleLeaveRoom(clientId, data) {
    const { roomId } = data;
    const client = this.clients.get(clientId);
    
    if (!client || !roomId) return;

    this.leaveRoom(clientId, roomId);
    
    this.sendToClient(clientId, {
      type: 'room_left',
      data: { roomId, message: `Left room ${roomId}` }
    });

    // 방의 다른 사용자들에게 알림
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      data: {
        roomId,
        user: client.user,
        message: `${client.user?.username || 'Anonymous'} left the room`
      }
    });
  }

  handleRoomMessage(clientId, data) {
    const { roomId, message } = data;
    const client = this.clients.get(clientId);
    
    if (!client || !roomId || !message) return;

    const messageData = {
      type: 'room_message',
      data: {
        roomId,
        message,
        sender: client.user,
        timestamp: new Date(),
        messageId: this.generateMessageId()
      }
    };

    this.broadcastToRoom(roomId, messageData);
    this.emit('room_message', { clientId, roomId, message, sender: client.user });
  }

  handleTyping(clientId, data) {
    const { room, isTyping } = data;
    const client = this.clients.get(clientId);
    
    if (!client || !room) return;

    this.broadcastToRoom(room, {
      type: 'typing',
      data: {
        userId: client.user?.id,
        username: client.user?.username,
        room,
        isTyping
      }
    }, clientId);
  }

  handleNotification(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // 알림을 특정 사용자나 모든 사용자에게 전송
    if (data.targetUserId) {
      this.sendToUser(data.targetUserId, {
        type: 'notification',
        data: {
          ...data,
          from: client.user,
          timestamp: new Date()
        }
      });
    } else {
      this.broadcast({
        type: 'notification',
        data: {
          ...data,
          from: client.user,
          timestamp: new Date()
        }
      });
    }
  }

  handleMarkNotificationRead(clientId, data) {
    const { notificationId } = data;
    const client = this.clients.get(clientId);
    
    if (!client || !notificationId) return;

    // 데이터베이스에서 알림 읽음 처리 로직 추가 필요
    console.log(`Notification ${notificationId} marked as read by user ${client.user?.id}`);
    
    this.emit('notification_read', { 
      clientId, 
      notificationId, 
      userId: client.user?.id 
    });
  }

  joinRoom(clientId, roomId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.rooms.add(roomId);
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId).add(clientId);
    
    console.log(`Client ${clientId} joined room ${roomId}`);
  }

  leaveRoom(clientId, roomId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.rooms.delete(roomId);
    
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(clientId);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    
    console.log(`Client ${clientId} left room ${roomId}`);
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        return false;
      }
    }
    return false;
  }

  sendToUser(userId, data) {
    const userSessions = this.userSessions.get(userId);
    let sent = 0;
    
    if (userSessions) {
      userSessions.forEach(clientId => {
        if (this.sendToClient(clientId, data)) {
          sent++;
        }
      });
    }
    
    return sent;
  }

  broadcastToRoom(roomId, data, excludeClientId = null) {
    const room = this.rooms.get(roomId);
    let sent = 0;
    
    if (room) {
      room.forEach(clientId => {
        if (clientId !== excludeClientId) {
          if (this.sendToClient(clientId, data)) {
            sent++;
          }
        }
      });
    }
    
    return sent;
  }

  broadcast(data, excludeClientId = null) {
    let sent = 0;
    
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        if (this.sendToClient(clientId, data)) {
          sent++;
        }
      }
    });
    
    return sent;
  }

  broadcastOnlineUsers() {
    const onlineUsers = Array.from(this.userSessions.keys());
    
    this.broadcast({
      type: 'online_users',
      data: { users: onlineUsers, count: onlineUsers.length }
    });
  }

  setupHeartbeat() {
    const heartbeatTimer = setInterval(() => {
      const now = Date.now();
      
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          // 마지막 ping 이후 너무 많은 시간이 지났으면 연결 종료
          if (now - client.lastPing > this.heartbeatTimeout + this.heartbeatInterval) {
            console.log(`Client ${clientId} heartbeat timeout`);
            client.ws.terminate();
            return;
          }
          
          // ping 전송
          try {
            client.ws.ping();
          } catch (error) {
            console.error(`Error sending ping to ${clientId}:`, error);
          }
        } else {
          // 연결이 닫힌 클라이언트 제거
          this.handleDisconnection(clientId, 1006, 'Connection lost');
        }
      });
    }, this.heartbeatInterval);

    // 서버 종료 시 타이머 정리
    process.on('SIGTERM', () => {
      clearInterval(heartbeatTimer);
    });

    process.on('SIGINT', () => {
      clearInterval(heartbeatTimer);
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      authenticatedUsers: this.userSessions.size,
      activeRooms: this.rooms.size,
      totalRoomConnections: Array.from(this.rooms.values()).reduce(
        (total, room) => total + room.size, 0
      )
    };
  }

  getClientsByRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    return Array.from(room).map(clientId => {
      const client = this.clients.get(clientId);
      return {
        clientId,
        user: client?.user,
        connectedAt: client?.connectedAt
      };
    });
  }

  getUserSessions(userId) {
    const sessions = this.userSessions.get(userId);
    if (!sessions) return [];
    
    return Array.from(sessions).map(clientId => {
      const client = this.clients.get(clientId);
      return {
        clientId,
        connectedAt: client?.connectedAt,
        rooms: Array.from(client?.rooms || [])
      };
    });
  }

  close() {
    console.log('Closing WebSocket server...');
    
    // 모든 클라이언트에게 서버 종료 알림
    this.broadcast({
      type: 'server_shutdown',
      data: { message: 'Server is shutting down' }
    });
    
    // 모든 연결 종료
    this.clients.forEach((client, clientId) => {
      client.ws.close(1001, 'Server shutdown');
    });
    
    // 서버 종료
    this.wss.close();
    
    console.log('WebSocket server closed');
  }
}

module.exports = WebSocketServer;
