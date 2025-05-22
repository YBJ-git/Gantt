import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail, loading } = useAuth();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'expired'
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // 페이지 로드 시 이메일 인증 실행
  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setVerificationStatus('error');
        setError('유효하지 않은 인증 토큰입니다.');
        return;
      }

      try {
        const result = await verifyEmail(token);
        setVerificationStatus('success');
        setUserEmail(result.email || '');
        
        // 성공 시 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: '이메일 인증이 완료되었습니다. 로그인해주세요.',
              type: 'success'
            }
          });
        }, 3000);
      } catch (err) {
        console.error('이메일 인증 오류:', err);
        
        if (err.message.includes('expired') || err.message.includes('만료')) {
          setVerificationStatus('expired');
        } else {
          setVerificationStatus('error');
        }
        
        setError(err.message || '이메일 인증 중 오류가 발생했습니다.');
      }
    };

    performVerification();
  }, [token, verifyEmail, navigate]);

  // 새 인증 이메일 요청 (만료된 경우)
  const handleRequestNewEmail = () => {
    navigate('/forgot-password', {
      state: {
        message: '새로운 인증 이메일을 요청해주세요.',
        type: 'info'
      }
    });
  };

  // 인증 중 상태
  if (verificationStatus === 'verifying') {
    return (
      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="verification-content">
            <div className="loading-container">
              <div className="spinner-large"></div>
              <h1>이메일 인증 중...</h1>
              <p>잠시만 기다려주세요. 이메일을 인증하고 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증 성공 상태
  if (verificationStatus === 'success') {
    return (
      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="verification-content">
            <div className="success-container">
              <div className="success-icon">✅</div>
              <h1>이메일 인증 완료!</h1>
              <p>
                {userEmail && (
                  <>
                    <strong>{userEmail}</strong> 계정의 이메일 인증이 성공적으로 완료되었습니다.
                  </>
                )}
                {!userEmail && '이메일 인증이 성공적으로 완료되었습니다.'}
              </p>
              
              <div className="success-benefits">
                <h3>이제 다음 기능을 이용할 수 있습니다:</h3>
                <ul>
                  <li>✓ 모든 계정 기능 이용</li>
                  <li>✓ 비밀번호 재설정</li>
                  <li>✓ 보안 알림 수신</li>
                  <li>✓ 계정 복구 기능</li>
                </ul>
              </div>
              
              <div className="countdown">
                3초 후 로그인 페이지로 이동합니다...
              </div>
              
              <div className="success-actions">
                <Link to="/login" className="btn btn-primary">
                  지금 로그인하기
                </Link>
                <Link to="/" className="btn btn-secondary">
                  홈으로 가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 토큰 만료 상태
  if (verificationStatus === 'expired') {
    return (
      <div className="verify-email-container">
        <div className="verify-email-card">
          <div className="verification-content">
            <div className="expired-container">
              <div className="expired-icon">⏰</div>
              <h1>인증 링크가 만료되었습니다</h1>
              <p>
                이메일 인증 링크가 만료되었습니다. 
                보안을 위해 인증 링크는 24시간 후 자동으로 만료됩니다.
              </p>
              
              <div className="expired-info">
                <h3>다음 단계:</h3>
                <ol>
                  <li>새로운 인증 이메일을 요청하세요</li>
                  <li>이메일을 확인하고 새 링크를 클릭하세요</li>
                  <li>인증을 완료하세요</li>
                </ol>
              </div>
              
              <div className="expired-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleRequestNewEmail}
                >
                  새 인증 이메일 요청
                </button>
                <Link to="/login" className="btn btn-secondary">
                  로그인 페이지로
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 인증 오류 상태
  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="verification-content">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h1>인증에 실패했습니다</h1>
            <p>이메일 인증 중 오류가 발생했습니다.</p>
            
            {error && (
              <div className="error-details">
                <strong>오류 내용:</strong> {error}
              </div>
            )}
            
            <div className="error-help">
              <h3>문제 해결 방법:</h3>
              <ul>
                <li>이메일의 인증 링크가 올바른지 확인해주세요</li>
                <li>링크를 전체 복사해서 새 브라우저 창에 붙여넣어보세요</li>
                <li>이미 인증된 계정인지 확인해주세요</li>
                <li>문제가 계속되면 새로운 인증 이메일을 요청해주세요</li>
              </ul>
            </div>
            
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={handleRequestNewEmail}
              >
                새 인증 이메일 요청
              </button>
              <Link to="/login" className="btn btn-secondary">
                로그인 페이지로
              </Link>
              <Link to="/register" className="btn btn-outline">
                회원가입으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="help-section">
        <div className="help-icon">💬</div>
        <div className="help-content">
          <h3>도움이 필요하신가요?</h3>
          <p>
            인증 과정에서 문제가 발생하면 
            <a href="mailto:support@myproject.com" className="link">
              고객지원팀
            </a>에 문의해주세요.
          </p>
          <p>
            <strong>문의 시 포함할 정보:</strong>
          </p>
          <ul>
            <li>가입 시 사용한 이메일 주소</li>
            <li>오류 메시지 (있는 경우)</li>
            <li>인증을 시도한 시간</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;