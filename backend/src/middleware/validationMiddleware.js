/**
 * Validation Middleware
 * 데이터 유효성 검증 미들웨어
 */
const Joi = require('joi');
const { ValidationError } = require('../utils/errorHandler');

/**
 * 사용자 등록 데이터 검증
 */
const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required()
      .messages({
        'string.base': '사용자명은 문자열이어야 합니다.',
        'string.empty': '사용자명을 입력해주세요.',
        'string.min': '사용자명은 최소 {#limit}자 이상이어야 합니다.',
        'string.max': '사용자명은 최대 {#limit}자까지 가능합니다.',
        'string.alphanum': '사용자명은 영문자와 숫자만 포함해야 합니다.',
        'any.required': '사용자명은 필수 항목입니다.'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.base': '이메일은 문자열이어야 합니다.',
        'string.empty': '이메일을 입력해주세요.',
        'string.email': '유효한 이메일 주소를 입력해주세요.',
        'any.required': '이메일은 필수 항목입니다.'
      }),
    password: Joi.string().min(8).required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$'))
      .messages({
        'string.base': '비밀번호는 문자열이어야 합니다.',
        'string.empty': '비밀번호를 입력해주세요.',
        'string.min': '비밀번호는 최소 {#limit}자 이상이어야 합니다.',
        'string.pattern.base': '비밀번호는 최소 하나의 대문자, 소문자, 숫자를 포함해야 합니다.',
        'any.required': '비밀번호는 필수 항목입니다.'
      }),
    firstName: Joi.string().max(50).allow('', null),
    lastName: Joi.string().max(50).allow('', null),
    // role은 서버에서 설정
    role: Joi.string().valid('admin', 'manager', 'worker', 'user')
  });

  validateRequest(req, res, next, schema);
};

/**
 * 사용자 정보 업데이트 검증
 */
const validateUpdateUser = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30)
      .messages({
        'string.base': '사용자명은 문자열이어야 합니다.',
        'string.empty': '사용자명을 입력해주세요.',
        'string.min': '사용자명은 최소 {#limit}자 이상이어야 합니다.',
        'string.max': '사용자명은 최대 {#limit}자까지 가능합니다.',
        'string.alphanum': '사용자명은 영문자와 숫자만 포함해야 합니다.'
      }),
    email: Joi.string().email()
      .messages({
        'string.base': '이메일은 문자열이어야 합니다.',
        'string.empty': '이메일을 입력해주세요.',
        'string.email': '유효한 이메일 주소를 입력해주세요.'
      }),
    firstName: Joi.string().max(50).allow('', null),
    lastName: Joi.string().max(50).allow('', null),
    role: Joi.string().valid('admin', 'manager', 'worker', 'user'),
    status: Joi.string().valid('active', 'inactive')
  });

  validateRequest(req, res, next, schema);
};

/**
 * 작업 생성 데이터 검증
 */
