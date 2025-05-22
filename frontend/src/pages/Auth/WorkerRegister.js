import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './WorkerRegister.css';

const WorkerRegister = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    // 작업자 추가 정보
    department: '',
    position: '',
    specialization: '',
    skillLevel: 'intermediate',
    yearsOfExperience: '',
    availability: '',
    certifications: []
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [certificationList, setCertificationList] = useState([]);
  const [newCertification, setNewCertification] = useState('');
  
  const { registerWorker } = useAuth();
  const navigate = useNavigate();

  // 부서 목록 가져오기 (실제로는 API에서 가져올 것)
  useEffect(() => {
    // API 호출 대신 임시 데이터
    const mockDepartments = [
      { id: 1, name: '개발팀' },
      { id: 2, name: '디자인팀' },
      { id: 3, name: '마케팅팀' },
      { id: 4, name: '운영팀' },
      { id: 5, name: '품질관리팀' }
    ];
    
    setDepartments(mockDepartments);
    
    // 자격증/기술 목록 (실제로는 API에서 가져올 것)
    const mockCertifications = [
      'PMP', 'Scrum Master', 'AWS Certified', 'Microsoft Certified', 
      'ISTQB', 'Six Sigma', 'Adobe Certified', 'Google Analytics'
    ];
    
    setCertificationList(mockCertifications);
  }, []);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
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

  // 자격증 추가 핸들러
  const handleAddCertification = () => {
    if (newCertification.trim() !== '') {
      if (!formData.certifications.includes(newCertification)) {
        setFormData({
          ...formData,
          certifications: [...formData.certifications, newCertification]
        });
      }
      setNewCertification('');
    }
  };

  // 자격증 삭제 핸들러
  const handleRemoveCertification = (certification) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(cert => cert !== certification)
    });
  };

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};
    
    // 기본 사용자 정보 검증
    if (!formData.username.trim()) {
      newErrors.username = '사용자명을 입력해주세요';
    } else if (formData.username.length < 3) {
      newErrors.username = '사용자명은 최소 3자 이상이어야 합니다';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }
    
    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    // 작업자 추가 정보 검증
    if (!formData.department) {
      newErrors.department = '부서를 선택해주세요';
    }
    
    if (!formData.position) {
      newErrors.position = '직책을 입력해주세요';
    }
    
    if (!formData.specialization) {
      newErrors.specialization = '전문 분야를 입력해주세요';
    }
    
    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = '경력 연수를 입력해주세요';
    } else if (isNaN(formData.yearsOfExperience) || parseInt(formData.yearsOfExperience) < 0) {
      newErrors.yearsOfExperience = '유효한 경력 연수를 입력해주세요';
    }
    
    if (!formData.availability) {
      newErrors.availability = '가용 시간을 입력해주세요';
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
      
      // 작업자 등록 데이터 준비
      const workerData = {
        user: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        },
        worker: {
          department: formData.department,
          position: formData.position,
          specialization: formData.specialization,
          skillLevel: formData.skillLevel,
          yearsOfExperience: parseInt(formData.yearsOfExperience),
          availability: formData.availability,
          certifications: formData.certifications
        }
      };
      
      // 작업자 등록 API 호출
      await registerWorker(workerData);
      
      setSuccess(true);
      
      // 3초 후 로그인 페이지로 리다이렉트
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setErrors({
        ...errors,
        submit: error.message || '작업자 등록 중 오류가 발생했습니다'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-register-container">
      <div className="card shadow-md">
        <div className="card-header">
          <h2 className="text-center">작업자 등록</h2>
          <p className="text-center text-muted">작업 관리 시스템에 작업자로 등록하세요</p>
        </div>
        
        <div className="card-body">
          {success ? (
            <div className="alert alert-success text-center">
              <h4>작업자 등록이 완료되었습니다!</h4>
              <p>잠시 후 로그인 페이지로 이동합니다...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="alert alert-danger">{errors.submit}</div>
              )}
              
              <div className="form-section">
                <h3 className="section-title">기본 정보</h3>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="username" className="form-label">
                        사용자명 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                      {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                      <small className="form-text text-muted">영문자와 숫자 조합, 최소 3자 이상</small>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        이메일 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">이름</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="form-control"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">성</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="form-control"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        비밀번호 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      <small className="form-text text-muted">최소 8자 이상, 대문자/소문자/숫자 포함</small>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="confirmPassword" className="form-label">
                        비밀번호 확인 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3 className="section-title">작업자 정보</h3>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="department" className="form-label">
                        부서 <span className="text-danger">*</span>
                      </label>
                      <select
                        id="department"
                        name="department"
                        className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="">부서 선택</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {errors.department && <div className="invalid-feedback">{errors.department}</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="position" className="form-label">
                        직책 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        className={`form-control ${errors.position ? 'is-invalid' : ''}`}
                        value={formData.position}
                        onChange={handleChange}
                        required
                      />
                      {errors.position && <div className="invalid-feedback">{errors.position}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="specialization" className="form-label">
                        전문 분야 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="specialization"
                        name="specialization"
                        className={`form-control ${errors.specialization ? 'is-invalid' : ''}`}
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="예: 프론트엔드 개발, UI 디자인"
                        required
                      />
                      {errors.specialization && <div className="invalid-feedback">{errors.specialization}</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="skillLevel" className="form-label">
                        숙련도
                      </label>
                      <select
                        id="skillLevel"
                        name="skillLevel"
                        className="form-control"
                        value={formData.skillLevel}
                        onChange={handleChange}
                      >
                        <option value="beginner">초급</option>
                        <option value="intermediate">중급</option>
                        <option value="advanced">고급</option>
                        <option value="expert">전문가</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="yearsOfExperience" className="form-label">
                        경력 연수 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        className={`form-control ${errors.yearsOfExperience ? 'is-invalid' : ''}`}
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        min="0"
                        required
                      />
                      {errors.yearsOfExperience && <div className="invalid-feedback">{errors.yearsOfExperience}</div>}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="availability" className="form-label">
                        가용 시간 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="availability"
                        name="availability"
                        className={`form-control ${errors.availability ? 'is-invalid' : ''}`}
                        value={formData.availability}
                        onChange={handleChange}
                        placeholder="예: 주 40시간, 평일 9AM-6PM"
                        required
                      />
                      {errors.availability && <div className="invalid-feedback">{errors.availability}</div>}
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="certifications" className="form-label">자격증 및 기술</label>
                  
                  <div className="certification-container">
                    <div className="certification-input-group">
                      <input
                        type="text"
                        id="newCertification"
                        className="form-control"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="자격증 또는 기술을 입력하세요"
                        list="certificationOptions"
                      />
                      <datalist id="certificationOptions">
                        {certificationList.map((cert, index) => (
                          <option key={index} value={cert} />
                        ))}
                      </datalist>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddCertification}
                      >
                        추가
                      </button>
                    </div>
                    
                    <div className="certification-tags">
                      {formData.certifications.length > 0 ? (
                        formData.certifications.map((cert, index) => (
                          <span key={index} className="certification-tag">
                            {cert}
                            <button
                              type="button"
                              className="certification-remove"
                              onClick={() => handleRemoveCertification(cert)}
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      ) : (
                        <p className="text-muted">추가된 자격증/기술이 없습니다</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex flex-column flex-md-row justify-content-between mt-4">
                <button
                  type="submit"
                  className="btn btn-primary mb-3 mb-md-0"
                  disabled={loading}
                >
                  {loading ? '처리 중...' : '작업자 등록'}
                </button>
                <div className="text-center text-md-right">
                  이미 계정이 있으신가요?{' '}
                  <Link to="/login" className="font-weight-bold">
                    로그인
                  </Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerRegister;
