import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './SocialCallback.css';

const SocialCallback = () => {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socialLogin } = useAuth();
  
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleSocialCallback = async () => {
      try {
        // URL에서 토큰 또는 코드 추출
        const token = searchParams.get('token');
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 오류가 있는 경우
        if (error) {
          throw new Error(errorDescription || `${provider} 로그인이 취소되었거나 실패했습니다.`);
        }

        // 토큰이나 코드가 없는 경우
        if (!token && !code) {
          throw new Error('인증 정보를 받지 못했습니다.');
        }

        // 소셜 로그인 처리
        const authToken = token || code;
        await socialLogin(provider, authToken);
        
        setStatus('success');
        
        // 성공 시 카운트다운 시작
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/', { replace: true });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err) {
        console.error(`${provider} 로그인 콜백 오류:`, err);
        setStatus('error');
        setError(err.message || `${provider} 로그인 중 오류가 발생했습니다.`);
      }
    };

    // provider 유효성 검사
    const validProviders = ['google', 'github'];
    if (!validProviders.includes(provider?.toLowerCase())) {
      setStatus('error');
      setError('지원하지 않는 소셜 로그인 제공자입니다.');
      return;
    }

    handleSocialCallback();
  }, [provider, searchParams, socialLogin, navigate]);

  // 제공자 표시명 가져오기
  const getProviderDisplayName = (provider) => {
    const providers = {
      google: 'Google',
      github: 'GitHub'
    };
    return providers[provider?.toLowerCase()] || provider;
  };

  // 제공자 아이콘 가져오기
  const getProviderIcon = (provider) => {
    const icons = {
      google: '🔍',
      github: '🐙'
    };
    return icons[provider?.toLowerCase()] || '🔗';
  };

  // 처리 중 상태
  if (status === 'processing') {
    return (
      <div className="social-callback-container">
        <div className="social-callback-card">
          <div className="callback-content">
            <div className="processing-container">
              <div className="provider-info">
                <div className="provider-icon">
                  {getProviderIcon(provider)}
                </div>
                <h1>{getProviderDisplayName(provider)} 로그인 처리 중...</h1>
              </div>
              
              <div className="loading-spinner"></div>
              
              <p>잠시만 기다려주세요. 로그인을 처리하고 있습니다.</p>
              
              <div className="processing-steps">
                <div className="step active">
                  <span className="step-number">1</span>
                  <span className="step-text">{getProviderDisplayName(provider)} 인증 확인</span>
                </div>
                <div className="step active">
                  <span className="step-number">2</span>
                  <span className="step-text">계정 정보 동기화</span>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <span className="step-text">로그인 완료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 성공 상태
  if (status === 'success') {
    return (
      <div className="social-callback-container">
        <div className="social-callback-card">
          <div className="callback-content">
            <div className="success-container">
              <div className="success-icon">✅</div>
              <h1>{getProviderDisplayName(provider)} 로그인 성공!</h1>
              <p>성공적으로 로그인되었습니다. 잠시 후 메인 페이지로 이동합니다.</p>
              
              <div className="countdown-display">
                <div className="countdown-circle">
                  <span className="countdown-number">{countdown}</span>
                </div>
                <p>초 후 자동으로 이동합니다</p>
              </div>
              
              <div className="success-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/', { replace: true })}
                >
                  지금 이동하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 오류 상태
  return (
    <div className="social-callback-container">
      <div className="social-callback-card">
        <div className="callback-content">
          <div className="error-container">
            <div className="error-icon">❌</div>
            <h1>{getProviderDisplayName(provider)} 로그인 실패</h1>
            <p>로그인 처리 중 오류가 발생했습니다.</p>
            
            {error && (
              <div className="error-details">
                <strong>오류 내용:</strong> {error}
              </div>
            )}
            
            <div className="error-help">
              <h3>문제 해결 방법:</h3>
              <ul>
                <li>{getProviderDisplayName(provider)} 계정에 로그인되어 있는지 확인하세요</li>
                <li>브라우저의 팝업 차단이 해제되어 있는지 확인하세요</li>
                <li>잠시 후 다시 시도해보세요</li>
                <li>문제가 계속되면 일반 로그인을 이용하세요</li>
              </ul>
            </div>
            
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/login', { replace: true })}
              >
                로그인 페이지로 돌아가기
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/register', { replace: true })}
              >
                회원가입하기
              </button>
            </div>
          </div>
        </div>
        
        <div className="help-section">
          <div className="help-icon">💡</div>
          <div className="help-content">
            <h3>소셜 로그인 팁</h3>
            <ul>
              <li>팝업 차단 기능을 해제해주세요</li>
              <li>사용하려는 소셜 계정에 먼저 로그인해주세요</li>
              <li>브라우저 쿠키 및 자바스크립트를 허용해주세요</li>
              <li>시크릿 모드에서는 소셜 로그인이 제한될 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialCallback;