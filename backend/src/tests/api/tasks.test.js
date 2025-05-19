const request = require('supertest');
const app = require('../../../app');

describe('작업 API 통합 테스트', () => {
  let taskId;
  
  test('작업 목록 조회', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('새 작업 생성', async () => {
    const newTask = {
      name: '통합 테스트 작업',
      description: '통합 테스트를 위한 새 작업',
      startDate: '2025-05-20',
      endDate: '2025-05-30',
      status: '대기중',
      priority: '중간',
      assignedTo: 1,
      dependencies: []
    };
    
    const response = await request(app)
      .post('/api/tasks')
      .send(newTask)
      .expect('Content-Type', /json/)
      .expect(201);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe(newTask.name);
    
    taskId = response.body.data.id;
  });
  
  test('작업 조회', async () => {
    if (!taskId) {
      throw new Error('이전 테스트에서 작업 ID를 가져오지 못했습니다.');
    }
    
    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.id).toBe(taskId);
  });
  
  test('작업 업데이트', async () => {
    if (!taskId) {
      throw new Error('이전 테스트에서 작업 ID를 가져오지 못했습니다.');
    }
    
    const updates = {
      status: '진행중',
      completed: 20
    };
    
    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send(updates)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.status).toBe(updates.status);
    expect(response.body.data.completed).toBe(updates.completed);
  });
  
  test('작업 삭제', async () => {
    if (!taskId) {
      throw new Error('이전 테스트에서 작업 ID를 가져오지 못했습니다.');
    }
    
    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .expect(204);
    
    // 삭제된 작업이 조회되지 않는지 확인
    await request(app)
      .get(`/api/tasks/${taskId}`)
      .expect(404);
  });
});

describe('부하 최적화 API 통합 테스트', () => {
  test('부하 최적화 실행', async () => {
    const optimizationParams = {
      startDate: '2025-05-01',
      endDate: '2025-06-01',
      resourceIds: [1, 2, 3]
    };
    
    const response = await request(app)
      .post('/api/optimization/workload')
      .send(optimizationParams)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('optimizedWorkload');
    expect(response.body.data).toHaveProperty('before');
    expect(response.body.data).toHaveProperty('after');
    
    // 최적화 후 표준편차가 감소했는지 확인
    expect(response.body.data.after.stdDeviation).toBeLessThan(
      response.body.data.before.stdDeviation
    );
  });
});

describe('리소스 API 통합 테스트', () => {
  let resourceId;
  
  test('리소스 목록 조회', async () => {
    const response = await request(app)
      .get('/api/resources')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('새 리소스 생성', async () => {
    const newResource = {
      name: '테스트 팀',
      capacity: 85
    };
    
    const response = await request(app)
      .post('/api/resources')
      .send(newResource)
      .expect('Content-Type', /json/)
      .expect(201);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe(newResource.name);
    
    resourceId = response.body.data.id;
  });
  
  test('리소스 조회', async () => {
    if (!resourceId) {
      throw new Error('이전 테스트에서 리소스 ID를 가져오지 못했습니다.');
    }
    
    const response = await request(app)
      .get(`/api/resources/${resourceId}`)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.id).toBe(resourceId);
  });
  
  test('리소스 업데이트', async () => {
    if (!resourceId) {
      throw new Error('이전 테스트에서 리소스 ID를 가져오지 못했습니다.');
    }
    
    const updates = {
      capacity: 95
    };
    
    const response = await request(app)
      .put(`/api/resources/${resourceId}`)
      .send(updates)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.capacity).toBe(updates.capacity);
  });
  
  test('리소스 삭제', async () => {
    if (!resourceId) {
      throw new Error('이전 테스트에서 리소스 ID를 가져오지 못했습니다.');
    }
    
    await request(app)
      .delete(`/api/resources/${resourceId}`)
      .expect(204);
    
    // 삭제된 리소스가 조회되지 않는지 확인
    await request(app)
      .get(`/api/resources/${resourceId}`)
      .expect(404);
  });
});
