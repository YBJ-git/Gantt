/**
 * PostgreSQL 데이터베이스 상태 확인 및 실제 데이터 테스트
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

async function testDatabaseStatus() {
  try {
    console.log('\n📊 데이터베이스 상태 확인...');
    const response = await axios.get(`${BASE_URL}/api/health/database`);
    
    console.log('✅ 데이터베이스 연결 상태:', response.data.status);
    console.log('📈 데이터베이스 통계:');
    
    if (response.data.statistics) {
      const stats = response.data.statistics;
      console.log(`   총 테이블 수: ${stats.totalTables}`);
      console.log(`   총 레코드 수: ${stats.totalRecords}`);
      
      console.log('\n📋 테이블별 상세 정보:');
      stats.tables.forEach(table => {
        console.log(`   ${table.name}: ${table.records}개 레코드 (${table.columns}개 컬럼)`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 상태 확인 실패:', error.message);
    return false;
  }
}

async function testDashboardData() {
  try {
    console.log('\n📊 실제 대시보드 데이터 확인...');
    const response = await axios.get(`${BASE_URL}/api/dashboard/data`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = response.data.data;
    
    console.log('✅ 대시보드 데이터 확인:');
    console.log(`   전체 부하율: ${data.overallLoad}%`);
    console.log(`   리소스 수: ${data.resourcesCount}명`);
    console.log(`   활성 작업 수: ${data.tasksCount}개`);
    console.log(`   임계치 초과 리소스: ${data.criticalTasks}명`);
    console.log(`   지연 작업: ${data.overdueTasksCount}개`);
    console.log(`   다가오는 마감일: ${data.upcomingDeadlinesCount}개`);
    
    console.log('\n👥 가장 부하가 높은 리소스:');
    data.mostLoadedResources.forEach(resource => {
      console.log(`   ${resource.name} (${resource.department}): ${resource.utilization}%`);
    });
    
    console.log('\n👤 부하가 낮은 리소스:');
    data.leastLoadedResources.forEach(resource => {
      console.log(`   ${resource.name} (${resource.department}): ${resource.utilization}%`);
    });
    
    console.log('\n📅 다가오는 마감일:');
    data.upcomingDeadlines.forEach(task => {
      console.log(`   ${task.name} (${task.resourceName}) - ${task.deadline}`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ 대시보드 데이터 확인 실패:', error.message);
    return false;
  }
}

async function testOtherAPIs() {
  try {
    console.log('\n🔧 다른 API들 데이터 확인...');
    
    // 사용자 목록 확인
    const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`👥 사용자: ${usersResponse.data.count}명 등록됨`);
    
    // 역할 확인  
    const rolesResponse = await axios.get(`${BASE_URL}/api/roles`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`🎭 역할: ${rolesResponse.data.roles.length}개 역할 정의됨`);
    rolesResponse.data.roles.forEach(role => {
      console.log(`   ${role.display_name} (${role.name})`);
    });
    
    // 알림 확인
    const notificationsResponse = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    console.log(`🔔 알림: ${notificationsResponse.data.data.length}개 알림`);
    console.log(`   읽지 않은 알림: ${notificationsResponse.data.unreadCount}개`);
    
    return true;
  } catch (error) {
    console.error('❌ API 테스트 실패:', error.message);
    return false;
  }
}

async function runDatabaseTests() {
  console.log('🚀 PostgreSQL 데이터베이스 연동 테스트 시작');
  console.log(`📡 대상 URL: ${BASE_URL}`);
  
  try {
    // 로그인
    await login();
    
    // 데이터베이스 상태 확인
    const dbStatus = await testDatabaseStatus();
    
    // 대시보드 실제 데이터 확인
    const dashboardStatus = await testDashboardData();
    
    // 다른 API들 확인
    const apiStatus = await testOtherAPIs();
    
    console.log('\n📊 테스트 결과 요약:');
    console.log(`   데이터베이스 연결: ${dbStatus ? '✅ 성공' : '❌ 실패'}`);
    console.log(`   대시보드 데이터: ${dashboardStatus ? '✅ 성공' : '❌ 실패'}`);
    console.log(`   API 동작: ${apiStatus ? '✅ 성공' : '❌ 실패'}`);
    
    if (dbStatus && dashboardStatus && apiStatus) {
      console.log('\n🎉 PostgreSQL 데이터베이스 연동 완전 성공!');
      console.log('✅ 실제 데이터가 정상적으로 로드되고 있습니다.');
    } else {
      console.log('\n⚠️ 일부 테스트가 실패했습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  }
}

// 테스트 실행
runDatabaseTests().catch(console.error);
