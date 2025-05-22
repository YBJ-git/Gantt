import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const { 
    settings,
    updateNotificationSettings,
    toggleNotificationType,
    toggleNotificationChannel,
    loading
  } = useNotifications();
  
  const navigate = useNavigate();
  
  // 로컬 상태 (설정 변경 전 미리보기)
  const [localSettings, setLocalSettings] = useState({
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
  
  // 상태 변수
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // 설정 로드
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);
  
  // 알림 채널 토글 핸들러
  const handleChannelToggle = (channel) => {
    setLocalSettings({
      ...localSettings,
      [channel]: !localSettings[channel]
    });
  };
  
  // 알림 유형 토글 핸들러
  const handleTypeToggle = (type) => {
    setLocalSettings({
      ...localSettings,
      types: {
        ...localSettings.types,
        [type]: !localSettings.types[type]
      }
    });
  };
  
  // 설정 저장 핸들러
  const handleSaveSettings = async () => {
    try {
      await updateNotificationSettings(localSettings);
      setSuccess(true);
      setError(null);
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message || '설정 저장 중 오류가 발생했습니다.');
      setSuccess(false);
    }
  };
  
  return (
    <div className="notification-settings-container">
      <div className="notifications-header">
        <h1>알림 설정</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          뒤로 가기
        </button>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">설정이 저장되었습니다.</div>}
      
      <div className="settings-card">
        <div className="settings-section">
          <h2>알림 채널</h2>
          <p className="section-description">
            알림을 받는 방법을 선택하세요. 여러 채널을 동시에 사용할 수 있습니다.
          </p>
          
          <div className="setting-option">
            <div className="setting-label">
              <h3>앱 내 알림</h3>
              <p>앱 내에서 알림을 표시합니다.</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.inApp}
                  onChange={() => handleChannelToggle('inApp')}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-option">
            <div className="setting-label">
              <h3>이메일 알림</h3>
              <p>등록된 이메일 주소로 알림을 전송합니다.</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.email}
                  onChange={() => handleChannelToggle('email')}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-option">
            <div className="setting-label">
              <h3>푸시 알림</h3>
              <p>브라우저 또는 모바일 앱에서 푸시 알림을 받습니다.</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.push}
                  onChange={() => handleChannelToggle('push')}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>알림 유형</h2>
          <p className="section-description">
            받고 싶은 알림 유형을 선택하세요. 각 유형은 개별적으로 설정할 수 있습니다.
          </p>
          
          <div className="setting-option">
            <div className="setting-label">
              <h3>작업 알림</h3>
              <p>새로운 작업 할당, 작업 상태 변경, 마감일 알림 등</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.types.task}
                  onChange={() => handleTypeToggle('task')}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-option">
            <div className="setting-label">
              <h3>시스템 알림</h3>
              <p>시스템 업데이트, 점검 일정, 기능 변경 등</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.types.system}
                  onChange={() => handleTypeToggle('system')}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-option">
            <div className="setting-label">
              <h3>보안 알림</h3>
              <p>로그인 알림, 비밀번호 변경, 계정 활동 등</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.types.security}
                  onChange={() => handleTypeToggle('security')}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div className="setting-option">
            <div className="setting-label">
              <h3>활동 알림</h3>
              <p>멘션, 댓글, 팀 활동, 프로젝트 업데이트 등</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={localSettings.types.activity}
                  onChange={() => handleTypeToggle('activity')}
                  disabled={loading}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? '저장 중...' : '설정 저장'}
          </button>
        </div>
      </div>
      
      <div className="settings-card">
        <div className="settings-section">
          <h2>이메일 구독 관리</h2>
          <p className="section-description">
            뉴스레터 및 특별 공지 이메일 구독을 관리하세요.
          </p>
          
          <div className="subscription-options">
            <div className="subscription-option">
              <label className="checkbox-container">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                제품 업데이트 및 새로운 기능 안내
              </label>
            </div>
            
            <div className="subscription-option">
              <label className="checkbox-container">
                <input type="checkbox" defaultChecked />
                <span className="checkmark"></span>
                월간 뉴스레터
              </label>
            </div>
            
            <div className="subscription-option">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                마케팅 및 프로모션 이메일
              </label>
            </div>
          </div>
          
          <button className="btn btn-outline-primary">
            구독 설정 업데이트
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
