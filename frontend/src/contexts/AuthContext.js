import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import SessionWarningModal from '../components/modals/SessionWarningModal';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

// 인증 컨텍스트 제공자 컴포넌트
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [sessionTimeoutId, setSessionTimeoutId] = useState(null);
  const [sessionWarningId, setSessionWarningId] = useState(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // 세션 설정
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
  const WARNING_TIME = 5 * 60 * 1000; // 5분 전 경고
  const CHECK_INTERVAL = 60 * 1000; // 1분마다 체크

  // 세션 타이머 설정 함수
  const setSessionTimer = useCallback(() => {
    // 기존 타이머들 제거
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }
    if (sessionWarningId) {
      clearTimeout(sessionWarningId);
    }

    // 마지막 활동 시간 저장
    const lastActivity = Date.now();
    localStorage.setItem('lastActivity', lastActivity.toString());

    // 경고 모달 타이머 설정 (세션 만료 5분 전)
    const warningId = setTimeout(() => {
      setShowSessionWarning(true);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // 세션 만료 타이머 설정
    const timeoutId = setTimeout(() => {
      setIsSessionExpired(true);
      setShowSessionWarning(false);
      
      // 직접 로그아웃 처리 (순환 참조 방지)
      localStorage.removeItem('token');
      localStorage.removeItem('lastActivity');
      setToken(null);
      setUser(null);
      setIsSessionExpired(false);
      setShowSessionWarning(false);
    }, SESSION_TIMEOUT);

    setSessionWarningId(warningId);
    setSessionTimeoutId(timeoutId);
  }, []);

  // 세션 연장 함수
  const extendSession = useCallback(() => {
    if (user && token) {
      setSessionTimer();
      setIsSessionExpired(false);
      setShowSessionWarning(false);
    }
  }, [user, token, setSessionTimer]);

  // 세션 유효성 검사 함수
  const checkSessionValidity = useCallback(() => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeDiff = Date.now() - parseInt(lastActivity);
      if (timeDiff > SESSION_TIMEOUT) {
        setIsSessionExpired(true);
        
        // 직접 로그아웃 처리 (순환 참조 방지)
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        setToken(null);
        setUser(null);
        setIsSessionExpired(false);
        setShowSessionWarning(false);
        
        return false;
      }
    }
    return true;
  }, []);

  // 페이지 활동 감지 이벤트 리스너
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      if (user && token && !isSessionExpired) {
        extendSession();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [user, token, isSessionExpired, extendSession]);

  // 정기적인 세션 검사
  useEffect(() => {
    if (user && token) {
      const intervalId = setInterval(() => {
        checkSessionValidity();
      }, CHECK_INTERVAL);

      return () => clearInterval(intervalId);
    }
  }, [user, token, checkSessionValidity]);

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 AuthContext - 초기 인증 상태 확인 시작');
        console.log('🔑 저장된 토큰:', !!token);
        
        if (token) {
          console.log('📡 현재 사용자 정보 조회 중...');
          // 토큰이 있는 경우 현재 유저 정보 가져오기
          const currentUser = await authService.getCurrentUser();
          console.log('👤 사용자 정보 획득:', currentUser);
          setUser(currentUser);
          
          // 세션 타이머 시작
          setSessionTimer();
        } else {
          console.log('❌ 토큰이 없음 - 미인증 상태');
          setUser(null);
        }
      } catch (err) {
        console.error('❌ 인증 상태 확인 중 오류:', err);
        // 토큰이 유효하지 않으면 로그아웃 처리
        console.log('🧹 유효하지 않은 토큰 제거');
        localStorage.removeItem('token');
        localStorage.removeItem('lastActivity');
        setToken(null);
        setUser(null);
      } finally {
        console.log('✅ 인증 상태 확인 완료');
        setLoading(false);
      }
    };

    // 약간의 지연을 두어 토큰 검증이 완료되도록 함
    setTimeout(() => {
      checkAuthStatus();
    }, 100);
  }, [token, setSessionTimer]);

  // 로그인 함수
  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 AuthContext - 로그인 시작');
      const response = await authService.login(username, password);
      console.log('📦 AuthContext - 로그인 응답:', response);
      
      // 응답 구조 안전하게 처리
      if (!response) {
        throw new Error('로그인 응답이 없습니다');
      }
      
      const { token, user } = response;
      console.log('🔑 AuthContext - 추출된 토큰:', token);
      console.log('👤 AuthContext - 추출된 사용자:', user);
      
      if (!token) {
        throw new Error('토큰이 응답에 포함되지 않았습니다');
      }
      
      if (!user) {
        throw new Error('사용자 정보가 응답에 포함되지 않았습니다');
      }
      
      // 로컬 스토리지에 토큰 저장
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      console.log('✅ AuthContext - 로그인 처리 완료');
      
      // 세션 타이머 시작
      setSessionTimer();
      
      return user;
    } catch (err) {
      console.error('❌ AuthContext - 로그인 오류:', err);
      setError(err.message || '로그인 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSessionTimer]);
  
  // 소셜 로그인 함수
  const socialLogin = useCallback(async (provider, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.socialLogin(provider, token);
      const { token: authToken, user } = response;
      
      // 로컬 스토리지에 토큰 저장
      localStorage.setItem('token', authToken);
      setToken(authToken);
      setUser(user);
      
      // 세션 타이머 시작
      setSessionTimer();
      
      return user;
    } catch (err) {
      setError(err.message || `${provider} 로그인 중 오류가 발생했습니다.`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSessionTimer]);
  
  // 소셜 로그인 URL 가져오기
  const getSocialLoginUrl = useCallback((provider) => {
    return authService.getSocialLoginUrl(provider);
  }, []);

  // 회원가입 함수
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.register(userData);
      return result;
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 작업자 등록 함수
  const registerWorker = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.registerWorker(userData);
      return result;
    } catch (err) {
      setError(err.message || '작업자 등록 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃 함수
  const logout = useCallback(() => {
    // 세션 타이머들 제거
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
      setSessionTimeoutId(null);
    }
    if (sessionWarningId) {
      clearTimeout(sessionWarningId);
      setSessionWarningId(null);
    }
    
    // 로컬 스토리지 정리
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
    
    setToken(null);
    setUser(null);
    setIsSessionExpired(false);
    setShowSessionWarning(false);
  }, []);

  // 사용자 정보 업데이트 함수
  const updateUserProfile = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateUserProfile(userData);
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      setError(err.message || '프로필 업데이트 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 비밀번호 변경 함수
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.changePassword(currentPassword, newPassword);
    } catch (err) {
      setError(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 관리자용 사용자 목록 조회 함수
  const getAllUsers = useCallback(async () => {
    try {
      if (!user || user.role !== 'admin') {
        throw new Error('권한이 없습니다.');
      }
      
      return await authService.getAllUsers();
    } catch (err) {
      setError(err.message || '사용자 목록 조회 중 오류가 발생했습니다.');
      throw err;
    }
  }, [user]);

  // 관리자용 사용자 역할 변경 함수
  const changeUserRole = useCallback(async (userId, role) => {
    try {
      if (!user || user.role !== 'admin') {
        throw new Error('권한이 없습니다.');
      }
      
      await authService.changeUserRole(userId, role);
    } catch (err) {
      setError(err.message || '사용자 역할 변경 중 오류가 발생했습니다.');
      throw err;
    }
  }, [user]);
  
  // 이메일 인증 요청 함수
  const requestEmailVerification = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.requestEmailVerification(email);
      return true;
    } catch (err) {
      setError(err.message || '이메일 인증 요청 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 이메일 인증 확인 함수
  const verifyEmail = useCallback(async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.verifyEmail(token);
      
      // 현재 로그인된 사용자의 이메일이 인증된 경우 사용자 정보 업데이트
      if (user && user.id === result.userId) {
        setUser({
          ...user,
          emailVerified: true
        });
      }
      
      return result;
    } catch (err) {
      setError(err.message || '이메일 인증 확인 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // 비밀번호 찾기 요청 함수
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.requestPasswordReset(email);
      return true;
    } catch (err) {
      setError(err.message || '비밀번호 찾기 요청 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // 비밀번호 재설정 함수
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(token, newPassword);
      return true;
    } catch (err) {
      setError(err.message || '비밀번호 재설정 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 컨텍스트 값
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isSessionExpired,
    login,
    socialLogin,
    getSocialLoginUrl,
    register,
    registerWorker,
    logout,
    extendSession,
    updateUserProfile,
    changePassword,
    getAllUsers,
    changeUserRole,
    requestEmailVerification,
    verifyEmail,
    requestPasswordReset,
    resetPassword
  };

  // 세션 경고 모달 처리 함수
  const handleSessionWarningExtend = useCallback(() => {
    extendSession();
  }, [extendSession]);

  const handleSessionWarningLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionWarningModal
        isOpen={showSessionWarning}
        onExtend={handleSessionWarningExtend}
        onLogout={handleSessionWarningLogout}
        warningTime={WARNING_TIME / 1000} // 초 단위로 전달
      />
    </AuthContext.Provider>
  );
};

// 컨텍스트 사용을 위한 훅
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
