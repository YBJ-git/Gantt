// 더미 프로젝트 ID 목록
const projectIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 테스트 함수: 랜덤 프로젝트 ID 설정
function setRandomProjectId(context, events, done) {
  context.vars.projectId = projectIds[Math.floor(Math.random() * projectIds.length)];
  return done();
}

// 테스트 함수: 최적화 요청 파라미터 생성
function generateOptimizationRequest(context, events, done) {
  const optimizationTypes = ['balance', 'minimize-duration', 'maximize-efficiency'];
  
  context.vars.optimizationParams = {
    type: optimizationTypes[Math.floor(Math.random() * optimizationTypes.length)],
    constraints: {
      maxWorkloadPerDay: 8,
      maxResourceUtilization: 0.9,
      prioritizeTasks: Math.random() > 0.5
    },
    applyImmediately: Math.random() > 0.7
  };
  
  return done();
}

// 테스트 함수: 랜덤 날짜 범위 설정
function setRandomDateRange(context, events, done) {
  // 현재 날짜 기준으로 랜덤 날짜 범위 생성
  const today = new Date();
  
  // 시작일: 0-30일 전
  const startOffset = Math.floor(Math.random() * 30);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - startOffset);
  
  // 종료일: 시작일로부터 7-60일 후
  const endOffset = 7 + Math.floor(Math.random() * 53);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + endOffset);
  
  // ISO 문자열 형식으로 변환하여 설정
  context.vars.startDate = startDate.toISOString().split('T')[0];
  context.vars.endDate = endDate.toISOString().split('T')[0];
  
  return done();
}

module.exports = {
  setRandomProjectId,
  generateOptimizationRequest,
  setRandomDateRange
};