/**
 * 배포된 서버 종합 테스트 스크립트
 * Render에 배포된 간트 차트 시스템의 모든 엔드포인트 테스트
 */
const axios = require('axios');

const BASE_URL = 'https://gantt-c1oh.onrender.com';

class ServerTester {
  constructor() {
    this.results = [];
    this.authToken = null;
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.results.push({ timestamp, type, message });
  }

  async testEndpoint(method, path, data = null, headers = {}) {
    const url = `${BASE_URL}${path}`;
    
    try {
      await this.log(`테스트 시작: ${method} ${path}`);
      
      const config = {
        method: method.toLowerCase(),
        url,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: 10000
      };
      
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }
      
      const response = await axios(config);
      
      await this.log(`✅ 성공 (${response.status}): ${path}`, 'success');
      
      return {
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers
      };
      
    } catch (error) {
      const status = error.response?.status || '연결실패';
      const message = error.response?.data?.message || error.message;
      
      await this.log(`❌ 실패 (${status}): ${path} - ${message}`, 'error');
      
      return {
        success: false,
        status: error.response?.status,
        data: error.response?.data,
        error: error.message
      };
    }
  }

  async runAllTests() {
    await this.log('🚀 배포된 서버 종합 테스트 시작');
    await this.log(`📡 대상 URL: ${BASE_URL}`);
    
    // 1. 기본 연결 테스트
    await this.log('\n📋 1단계: 기본 연결 테스트');
    const basicTests = [
      { method: 'GET', path: '/', name: '기본 경로' },
      { method: 'GET', path: '/health', name: '헬스체크' },
      { method: 'GET', path: '/api/status', name: 'API 상태' }
    ];
    
    for (const test of basicTests) {
      const result = await this.testEndpoint(test.method, test.path);
      if (result.success) {
        await this.log(`  ✓ ${test.name}: 정상`);
      } else {
        await this.log(`  ✗ ${test.name}: 실패`);
      }
    }
    
    // 2. 헬스체크 상세 테스트
    await this.log('\n📋 2단계: 헬스체크 상세 테스트');
    const healthTests = [
      { method: 'GET', path: '/api/health/system', name: '시스템 상태' },
      { method: 'GET', path: '/api/health/database', name: '데이터베이스 상태' }
    ];
    
    for (const test of healthTests) {
      const result = await this.testEndpoint(test.method, test.path);
      if (result.success && result.data) {
        await this.log(`  ✓ ${test.name}: ${result.data.status || '응답 있음'}`);
        if (result.data.database) {
          await this.log(`    - DB 연결: ${result.data.database.status || 'unknown'}`);
        }
        if (result.data.environment) {
          await this.log(`    - DB URL 존재: ${result.data.environment.database_url_exists || 'unknown'}`);
        }
      } else {
        await this.log(`  ✗ ${test.name}: 실패`);
      }
    }
    
    // 3. 로그인 테스트
    await this.log('\n📋 3단계: 로그인 테스트');
    const loginResult = await this.testEndpoint('POST', '/api/users/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResult.success && loginResult.data) {
      this.authToken = loginResult.data.token;
      await this.log(`  ✓ admin 로그인: 성공`);
      await this.log(`    - 사용자: ${loginResult.data.user?.username || 'unknown'}`);
      await this.log(`    - 역할: ${loginResult.data.user?.role || 'unknown'}`);
      await this.log(`    - 토큰: ${this.authToken ? '발급됨' : '없음'}`);
    } else {
      await this.log(`  ✗ admin 로그인: 실패`);
    }
    
    // 4. 인증이 필요한 API 테스트
    if (this.authToken) {
      await this.log('\n📋 4단계: 인증 API 테스트');
      
      const authHeaders = { 'Authorization': `Bearer ${this.authToken}` };
      
      const authTests = [
        { method: 'GET', path: '/api/users/me', name: '내 정보 조회' },
        { method: 'GET', path: '/api/users', name: '모든 사용자 조회 (관리자)' }
      ];
      
      for (const test of authTests) {
        const result = await this.testEndpoint(test.method, test.path, null, authHeaders);
        if (result.success) {
          await this.log(`  ✓ ${test.name}: 성공`);
          if (result.data?.user) {
            await this.log(`    - 사용자: ${result.data.user.username}`);
          }
          if (result.data?.users) {
            await this.log(`    - 사용자 수: ${result.data.users.length}명`);
          }
        } else {
          await this.log(`  ✗ ${test.name}: 실패`);
        }
      }
    }
    
    // 5. 다른 계정 로그인 테스트
    await this.log('\n📋 5단계: 다른 계정 로그인 테스트');
    const otherAccounts = [
      { username: 'tester', password: 'Test123', role: '일반사용자' },
      { username: 'manager', password: 'Manager123', role: '매니저' },
      { username: 'worker', password: 'Worker123', role: '작업자' }
    ];
    
    for (const account of otherAccounts) {
      const result = await this.testEndpoint('POST', '/api/users/login', {
        username: account.username,
        password: account.password
      });
      
      if (result.success) {
        await this.log(`  ✓ ${account.username} (${account.role}): 로그인 성공`);
      } else {
        await this.log(`  ✗ ${account.username} (${account.role}): 로그인 실패`);
      }
    }
    
    // 6. 결과 요약
    await this.log('\n📊 테스트 결과 요약');
    const successCount = this.results.filter(r => r.type === 'success').length;
    const errorCount = this.results.filter(r => r.type === 'error').length;
    const totalTests = successCount + errorCount;
    
    await this.log(`  성공: ${successCount}/${totalTests}`);
    await this.log(`  실패: ${errorCount}/${totalTests}`);
    await this.log(`  성공률: ${totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0}%`);
    
    if (errorCount === 0) {
      await this.log('\n🎉 모든 테스트가 성공했습니다!', 'success');
      await this.log('✅ 간트 차트 시스템이 정상적으로 배포되었습니다.');
      await this.log('🔗 프론트엔드: https://tubular-vacherin-352fde.netlify.app');
      await this.log('🔗 백엔드: https://gantt-c1oh.onrender.com');
      await this.log('🔑 로그인: admin / admin123');
    } else {
      await this.log('\n⚠️ 일부 테스트가 실패했습니다.', 'error');
      await this.log('❌ 실패한 테스트들을 확인하고 수정이 필요합니다.');
    }
    
    return {
      total: totalTests,
      success: successCount,
      failed: errorCount,
      successRate: totalTests > 0 ? Math.round((successCount / totalTests) * 100) : 0
    };
  }
}

// 스크립트 실행
async function main() {
  const tester = new ServerTester();
  
  try {
    const results = await tester.runAllTests();
    
    console.log('\n' + '='.repeat(50));
    console.log('최종 결과:', results);
    console.log('='.repeat(50));
    
    if (results.successRate >= 80) {
      process.exit(0); // 성공
    } else {
      process.exit(1); // 실패
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    process.exit(1);
  }
}

// 5분 후에 테스트 실행 (배포 완료 대기)
console.log('⏳ Render 배포 완료를 위해 5분 대기 중...');
console.log('💡 수동으로 실행하려면: node test_deployment.js');

if (process.argv.includes('--now')) {
  console.log('🚀 즉시 테스트 시작');
  main();
} else {
  setTimeout(() => {
    console.log('⏰ 대기 완료, 테스트 시작');
    main();
  }, 5 * 60 * 1000); // 5분
}
