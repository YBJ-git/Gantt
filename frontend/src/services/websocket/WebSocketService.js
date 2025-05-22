class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.isConnecting = false;
    this.listeners = new Map();
    this.messageQueue = [];
    this.connectionState = 'disconnected'; // disconnected, connecting, connected, reconnecting
    
    // 이벤트 콜백
    this.onOpen = null;
    this.onClose = null;
    this.onError = null;
    this.onMessage = null;
    this.onReconnect = null;
    this.onStateChange = null;
  }

  // WebSocket 연결
  connect(url, token = null) {
    if (this.isConnecting || this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket is already connecting...');
      return Promise.resolve();
    }

    this.url = url;
    this.isConnecting = true;
    this.setState('connecting');

    return new Promise((resolve, reject) => {
      try {
        // WebSocket URL에 토큰 추가
        const wsUrl = token ? `${url}?token=${token}` : url;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = (event) => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.setState('connected');
          this.startHeartbeat();
          this.flushMessageQueue();
          
          if (this.onOpen) this.onOpen(event);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.setState('disconnected');
          this.stopHeartbeat();
          
          if (this.onClose) this.onClose(event);
          
          // 정상적인 종료가 아닌 경우 재연결 시도
          if (event.code !== 1000 && event.code !== 1001) {
            this.handleReconnect();
          }
        };

        this.ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          this.isConnecting = false;
          this.setState('disconnected');
          
          if (this.onError) this.onError(event);
          reject(event);
        };

      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        this.isConnecting = false;
        this.setState('disconnected');
        reject(error);
      }
    });
  }

  // 연결 종료
  disconnect() {
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts; // 재연결 방지
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.setState('disconnected');
  }

  // 메시지 전송
  send(message) {
    const messageData = typeof message === 'string' ? message : JSON.stringify(message);
    
    if (this.isConnected()) {
      try {
        this.ws.send(messageData);
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        this.messageQueue.push(messageData);
        return false;
      }
    } else {
      // 연결되지 않은 경우 큐에 저장
      console.log('WebSocket not connected, queueing message');
      this.messageQueue.push(messageData);
      return false;
    }
  }

  // 연결 상태 확인
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // 연결 상태 반환
  getState() {
    return this.connectionState;
  }

  // 이벤트 리스너 등록
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
  }

  // 이벤트 리스너 제거
  removeEventListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  // 특정 타입의 모든 리스너 제거
  removeAllListeners(type = null) {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
    }
  }

  // 메시지 처리
  handleMessage(event) {
    try {
      let data;
      
      // JSON 파싱 시도
      try {
        data = JSON.parse(event.data);
      } catch {
        data = { type: 'raw', data: event.data };
      }

      // 하트비트 응답 처리
      if (data.type === 'pong') {
        this.handlePong();
        return;
      }

      // 일반 메시지 콜백 실행
      if (this.onMessage) {
        this.onMessage(data);
      }

      // 타입별 리스너 실행
      if (data.type && this.listeners.has(data.type)) {
        this.listeners.get(data.type).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in message listener:', error);
          }
        });
      }

      // 모든 메시지 리스너 실행
      if (this.listeners.has('*')) {
        this.listeners.get('*').forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in wildcard listener:', error);
          }
        });
      }

    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  // 재연결 처리
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.setState('disconnected');
      return;
    }

    this.setState('reconnecting');
    this.reconnectAttempts++;
    
    const timeout = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${timeout}ms`);

    setTimeout(() => {
      if (this.onReconnect) this.onReconnect(this.reconnectAttempts);
      this.connect(this.url);
    }, timeout);
  }

  // 하트비트 시작
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', timestamp: Date.now() });
        
        // pong 응답 타임아웃 설정
        this.heartbeatTimeout = setTimeout(() => {
          console.log('Heartbeat timeout, closing connection');
          this.ws.close();
        }, 10000);
      }
    }, 30000);
  }

  // 하트비트 중지
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // pong 응답 처리
  handlePong() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // 대기 중인 메시지 전송
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      try {
        this.ws.send(message);
      } catch (error) {
        console.error('Failed to send queued message:', error);
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  // 연결 상태 변경
  setState(newState) {
    const oldState = this.connectionState;
    this.connectionState = newState;
    
    if (oldState !== newState && this.onStateChange) {
      this.onStateChange(newState, oldState);
    }
  }

  // 재연결 설정
  setReconnectConfig(maxAttempts, interval) {
    this.maxReconnectAttempts = maxAttempts;
    this.reconnectInterval = interval;
  }

  // 연결 통계
  getStats() {
    return {
      state: this.connectionState,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      isConnected: this.isConnected(),
      listeners: Object.fromEntries(
        Array.from(this.listeners.entries()).map(([type, callbacks]) => [
          type,
          callbacks.size
        ])
      )
    };
  }
}

// 싱글톤 인스턴스
const webSocketService = new WebSocketService();

export default webSocketService;
