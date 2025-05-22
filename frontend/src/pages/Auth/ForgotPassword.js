import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { requestPasswordReset, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 이메일 유효성 검사
    if (!formData.email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    try {
      await requestPasswordReset(formData.email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>비밀번호 찾기</h1>
          <p>등록된 이메일 주소로 비밀번호 재설정 링크를 보내드립니다.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        
        {success ? (
          <div className="success-container">
            <div className="alert alert-success">
              <h3>이메일이 전송되었습니다!</h3>
              <p>
                <strong>{formData.email}</strong>로 비밀번호 재설정 링크를 보내드렸습니다.
                이메일을 확인하시고 링크를 클릭하여 비밀번호를 재설정해주세요.
              </p>
            </div>
            
            <div className="success-instructions">
              <h4>다음 단계:</h4>
              <ol>
                <li>이메일함을 확인해주세요 (스팸함도 확인해주세요)</li>
                <li>이메일의 "비밀번호 재설정" 링크를 클릭해주세요</li>
                <li>새로운 비밀번호를 설정해주세요</li>
              </ol>
            </div>

            <div className="success-actions">
              <Link to="/login" className="btn btn-primary">
                로그인 페이지로 돌아가기
              </Link>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setSuccess(false)}
              >
                다른 이메일로 재시도
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">이메일 주소</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="등록된 이메일 주소를 입력하세요"
                required
                autoComplete="email"
                disabled={loading}
              />
              <small className="help-text">
                계정 등록 시 사용한 이메일 주소를 입력해주세요.
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  전송 중...
                </>
              ) : (
                '재설정 링크 보내기'
              )}
            </button>
          </form>
        )}

        <div className="forgot-password-footer">
          <div className="footer-links">
            <Link to="/login" className="link">
              로그인 페이지로 돌아가기
            </Link>
            <span className="separator">•</span>
            <Link to="/register" className="link">
              계정이 없으신가요? 회원가입
            </Link>
          </div>
          
          <div className="help-section">
            <h4>도움이 필요하신가요?</h4>
            <p>
              이메일을 받지 못하셨거나 다른 문제가 있으시면 
              <a href="mailto:support@myproject.com" className="link">
                고객지원팀
              </a>에 문의해주세요.
            </p>
          </div>
        </div>
      </div>
      
      <div className="security-notice">
        <div className="notice-icon">🔒</div>
        <div className="notice-content">
          <h3>보안 안내</h3>
          <p>
            비밀번호 재설정 링크는 보안을 위해 24시간 후 만료됩니다.
            링크가 만료된 경우 다시 요청해주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;