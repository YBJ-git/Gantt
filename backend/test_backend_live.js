const axios = require('axios');

const BASE_URL = 'https://gantt-c1oh.onrender.com';

console.log('🔍 백엔드 API 상태 확인 시작...\n');

async function testAPI() {
  const tests = [
    {
      name: '기본 상태 확인',
      url: `${BASE_URL}/`,
      method: 'GET'
    },
    {
      name: '헬스체크',
      url: `${BASE_URL}/health`,
      method: 'GET'
    },
    {
      name: 'API 헬스체크',
      url: `${BASE_URL}/api/health`,
      method: 'GET'
    },
    {
      name: 'API 상태',
      url: `${BASE_URL}/api/status`,
      method: 'GET'
    },
    {
      name: '시스템 상태',
      url: `${BASE_URL}/api/health/system`,
      method: 'GET'
    },
    {
      name: '데이터베이스 상태',
      url: `${BASE_URL}/api/health/database`,
      method: 'GET'
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`📡 ${test.name} 테스트 중...`);
      
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ ${test.name}: ${response.status} - ${response.statusText}`);
      if (response.data) {
        console.log(`   데이터:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
      }
      
      results.push({
        name: test.name,
        status: 'SUCCESS',
        code: response.status,
        data: response.data
      });
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.response?.status || 'TIMEOUT'} - ${error.message}`);
      if (error.response?.data) {
        console.log(`   오류 데이터:`, JSON.stringify(error.response.data, null, 2));
      }
      
      results.push({
        name: test.name,
        status: 'FAILED',
        code: error.response?.status || 0,
        error: error.message
      });
    }
    
    console.log(''); // 빈 줄
  }

  // 종합 결과
  console.log('📊 테스트 결과 요약:');
  console.log('==================');
  
  const success = results.filter(r => r.status === 'SUCCESS').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`✅ 성공: ${success}/${results.length}`);
  console.log(`❌ 실패: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n💡 실패한 테스트:');
    results
      .filter(r => r.status === 'FAILED')
      .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  }
  
  // 로그인 테스트
  console.log('\n🔐 로그인 API 테스트...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✅ 로그인 성공:', loginResponse.data.success);
    
    if (loginResponse.data.token) {
      // 토큰으로 사용자 정보 조회 테스트
      console.log('\n👤 사용자 정보 조회 테스트...');
      const meResponse = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ 사용자 정보 조회 성공:', meResponse.data.success);
      console.log('   사용자:', meResponse.data.user?.username);
    }
    
  } catch (error) {
    console.log('❌ 로그인 실패:', error.response?.status, error.message);
    if (error.response?.data) {
      console.log('   오류:', error.response.data);
    }
  }
}

testAPI().catch(console.error);
