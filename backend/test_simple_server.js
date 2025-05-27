/**
 * 간단한 서버 테스트 스크립트
 */
const http = require('http');

function testServer(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);

    http.get(url, (res) => {
      clearTimeout(timer);
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    }).on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

async function runTests() {
  console.log('🚀 로컬 서버 테스트 시작\n');
  
  const tests = [
    { url: 'http://localhost:3000/', name: '기본 경로' },
    { url: 'http://localhost:3000/health', name: '헬스체크' },
    { url: 'http://localhost:3000/api/status', name: 'API 상태' }
  ];
  
  for (const test of tests) {
    try {
      console.log(`📡 테스트: ${test.name} (${test.url})`);
      const result = await testServer(test.url);
      console.log(`✅ 상태: ${result.status}`);
      console.log(`📄 응답:`, result.data);
      console.log('');
    } catch (error) {
      console.log(`❌ 실패: ${error.message}`);
      console.log('');
    }
  }
}

runTests();
