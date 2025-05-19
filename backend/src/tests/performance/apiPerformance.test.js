const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const NUM_REQUESTS = 100;

describe('API 성능 테스트', () => {
  test('작업 목록 API 부하 테스트', async () => {
    const startTime = performance.now();
    const requests = [];
    
    for (let i = 0; i < NUM_REQUESTS; i++) {
      requests.push(axios.get(`${BASE_URL}/tasks`));
    }
    
    await Promise.all(requests);
    const endTime = performance.now();
    
    const totalTime = endTime - startTime;
    const avgTime = totalTime / NUM_REQUESTS;
    
    console.log(`총 ${NUM_REQUESTS}개 요청 처리 시간: ${totalTime}ms`);
    console.log(`요청 당 평균 처리 시간: ${avgTime}ms`);
    
    // 평균 처리 시간이 50ms 이하여야 함
    expect(avgTime).toBeLessThan(50);
  });
  
  test('부하 최적화 알고리즘 성능 테스트', async () => {
    const testData = {
      tasks: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `작업 ${i + 1}`,
        duration: Math.floor(Math.random() * 10) + 1,
        dependencies: [],
        assignedTo: Math.floor(Math.random() * 10) + 1
      })),
      resources: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `리소스 ${i + 1}`,
        capacity: 100
      }))
    };
    
    const startTime = performance.now();
    
    const response = await axios.post(`${BASE_URL}/optimization/workload`, testData);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    
    console.log(`부하 최적화 처리 시간: ${processingTime}ms`);
    
    // 대규모 데이터 최적화 처리가 2초 이내에 완료되어야 함
    expect(processingTime).toBeLessThan(2000);
    expect(response.data).toHaveProperty('optimizedWorkload');
  });

  test('대시보드 데이터 로딩 성능 테스트', async () => {
    const startTime = performance.now();
    
    const response = await axios.get(`${BASE_URL}/dashboard/summary`);
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`대시보드 데이터 로딩 시간: ${loadTime}ms`);
    
    // 대시보드 데이터 로딩이 200ms 이내에 완료되어야 함
    expect(loadTime).toBeLessThan(200);
    expect(response.data).toHaveProperty('workloadSummary');
    expect(response.data).toHaveProperty('resourceUtilization');
  });

  test('간트 차트 데이터 로딩 성능 테스트', async () => {
    // 대규모 프로젝트 시뮬레이션 (500개 작업)
    const startTime = performance.now();
    
    const response = await axios.get(`${BASE_URL}/gantt?limit=500`);
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    console.log(`간트 차트 대규모 데이터(500개 작업) 로딩 시간: ${loadTime}ms`);
    
    // 대규모 간트 차트 데이터 로딩이 500ms 이내에 완료되어야 함
    expect(loadTime).toBeLessThan(500);
    expect(response.data.tasks.length).toBeGreaterThanOrEqual(500);
  });
});
