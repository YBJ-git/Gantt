import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SessionWarningModal.css';

const SessionWarningModal = ({ 
  isOpen, 
  onExtend, 
  onLogout, 
  warningTime = 300 // 5분(300초) 전 경고
}) => {
  const { extendSession } = useAuth();
  const [timeLeft, setTimeLeft] = useState(warningTime);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(warningTime);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, warningTime, onLogout]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleExtendSession = () => {
    extendSession();
    onExtend();
  };

  if (!isOpen) return null;

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="modal-header">
          <div className="warning-icon">⚠️</div>
          <h2>세션 만료 경고</h2>
        </div>
        
        <div className="modal-body">
          <p>보안을 위해 세션이 곧 만료됩니다.</p>
          <p>계속 사용하시려면 세션을 연장해주세요.</p>
          
          <div className="countdown-container">
            <div className="countdown-circle">
              <span className="countdown-time">{formatTime(timeLeft)}</span>
            </div>
            <p>후 자동 로그아웃</p>
          </div>
          
          <div className="session-info">
            <div className="info-item">
              <span className="info-label">현재 활동:</span>
              <span className="info-value">활성화됨</span>
            </div>
            <div className="info-item">
              <span className="info-label">마지막 활동:</span>
              <span className="info-value">방금 전</span>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-primary"
            onClick={handleExtendSession}
          >
            세션 연장하기
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onLogout}
          >
            지금 로그아웃
          </button>
        </div>
        
        <div className="modal-footer">
          <p className="security-note">
            🔒 이 기능은 계정 보안을 위한 것입니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SessionWarningModal;