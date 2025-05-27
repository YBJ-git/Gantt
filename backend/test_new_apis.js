/**
 * 새로 추가된 API 엔드포인트 테스트
 */
const axios = require('axios');

const BASE_URL = 'https://gantt-c1oh.onrender.com';

// 테스트용 토큰 (admin 로그인)
let authToken = null;

async function login() {
  try {
    console.log('🔐 로그인 중...');
    const response = await axios.post(`${BASE_URL}/api/users/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    console.log('✅ 로그인 성공');
    return authToken;
  } catch (error) {
    console.error('❌ 로그인 실패:', error.message);
    throw error;
  }
}

async function testAPI(endpoint, description) {
  try {
    console.log(`\n📡 테스트: ${description}`);
    console.log(`   GET ${endpoint}`);
    
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log(`✅ 성공 (${response.status})`);
    console.log(`   데이터 크기: ${JSON.stringify(response.data).length} bytes`);
    
    // 주요 필드 확인
    if (response.data.success !== undefined) {
      console.log(`   성공 상태: ${response.data.success}`);
    }
    if (response.data.data && typeof response.data.data === 'object') {
      console.log(`   데이터 필드 수: ${Object.keys(response.data.data).length}`);
    }
    if (response.data.roles && Array.isArray(response.data.roles)) {
      console.log(`   역할 수: ${response.data.roles.length}`);
    }
    if (response.data.data && response.data.pagination) {
      console.log(`   아이템 수: ${response.data.data.length}, 총 페이지: ${response.data.pagination.totalPages}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ 실패: ${error.response?.status || 'CONNECTION_ERROR'}`);
    console.error(`   메시지: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 새로 추가된 API 엔드포인트 테스트 시작');
  console.log(`📡 대상 URL: ${BASE_URL}`);
  
  try {
    // 로그인
    await login();
    
    const tests = [
      { endpoint: '/api/dashboard/data', description: '대시보드 데이터 조회' },
      { endpoint: '/api/roles', description: '역할 정보 조회' },
      { endpoint: '/api/notifications', description: '알림 목록 조회' },
      { endpoint: '/api/notifications/settings', description: '알림 설정 조회' },
      { endpoint: '/api/tasks', description: '작업 목록 조회' },
      { endpoint: '/api/resources', description: '리소스 목록 조회' }
    ];
    
    let successCount = 0;
    let totalCount = tests.length;
    
    for (const test of tests) {
      const result = await testAPI(test.endpoint, test.description);
      if (result) successCount++;
    }
    
    console.log('\n📊 테스트 결과 요약');
    console.log(`   성공: ${successCount}/${totalCount}`);
    console.log(`   성공률: ${Math.round((successCount / totalCount) * 100)}%`);
    
    if (successCount === totalCount) {
      console.log('\n🎉 모든 새로운 API가 정상 작동합니다!');
    } else {
      console.log('\n⚠️ 일부 API에서 문제가 발생했습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  }
}

// 테스트 실행
runTests().catch(console.error);
