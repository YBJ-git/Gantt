/**
 * 실제 백엔드 API 테스트 스크립트
 * Render 백엔드 서비스와 PostgreSQL 연결 테스트
 */
const axios = require('axios');

const API_URL = 'https://gantt-c1oh.onrender.com';

async function testAPI() {
    console.log('🚀 백엔드 API 테스트 시작\n');
    
    try {
        // 1. 서버 상태 확인
        console.log('📡 서버 상태 확인...');
        const healthResponse = await axios.get(`${API_URL}/api/health`);
        console.log('✅ 서버 응답:', healthResponse.data);
        
        // 2. 시스템 상태 확인
        console.log('\n🖥️ 시스템 상태 확인...');
        const systemResponse = await axios.get(`${API_URL}/api/health/system`);
        console.log('시스템 상태:', systemResponse.data.status);
        console.log('데이터베이스 URL 존재:', systemResponse.data.environment.database_url_exists);
        console.log('데이터베이스 상태:', systemResponse.data.database?.status || 'N/A');
        
        // 3. 데이터베이스 상태 확인
        console.log('\n🗄️ 데이터베이스 상태 확인...');
        const dbResponse = await axios.get(`${API_URL}/api/health/database`);
        console.log('데이터베이스 응답:', dbResponse.data);
        
        // 4. 로그인 테스트
        console.log('\n🔐 admin 로그인 테스트...');
        const loginResponse = await axios.post(`${API_URL}/api/users/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('✅ 로그인 성공!');
        console.log('사용자 정보:', loginResponse.data.user);
        console.log('토큰 발급:', !!loginResponse.data.token);
        
        // 5. 인증이 필요한 API 테스트
        console.log('\n👤 사용자 정보 조회 테스트...');
        const token = loginResponse.data.token;
        const userResponse = await axios.get(`${API_URL}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ 사용자 정보 조회 성공:', userResponse.data.user);
        
        console.log('\n🎉 모든 API 테스트가 성공했습니다!');
        
    } catch (error) {
        console.error('❌ API 테스트 실패:');
        if (error.response) {
            console.error('상태 코드:', error.response.status);
            console.error('응답 데이터:', error.response.data);
        } else {
            console.error('오류 메시지:', error.message);
        }
    }
}

// 스크립트 실행
testAPI();
