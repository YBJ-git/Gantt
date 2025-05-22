import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ResetPassword.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  // 토큰 유효성 확인
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('유효하지 않은 토큰입니다.');
    }
  }, [token]);

  // 비밀번호 강도 체크 함수
  const checkPasswordStrength = (password) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('최소 8자 이상 입력해주세요.');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('소문자를 포함해주세요.');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('대문자를 포함해주세요.');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('숫자를 포함해주세요.');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('특수문자를 포함해주세요.');
    }

    return { score, feedback };
  };

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 비밀번호 강도 체크
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 유효성 검사
    if (!formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.');
      return;
    }

    try {
      await resetPassword(token, formData.password);
      setSuccess(true);
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.message.includes('token') || err.message.includes('expired')) {
        setTokenValid(false);
      }
      setError(err.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    }
  };

  // 비밀번호 강도 표시 함수
  const getStrengthLabel = (score) => {
    const labels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    return labels[score] || '매우 약함';
  };

  const getStrengthColor = (score) => {
    const colors = ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#20c997'];
    return colors[score] || '#dc3545';
  };

  // 토큰이 유효하지 않은 경우
  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>유효하지 않은 링크</h1>
            <p>
              비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
              새로운 링크를 요청해주세요.
            </p>
            <div className="error-actions">
              <Link to="/forgot-password" className="btn btn-primary">
                새 링크 요청하기
              </Link>
              <Link to="/login" className="btn btn-secondary">
                로그인 페이지로
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>새 비밀번호 설정</h1>
          <p>계정의 새로운 비밀번호를 설정해주세요.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {success ? (
          <div className="success-container">
            <div className="success-icon">✅</div>
            <h2>비밀번호가 성공적으로 변경되었습니다!</h2>
            <p>새로운 비밀번호로 로그인할 수 있습니다.</p>
            <div className="countdown">
              3초 후 로그인 페이지로 이동합니다...
            </div>
            <Link to="/login" className="btn btn-primary">
              지금 로그인하기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password">새 비밀번호</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="새 비밀번호를 입력하세요"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor(passwordStrength.score)
                      }}
                    />
                  </div>
                  <div className="strength-info">
                    <span 
                      className="strength-label"
                      style={{ color: getStrengthColor(passwordStrength.score) }}
                    >
                      {getStrengthLabel(passwordStrength.score)}
                    </span>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="strength-feedback">
                        {passwordStrength.feedback.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <div className="password-mismatch">
                  비밀번호가 일치하지 않습니다.
                </div>
              )}
              
              {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                <div className="password-match">
                  비밀번호가 일치합니다.
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading || passwordStrength.score < 3}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  처리 중...
                </>
              ) : (
                '비밀번호 변경'
              )}
            </button>
          </form>
        )}

        <div className="reset-password-footer">
          <Link to="/login" className="link">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>

      <div className="security-tips">
        <div className="tips-icon">💡</div>
        <div className="tips-content">
          <h3>안전한 비밀번호 팁</h3>
          <ul>
            <li>8자 이상의 길이</li>
            <li>대문자, 소문자, 숫자, 특수문자 조합</li>
            <li>개인정보나 쉬운 단어 사용 금지</li>
            <li>정기적인 비밀번호 변경</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;