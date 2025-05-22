const express = require('express');
const { auth } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// WebSocket 연결 상태 조회
router.get('/status', auth, (req, res) => {
  try {
    const wsServer = req.app.wsServer;
    const stats = wsServer.getStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        serverTime: new Date(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    logger.error('WebSocket status error:', error);
    res.status(500).json({
      success: false,
      message: 'WebSocket 상태 조회에 실패했습니다.'
    });
  }
});

// 특정 방의 연결된 클라이언트 조회
router.get('/rooms/:roomId/clients', auth, (req, res) => {
  try {
    const { roomId } = req.params;
    const wsServer = req.app.wsServer;
    const clients = wsServer.getClientsByRoom(roomId);
    
    res.json({
      success: true,
      data: {
        roomId,
        clients,
        count: clients.length
      }
    });
  } catch (error) {
    logger.error('Room clients query error:', error);
    res.status(500).json({
      success: false,
      message: '방 클라이언트 조회에 실패했습니다.'
    });
  }
});

// 사용자의 WebSocket 세션 조회
router.get('/users/:userId/sessions', auth, (req, res) => {
  try {
    const { userId } = req.params;
    const wsServer = req.app.wsServer;
    const sessions = wsServer.getUserSessions(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        sessions,
        count: sessions.length
      }
    });
  } catch (error) {
    logger.error('User sessions query error:', error);
    res.status(500).json({
      success: false,
      message: '사용자 세션 조회에 실패했습니다.'
    });
  }
});

// 특정 사용자에게 알림 전송
router.post('/notifications/send', auth, (req, res) => {
  try {
    const { targetUserId, title, message, type = 'info', data = {} } = req.body;
    const wsServer = req.app.wsServer;
    
    const notificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      data,
      from: req.user,
      timestamp: new Date()
    };
    
    const sent = wsServer.sendToUser(targetUserId, {
      type: 'notification',
      data: notificationData
    });
    
    res.json({
      success: true,
      data: {
        notificationId: notificationData.id,
        sent,
        message: `알림이 ${sent}개의 세션으로 전송되었습니다.`
      }
    });
  } catch (error) {
    logger.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: '알림 전송에 실패했습니다.'
    });
  }
});

// 전체 브로드캐스트 알림 전송 (관리자만)
router.post('/notifications/broadcast', auth, (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 전체 알림을 전송할 수 있습니다.'
      });
    }
    
    const { title, message, type = 'info', data = {} } = req.body;
    const wsServer = req.app.wsServer;
    
    const notificationData = {
      id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      data,
      from: req.user,
      timestamp: new Date()
    };
    
    const sent = wsServer.broadcast({
      type: 'notification',
      data: notificationData
    });
    
    res.json({
      success: true,
      data: {
        notificationId: notificationData.id,
        sent,
        message: `전체 알림이 ${sent}개의 클라이언트로 전송되었습니다.`
      }
    });
  } catch (error) {
    logger.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: '전체 알림 전송에 실패했습니다.'
    });
  }
});

// 방에 메시지 전송
router.post('/rooms/:roomId/messages', auth, (req, res) => {
  try {
    const { roomId } = req.params;
    const { message, type = 'text' } = req.body;
    const wsServer = req.app.wsServer;
    
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      message,
      type,
      sender: req.user,
      timestamp: new Date()
    };
    
    const sent = wsServer.broadcastToRoom(roomId, {
      type: 'room_message',
      data: messageData
    });
    
    res.json({
      success: true,
      data: {
        messageId: messageData.id,
        sent,
        message: `메시지가 방 ${roomId}의 ${sent}개 클라이언트로 전송되었습니다.`
      }
    });
  } catch (error) {
    logger.error('Send room message error:', error);
    res.status(500).json({
      success: false,
      message: '방 메시지 전송에 실패했습니다.'
    });
  }
});

// WebSocket 연결 강제 종료 (관리자만)
router.delete('/clients/:clientId', auth, (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 연결을 강제 종료할 수 있습니다.'
      });
    }
    
    const { clientId } = req.params;
    const wsServer = req.app.wsServer;
    
    const client = wsServer.clients.get(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: '해당 클라이언트를 찾을 수 없습니다.'
      });
    }
    
    // 클라이언트에게 강제 종료 알림 전송
    wsServer.sendToClient(clientId, {
      type: 'forced_disconnect',
      data: {
        reason: 'Connection terminated by administrator',
        message: '관리자에 의해 연결이 종료되었습니다.'
      }
    });
    
    // 연결 종료
    client.ws.close(1008, 'Terminated by administrator');
    
    res.json({
      success: true,
      message: `클라이언트 ${clientId}의 연결이 강제 종료되었습니다.`
    });
  } catch (error) {
    logger.error('Force disconnect error:', error);
    res.status(500).json({
      success: false,
      message: '연결 강제 종료에 실패했습니다.'
    });
  }
});

// WebSocket 서버 재시작 (관리자만)
router.post('/restart', auth, (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '관리자만 WebSocket 서버를 재시작할 수 있습니다.'
      });
    }
    
    const wsServer = req.app.wsServer;
    
    // 모든 클라이언트에게 재시작 알림
    wsServer.broadcast({
      type: 'server_restart',
      data: {
        message: 'WebSocket 서버가 재시작됩니다. 잠시 후 자동으로 재연결됩니다.',
        timestamp: new Date()
      }
    });
    
    // 잠시 후 서버 종료 (PM2나 다른 프로세스 매니저가 자동으로 재시작)
    setTimeout(() => {
      wsServer.close();
      process.exit(0);
    }, 2000);
    
    res.json({
      success: true,
      message: 'WebSocket 서버 재시작이 요청되었습니다.'
    });
  } catch (error) {
    logger.error('WebSocket restart error:', error);
    res.status(500).json({
      success: false,
      message: 'WebSocket 서버 재시작에 실패했습니다.'
    });
  }
});

module.exports = router;