const validateTaskCreation = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required()
      .messages({
        'string.base': '작업명은 문자열이어야 합니다.',
        'string.empty': '작업명을 입력해주세요.',
        'string.min': '작업명은 최소 {#limit}자 이상이어야 합니다.',
        'string.max': '작업명은 최대 {#limit}자까지 가능합니다.',
        'any.required': '작업명은 필수 항목입니다.'
      }),
    description: Joi.string().max(1000).allow('', null),
    start_date: Joi.date().iso().required()
      .messages({
        'date.base': '시작일은 유효한 날짜여야 합니다.',
        'date.format': '시작일은 ISO 형식(YYYY-MM-DD)이어야 합니다.',
        'any.required': '시작일은 필수 항목입니다.'
      }),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
      .messages({
        'date.base': '종료일은 유효한 날짜여야 합니다.',
        'date.format': '종료일은 ISO 형식(YYYY-MM-DD)이어야 합니다.',
        'date.min': '종료일은 시작일보다 이후여야 합니다.',
        'any.required': '종료일은 필수 항목입니다.'
      }),
    duration: Joi.number().integer().min(1).required()
      .messages({
        'number.base': '기간은 숫자여야 합니다.',
        'number.integer': '기간은 정수여야 합니다.',
        'number.min': '기간은 최소 {#limit}일 이상이어야 합니다.',
        'any.required': '기간은 필수 항목입니다.'
      }),
    progress: Joi.number().min(0).max(100).default(0)
      .messages({
        'number.base': '진행도는 숫자여야 합니다.',
        'number.min': '진행도는 최소 {#limit}%이어야 합니다.',
        'number.max': '진행도는 최대 {#limit}%까지 가능합니다.'
      }),
    status: Joi.string().valid('not_started', 'in_progress', 'completed', 'delayed').default('not_started'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    project_id: Joi.number().integer().required()
      .messages({
        'number.base': '프로젝트 ID는 숫자여야 합니다.',
        'number.integer': '프로젝트 ID는 정수여야 합니다.',
        'any.required': '프로젝트 ID는 필수 항목입니다.'
      }),
    parent_id: Joi.number().integer().allow(null),
    assigned_resources: Joi.array().items(Joi.number().integer())
  });

  validateRequest(req, res, next, schema);
};

/**
 * 작업 업데이트 데이터 검증
 */
const validateTaskUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100)
      .messages({
        'string.base': '작업명은 문자열이어야 합니다.',
        'string.empty': '작업명을 입력해주세요.',
        'string.min': '작업명은 최소 {#limit}자 이상이어야 합니다.',
        'string.max': '작업명은 최대 {#limit}자까지 가능합니다.'
      }),
    description: Joi.string().max(1000).allow('', null),
    start_date: Joi.date().iso()
      .messages({
        'date.base': '시작일은 유효한 날짜여야 합니다.',
        'date.format': '시작일은 ISO 형식(YYYY-MM-DD)이어야 합니다.'
      }),
    end_date: Joi.date().iso().min(Joi.ref('start_date'))
      .messages({
        'date.base': '종료일은 유효한 날짜여야 합니다.',
        'date.format': '종료일은 ISO 형식(YYYY-MM-DD)이어야 합니다.',
        'date.min': '종료일은 시작일보다 이후여야 합니다.'
      }),
    duration: Joi.number().integer().min(1)
      .messages({
        'number.base': '기간은 숫자여야 합니다.',
        'number.integer': '기간은 정수여야 합니다.',
        'number.min': '기간은 최소 {#limit}일 이상이어야 합니다.'
      }),
    progress: Joi.number().min(0).max(100)
      .messages({
        'number.base': '진행도는 숫자여야 합니다.',
        'number.min': '진행도는 최소 {#limit}%이어야 합니다.',
        'number.max': '진행도는 최대 {#limit}%까지 가능합니다.'
      }),
    status: Joi.string().valid('not_started', 'in_progress', 'completed', 'delayed'),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    project_id: Joi.number().integer()
      .messages({
        'number.base': '프로젝트 ID는 숫자여야 합니다.',
        'number.integer': '프로젝트 ID는 정수여야 합니다.'
      }),
    parent_id: Joi.number().integer().allow(null)
  });

  validateRequest(req, res, next, schema);
};

/**
 * 공통 검증 함수
 */
function validateRequest(req, res, next, schema) {
  const options = {
    abortEarly: false, // 모든 오류 반환
    allowUnknown: true, // 알 수 없는 속성 허용
    stripUnknown: true // 알 수 없는 속성 제거
  };

  const { error, value } = schema.validate(req.body, options);
  
  if (error) {
    const validationErrors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return next(new ValidationError('입력 데이터 검증에 실패했습니다.', validationErrors));
  }

  // 검증된 데이터로 교체
  req.body = value;
  next();
}

module.exports = {
  validateUserRegistration,
  validateUpdateUser,
  validateTaskCreation,
  validateTaskUpdate
};
