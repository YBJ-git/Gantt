import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { user, updateUserProfile, changePassword, requestEmailVerification, loading } = useAuth();
  const navigate = useNavigate();
  
  // 프로필 폼 상태
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    bio: '',
    phone: '',
    address: '',
    company: '',
    position: ''
  });
  
  // 비밀번호 변경 폼 상태
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({
    profile: false,
    password: false,
    verification: false
  });
  
  // 사용자 정보 로드
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
        company: user.company || '',
        position: user.position || ''
      });
    }
  }, [user]);
  
  // 프로필 입력 핸들러
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
    
    // 입력 시 해당 필드 오류 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // 비밀번호 입력 핸들러
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // 입력 시 해당 필드 오류 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // 프로필 폼 검증
  const validateProfileForm = () => {
    const newErrors = {};
    
    // 이메일 검증 (선택적)
    if (profileData.email && !/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 비밀번호 폼 검증
  const validatePasswordForm = () => {
    const newErrors = {};
    
    // 현재 비밀번호 검증
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요';
    }
    
    // 새 비밀번호 검증
    if (!passwordData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = '비밀번호는 최소 8자 이상이어야 합니다';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다';
    }
    
    // 비밀번호 확인 검증
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 프로필 업데이트 핸들러
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      await updateUserProfile(profileData);
      
      setSuccess({
        ...success,
        profile: true
      });
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess({
          ...success,
          profile: false
        });
      }, 3000);
      
      setIsEditing(false);
    } catch (error) {
      setErrors({
        ...errors,
        submit: error.message || '프로필 업데이트 중 오류가 발생했습니다'
      });
    }
  };
  
  // 비밀번호 변경 핸들러
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setSuccess({
        ...success,
        password: true
      });
      
      // 폼 초기화
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess({
          ...success,
          password: false
        });
      }, 3000);
    } catch (error) {
      setErrors({
        ...errors,
        passwordSubmit: error.message || '비밀번호 변경 중 오류가 발생했습니다'
      });
    }
  };
  
  // 이메일 인증 요청 핸들러
  const handleVerificationRequest = async () => {
    try {
      await requestEmailVerification(user.email);
      
      setSuccess({
        ...success,
        verification: true
      });
      
      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSuccess({
          ...success,
          verification: false
        });
      }, 3000);
    } catch (error) {
      setErrors({
        ...errors,
        verification: error.message || '이메일 인증 요청 중 오류가 발생했습니다'
      });
    }
  };
  
  // 편집 모드 전환 핸들러
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    
    // 편집 모드 취소 시 원래 값으로 복원
    if (isEditing && user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
        bio: user.bio || '',
        phone: user.phone || '',
        address: user.address || '',
        company: user.company || '',
        position: user.position || ''
      });
    }
  };
  
  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>사용자 프로필</h1>
        <div className="user-role-badge">{user?.role}</div>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          프로필 정보
        </button>
        <button 
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          보안 설정
        </button>
        <button 
          className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          환경 설정
        </button>
      </div>
      
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>프로필 정보</h2>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={toggleEditMode}
              >
                {isEditing ? '취소' : '편집'}
              </button>
            </div>
            
            {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
            {success.profile && <div className="alert alert-success">프로필이 성공적으로 업데이트되었습니다.</div>}
            
            <form onSubmit={handleProfileSubmit}>
              <div className="user-profile-grid">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">사용자명</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                    readOnly
                  />
                  <small className="form-text text-muted">사용자명은 변경할 수 없습니다.</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">이메일</label>
                  <div className="input-with-badge">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing || loading}
                      readOnly
                    />
                    {user?.emailVerified ? (
                      <span className="verified-badge">인증됨</span>
                    ) : (
                      <span className="unverified-badge">미인증</span>
                    )}
                  </div>
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  <small className="form-text text-muted">이메일은 변경할 수 없습니다.</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="firstName" className="form-label">이름</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="form-control"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName" className="form-label">성</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="form-control"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                  />
                </div>
                
                <div className="form-group grid-span-2">
                  <label htmlFor="bio" className="form-label">자기소개</label>
                  <textarea
                    id="bio"
                    name="bio"
                    className="form-control"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">전화번호</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                  />
                </div>
                
                <div className="form-group grid-span-2">
                  <label htmlFor="address" className="form-label">주소</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    className="form-control"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company" className="form-label">회사/조직</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="form-control"
                    value={profileData.company}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="position" className="form-label">직위/직함</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    className="form-control"
                    value={profileData.position}
                    onChange={handleProfileChange}
                    disabled={!isEditing || loading}
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '저장 중...' : '저장'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>보안 설정</h2>
            </div>
            
            <div className="security-section">
              <h3>이메일 인증</h3>
              {errors.verification && <div className="alert alert-danger">{errors.verification}</div>}
              {success.verification && <div className="alert alert-success">인증 이메일이 발송되었습니다. 메일함을 확인해주세요.</div>}
              
              <div className="email-verification-status">
                <p>
                  <strong>상태:</strong>{' '}
                  {user?.emailVerified ? (
                    <span className="verified-badge">인증됨</span>
                  ) : (
                    <span className="unverified-badge">미인증</span>
                  )}
                </p>
                {!user?.emailVerified && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleVerificationRequest}
                    disabled={loading}
                  >
                    인증 이메일 발송
                  </button>
                )}
              </div>
            </div>
            
            <div className="security-section">
              <h3>비밀번호 변경</h3>
              {errors.passwordSubmit && <div className="alert alert-danger">{errors.passwordSubmit}</div>}
              {success.password && <div className="alert alert-success">비밀번호가 성공적으로 변경되었습니다.</div>}
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">현재 비밀번호</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                  />
                  {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">새 비밀번호</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                  />
                  {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                  <small className="form-text text-muted">최소 8자 이상, 대문자/소문자/숫자 포함</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">새 비밀번호 확인</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    disabled={loading}
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? '변경 중...' : '비밀번호 변경'}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="security-section">
              <h3>로그인 기록</h3>
              <p className="text-muted">최근 로그인 기록을 확인하거나 활성 세션을 관리할 수 있습니다.</p>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/profile/sessions')}
              >
                로그인 기록 보기
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>환경 설정</h2>
            </div>
            
            <div className="preferences-section">
              <h3>알림 설정</h3>
              <p className="text-muted">앱 내 알림, 이메일 알림 등을 관리할 수 있습니다.</p>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/profile/notifications')}
              >
                알림 설정 관리
              </button>
            </div>
            
            <div className="preferences-section">
              <h3>테마 설정</h3>
              <div className="theme-options">
                <div className="theme-option">
                  <input
                    type="radio"
                    id="theme-light"
                    name="theme"
                    value="light"
                    checked
                  />
                  <label htmlFor="theme-light">라이트 모드</label>
                </div>
                <div className="theme-option">
                  <input
                    type="radio"
                    id="theme-dark"
                    name="theme"
                    value="dark"
                  />
                  <label htmlFor="theme-dark">다크 모드</label>
                </div>
                <div className="theme-option">
                  <input
                    type="radio"
                    id="theme-system"
                    name="theme"
                    value="system"
                  />
                  <label htmlFor="theme-system">시스템 설정에 따름</label>
                </div>
              </div>
            </div>
            
            <div className="preferences-section">
              <h3>언어 설정</h3>
              <select className="form-control" defaultValue="ko">
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
