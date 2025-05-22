import React from 'react';
import { Link } from 'react-router-dom';
import './AccessDenied.css';

const AccessDenied = () => {
  return (
    <div className="access-denied-container">
      <div className="access-denied-content">
        <div className="error-icon">
          <i className="fas fa-lock"></i>
        </div>
        <h1>접근 권한이 없습니다</h1>
        <p className="error-message">
          요청하신 페이지에 접근할 수 있는 권한이 없습니다. 필요한 권한이 있는지 확인해 주세요.
        </p>
        <div className="action-buttons">
          <Link to="/dashboard" className="btn btn-primary">
            대시보드로 돌아가기
          </Link>
          <Link to="/login" className="btn btn-outline">
            다시 로그인하기
          </Link>
        </div>
        <div className="help-text">
          접근 권한 관련 문의사항은 관리자에게 문의하세요.
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
