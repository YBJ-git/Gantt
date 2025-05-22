import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './SessionManagement.css';

const SessionManagement = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');

  // 세션 정보 (임시 데이터 - 실제로는 API에서 가져와야 함)
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        
        // 현재 세션 정보
        const currentSession = {
          id: 'current',
          deviceInfo: {
            browser: getBrowserInfo(),
            os: getOSInfo(),
            device: getDeviceInfo()
          },
          ipAddress: '192.168.1.100',
          location: 'Seoul, South Korea',
          loginTime: new Date(),
          lastActivity: new Date(),
          isCurrent: true,
          isActive: true
        };

        // 다른 세션들 (예시 데이터)
        const otherSessions = [
          {
            id: 'session-1',
            deviceInfo: {
              browser: 'Chrome 120.0',
              os: 'Windows 11',
              device: 'Desktop'
            },
            ipAddress: '192.168.1.101',
            location: 'Seoul, South Korea',
            loginTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isCurrent: false,
            isActive: true
          },
          {
            id: 'session-2',
            deviceInfo: {
              browser: 'Safari 17.0',
              os: 'iOS 17',
              device: 'iPhone'
            },
            ipAddress: '10.0.0.50',
            location: 'Seoul, South Korea',
            loginTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            isCurrent: false,
            isActive: false
          }
        ];

        setSessions([currentSession, ...otherSessions]);

        // 로그인 기록 (예시 데이터)
        const historyData = [
          {
            id: 1,
            timestamp: new Date(),
            action: 'login',
            deviceInfo: currentSession.deviceInfo,
            ipAddress: currentSession.ipAddress,
            location: currentSession.location,
            success: true
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            action: 'login',
            deviceInfo: otherSessions[0].deviceInfo,
            ipAddress: otherSessions[0].ipAddress,
            location: otherSessions[0].location,
            success: true
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            action: 'logout',
            deviceInfo: otherSessions[1].deviceInfo,
            ipAddress: otherSessions[1].ipAddress,
            location: otherSessions[1].location,
            success: true
          },
          {
            id: 4,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            action: 'login',
            deviceInfo: otherSessions[1].deviceInfo,
            ipAddress: otherSessions[1].ipAddress,
            location: otherSessions[1].location,
            success: true
          },
          {
            id: 5,
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            action: 'failed_login',
            deviceInfo: { browser: 'Unknown', os: 'Unknown', device: 'Unknown' },
            ipAddress: '203.0.113.195',
            location: 'Unknown Location',
            success: false
          }
        ];

        setLoginHistory(historyData);
      } catch (err) {
        setError('세션 정보를 불러오는 중 오류가 발생했습니다.');
        console.error('세션 데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, []);

  // 디바이스 정보 감지 함수들
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getOSInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown OS';
  };

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return 'Mobile';
    if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  };

  // 세션 종료 함수
  const terminateSession = async (sessionId) => {
    try {
      if (sessionId === 'current') {
        // 현재 세션 종료 시 로그아웃
        logout();
        navigate('/login');
      } else {
        // 다른 세션 종료
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        // 실제로는 API 호출이 필요함
        console.log(`세션 ${sessionId} 종료됨`);
      }
    } catch (err) {
      setError('세션 종료 중 오류가 발생했습니다.');
    }
  };

  // 모든 다른 세션 종료
  const terminateAllOtherSessions = async () => {
    try {
      setSessions(prev => prev.filter(session => session.isCurrent));
      // 실제로는 API 호출이 필요함
      console.log('모든 다른 세션이 종료됨');
    } catch (err) {
      setError('세션 종료 중 오류가 발생했습니다.');
    }
  };

  // 시간 포맷팅
  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  // 상대 시간 포맷팅
  const getRelativeTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  // 디바이스 아이콘
  const getDeviceIcon = (device) => {
    switch (device) {
      case 'Mobile': return '📱';
      case 'Tablet': return '📱';
      case 'Desktop': return '💻';
      default: return '🔗';
    }
  };

  // 브라우저 아이콘
  const getBrowserIcon = (browser) => {
    if (browser.includes('Chrome')) return '🔍';
    if (browser.includes('Firefox')) return '🦊';
    if (browser.includes('Safari')) return '🧭';
    if (browser.includes('Edge')) return '🌐';
    return '🌐';
  };

  if (loading) {
    return (
      <div className="session-management-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>세션 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="session-management-container">
      <div className="session-header">
        <h1>세션 및 로그인 관리</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          뒤로 가기
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="session-tabs">
        <button
          className={`tab ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          활성 세션
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          로그인 기록
        </button>
      </div>

      {activeTab === 'sessions' && (
        <div className="sessions-section">
          <div className="section-header">
            <h2>활성 세션</h2>
            <button
              className="btn btn-danger"
              onClick={terminateAllOtherSessions}
              disabled={sessions.filter(s => !s.isCurrent).length === 0}
            >
              다른 모든 세션 종료
            </button>
          </div>

          <div className="sessions-grid">
            {sessions.map(session => (
              <div key={session.id} className={`session-card ${session.isCurrent ? 'current' : ''}`}>
                <div className="session-info">
                  <div className="device-info">
                    <div className="device-header">
                      <span className="device-icon">
                        {getDeviceIcon(session.deviceInfo.device)}
                      </span>
                      <span className="browser-icon">
                        {getBrowserIcon(session.deviceInfo.browser)}
                      </span>
                      <div className="device-details">
                        <h3>{session.deviceInfo.device}</h3>
                        <p>{session.deviceInfo.browser} • {session.deviceInfo.os}</p>
                      </div>
                    </div>
                    {session.isCurrent && (
                      <span className="current-badge">현재 세션</span>
                    )}
                  </div>

                  <div className="session-details">
                    <div className="detail-item">
                      <span className="label">IP 주소:</span>
                      <span className="value">{session.ipAddress}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">위치:</span>
                      <span className="value">{session.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">로그인 시간:</span>
                      <span className="value">{formatDateTime(session.loginTime)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">마지막 활동:</span>
                      <span className="value">
                        {getRelativeTime(session.lastActivity)}
                        {session.isActive && <span className="active-indicator">●</span>}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="session-actions">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => terminateSession(session.id)}
                  >
                    {session.isCurrent ? '로그아웃' : '세션 종료'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          <div className="section-header">
            <h2>로그인 기록</h2>
            <p>최근 30일간의 로그인 활동을 표시합니다.</p>
          </div>

          <div className="history-list">
            {loginHistory.map(entry => (
              <div key={entry.id} className={`history-item ${entry.success ? 'success' : 'failed'}`}>
                <div className="history-icon">
                  {entry.action === 'login' && entry.success && '🔓'}
                  {entry.action === 'logout' && '🔒'}
                  {entry.action === 'failed_login' && '❌'}
                </div>

                <div className="history-info">
                  <div className="history-main">
                    <h3>
                      {entry.action === 'login' && entry.success && '로그인 성공'}
                      {entry.action === 'logout' && '로그아웃'}
                      {entry.action === 'failed_login' && '로그인 실패'}
                    </h3>
                    <span className="history-time">{formatDateTime(entry.timestamp)}</span>
                  </div>
                  
                  <div className="history-details">
                    <span className="detail">
                      {getBrowserIcon(entry.deviceInfo.browser)} {entry.deviceInfo.browser} • {entry.deviceInfo.os}
                    </span>
                    <span className="detail">📍 {entry.location}</span>
                    <span className="detail">🌐 {entry.ipAddress}</span>
                  </div>
                </div>

                <div className="history-status">
                  {entry.success ? (
                    <span className="status-success">성공</span>
                  ) : (
                    <span className="status-failed">실패</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="security-tips">
        <div className="tips-header">
          <h3>🔐 보안 팁</h3>
        </div>
        <ul>
          <li>인식하지 못하는 세션이나 위치에서의 로그인이 있다면 즉시 비밀번호를 변경하세요</li>
          <li>공용 컴퓨터나 카페 등에서 사용 후에는 반드시 로그아웃하세요</li>
          <li>정기적으로 활성 세션을 확인하고 불필요한 세션을 종료하세요</li>
          <li>의심스러운 로그인 활동이 보이면 고객지원팀에 문의하세요</li>
        </ul>
      </div>
    </div>
  );
};

export default SessionManagement;