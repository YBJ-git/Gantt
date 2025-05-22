import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 이전 페이지에서 리다이렉트 된 경우 해당 경로로 다시 이동
  const from = location.state?.from || '/dashboard';

  // 이미 로그인 되어있으면 dashboard로 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // 입력 시 해당 필드 오류 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};
    
    // 사용자명 검증
    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요';
    }
    
    // 비밀번호 검증
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await login(formData.username, formData.password);
      
      // 로그인 성공 시 이전 페이지나 대시보드로 이동
      navigate(from);
      
    } catch (error) {
      setErrors({
        ...errors,
        submit: error.message || '로그인 중 오류가 발생했습니다'
      });
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인 핸들러
  const { getSocialLoginUrl, socialLogin } = useAuth();
  
  const handleSocialLogin = (provider) => {
    try {
      // 소셜 로그인 URL
      const authUrl = getSocialLoginUrl(provider);
      
      // 소셜 로그인 팝업 상태 및 사이즈 설정
      const width = 600;
      const height = 600;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;
      
      // 팝업 창 열기
      const popup = window.open(
        authUrl,
        `${provider} 로그인`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
      
      // 이번트 리스너를 통해 소셜 로그인 완료 후 처리
      const handleMessage = async (event) => {
        // 소셜 로그인 서버에서 메시지가 오는지 확인 (origin 확인)
        if (event.origin !== window.location.origin) {
          return;
        }
        
        // 메시지 데이터 추출
        const { type, provider: responseProvider, token } = event.data || {};
        
        if (type === 'social-login-success' && responseProvider === provider && token) {
          // 팝업 창 닫기
          if (popup) popup.close();
          
          // 이벤트 리스너 제거
          window.removeEventListener('message', handleMessage);
          
          try {
            // 소셜 로그인 처리
            await socialLogin(provider, token);
            navigate(from); // 로그인 성공 시 리다이렉트
          } catch (error) {
            setErrors({
              ...errors,
              submit: error.message || `${provider} 로그인 중 오류가 발생했습니다.`
            });
          }
        }
      };
      
      // 이벤트 리스너 등록
      window.addEventListener('message', handleMessage);
      
      // 팝업 창이 닫혔을 때 이벤트 리스너 제거
      const checkPopupClosed = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);
      
    } catch (error) {
      console.error(`${provider} 로그인 시작 중 오류:`, error);
      setErrors({
        ...errors,
        submit: `${provider} 로그인을 시작할 수 없습니다.`
      });
    }
  };

  return (
    <div className="login-container">
      <div className="card shadow-md">
        <div className="card-header">
          <h2 className="text-center">로그인</h2>
        </div>
        
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="alert alert-danger">{errors.submit}</div>
            )}
            
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                사용자명 <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                <i className="icon-user input-icon"></i>
              </div>
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
            
            <div className="form-group">
              <div className="d-flex justify-content-between">
                <label htmlFor="password" className="form-label">
                  비밀번호 <span className="text-danger">*</span>
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  비밀번호 찾기
                </Link>
              </div>
              <div className="input-with-icon">
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <i className="icon-lock input-icon"></i>
              </div>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            
            <div className="form-group d-flex align-items-center remember-me">
              <div className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label className="custom-control-label" htmlFor="rememberMe">
                  로그인 상태 유지
                </label>
              </div>
            </div>
            
            <div className="form-group mt-4">
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  '로그인'
                )}
              </button>
            </div>
          </form>
          
          <div className="divider">
            <span>또는</span>
          </div>
          
          <div className="social-login">
            <button 
              type="button" 
              className="btn btn-social btn-google" 
              onClick={() => handleSocialLogin('google')}
            >
              <i className="icon-google"></i>
              Google로 로그인
            </button>
            
            <button 
              type="button" 
              className="btn btn-social btn-github" 
              onClick={() => handleSocialLogin('github')}
            >
              <i className="icon-github"></i>
              GitHub로 로그인
            </button>
          </div>
          
          <div className="register-link mt-4 text-center">
            계정이 없으신가요?{' '}
            <Link to="/register" className="font-weight-bold">
              회원가입
            </Link>
          </div>
          
          <div className="worker-register-link mt-2 text-center">
            작업자로 등록하시겠습니까?{' '}
            <Link to="/worker-register" className="font-weight-bold">
              작업자 등록
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
