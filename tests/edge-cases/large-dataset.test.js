/**
 * 대용량 데이터셋 에지 케이스 테스트
 * 시스템의 극단적 상황에서의 성능 및 안정성 테스트
 */
const request = require('supertest');
const app = require('../../backend/app');
const { generateLargeDataset } = require('../utils/testDataGenerator');
const cache = require('../../backend/src/utils/cache');

describe('Large Dataset Tests', () => {
  // 테스트 전 캐시 초기화
  beforeAll(async () => {
    await cache.flush();
  });
  
  // 대용량 데이터 부하 테스트
  test('Should handle large dataset efficiently', async () => {
    // 대량의 테스트 데이터 생성 (1000개 작업, 100개 리소스)
    const { tasks, resources, assignments } = generateLargeDataset(1000, 100);
    
    // 성능 측정 시작
    const startTime = Date.now();
    
    // 최적화 API 호출
    const response = await request(app)
      .post('/api/v1/optimization/workload')
      .send({
        tasks,
        resources,
        assignments,
        constraints: {
          maxWorkloadPerResource: 100,
          priorityLevels: ['Critical', 'High', 'Medium', 'Low']
        }
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);
    
    // 소요 시간 측정
    const duration = Date.now() - startTime;
    
    // 검증
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.optimization).toBeDefined();
    
    // 성능 기준 검증 (5초 이내 처리)
    expect(duration).toBeLessThan(5000);
    
    // 최적화 결과 검증
    const { optimization } = response.body;
    
    // 모든 리소스의 부하가 최대치를 넘지 않는지 확인
    const overloadedResources = optimization.resourceWorkloads.filter(
      rw => rw.totalWorkload > 100
    );
    expect(overloadedResources.length).toBe(0);
    
    // 우선순위가 높은 작업이 우선 할당되었는지 확인
    const criticalTasks = tasks.filter(t => t.priority === 'Critical');
    const criticalTasksInOptimization = optimization.taskAssignments.filter(
      ta => criticalTasks.some(ct => ct.id === ta.taskId)
    );
    
    expect(criticalTasksInOptimization.length).toBe(criticalTasks.length);
  }, 10000); // 테스트 타임아웃 10초

  // 극단적인 시나리오 테스트 - 매우 불균형한 초기 할당
  test('Should handle extremely unbalanced initial workload', async () => {
    // 불균형한 초기 할당 생성 (몇몇 리소스에 과도한 작업 할당)
    const { tasks, resources, assignments } = generateLargeDataset(500, 20, {
      unbalanced: true,
      overloadFactor: 3 // 일부 리소스에 300% 과부하
    });
    
    const response = await request(app)
      .post('/api/v1/optimization/workload')
      .send({
        tasks,
        resources,
        assignments,
        constraints: {
          maxWorkloadPerResource: 100,
          priorityLevels: ['Critical', 'High', 'Medium', 'Low'],
          balancingFactor: 0.8 // 강한 균형화 요구
        }
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);
    
    expect(response.status).toBe(200);
    
    // 부하 분산 검증
    const { optimization } = response.body;
    const workloads = optimization.resourceWorkloads.map(rw => rw.totalWorkload);
    
    // 표준편차 계산
    const mean = workloads.reduce((a, b) => a + b, 0) / workloads.length;
    const variance = workloads.reduce((a, b) => a + (b - mean) ** 2, 0) / workloads.length;
    const stdDev = Math.sqrt(variance);
    
    // 부하 밸런싱 후 표준편차가 충분히 감소했는지 확인
    expect(stdDev).toBeLessThan(mean * 0.3); // 평균의 30% 이내로 표준편차 제한
  }, 10000); // 테스트 타임아웃 10초
  
  // 메모리 누수 테스트 - 연속적인 요청 처리
  test('Should handle continuous requests without memory leaks', async () => {
    // 연속 요청 횟수
    const requestCount = 10;
    
    // 메모리 사용량 측정 함수
    const getMemoryUsage = () => {
      const memoryUsage = process.memoryUsage();
      return {
        rss: memoryUsage.rss / 1024 / 1024, // RSS 메모리 (MB)
        heapTotal: memoryUsage.heapTotal / 1024 / 1024, // 힙 총량 (MB)
        heapUsed: memoryUsage.heapUsed / 1024 / 1024 // 힙 사용량 (MB)
      };
    };
    
    // 초기 메모리 사용량
    const initialMemory = getMemoryUsage();
    
    // 중간 크기 데이터셋
    const { tasks, resources, assignments } = generateLargeDataset(200, 50);
    
    // 연속 요청 실행
    for (let i = 0; i < requestCount; i++) {
      const response = await request(app)
        .post('/api/v1/optimization/workload')
        .send({
          tasks,
          resources,
          assignments,
          constraints: {
            maxWorkloadPerResource: 100,
            priorityLevels: ['Critical', 'High', 'Medium', 'Low']
          }
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`);
      
      expect(response.status).toBe(200);
    }
    
    // 가비지 컬렉션 요청 (정확한 측정을 위해)
    if (global.gc) {
      global.gc();
    }
    
    // 최종 메모리 사용량
    const finalMemory = getMemoryUsage();
    
    // 메모리 사용량 증가율 계산
    const heapGrowthRate = (finalMemory.heapUsed - initialMemory.heapUsed) / initialMemory.heapUsed;
    
    // 허용 가능한 메모리 증가율 (50% 이하)
    expect(heapGrowthRate).toBeLessThan(0.5);
    
    console.log(`
      메모리 사용량 테스트 결과:
      초기: ${initialMemory.heapUsed.toFixed(2)} MB
      최종: ${finalMemory.heapUsed.toFixed(2)} MB
      증가율: ${(heapGrowthRate * 100).toFixed(2)}%
    `);
  }, 20000); // 테스트 타임아웃 20초
  
  // 동시 요청 처리 테스트
  test('Should handle concurrent requests properly', async () => {
    // 동시 요청 수
    const concurrentRequests = 5;
    
    // 작은 데이터셋 준비
    const { tasks, resources, assignments } = generateLargeDataset(100, 20);
    
    // 동시 요청 실행
    const requests = Array(concurrentRequests).fill().map(() => 
      request(app)
        .post('/api/v1/optimization/workload')
        .send({
          tasks,
          resources,
          assignments,
          constraints: {
            maxWorkloadPerResource: 100,
            priorityLevels: ['Critical', 'High', 'Medium', 'Low']
          }
        })
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
    );
    
    // 모든 요청 실행 및 결과 확인
    const responses = await Promise.all(requests);
    
    // 모든 응답이 성공적인지 확인
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    // 모든 응답이 동일한 결과를 반환했는지 확인 (캐싱이 제대로 작동하는지)
    const firstOptimizationId = responses[0].body.optimization.id;
    responses.forEach(response => {
      expect(response.body.optimization.id).toBe(firstOptimizationId);
    });
  }, 15000); // 테스트 타임아웃 15초
});
