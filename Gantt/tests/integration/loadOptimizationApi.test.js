/**
 * Load Optimization API 통합 테스트
 */
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const loadOptimizationController = require('../../backend/src/controllers/loadOptimizationController');
const loadOptimizationService = require('../../backend/src/services/loadOptimizationService');

// 모듈 모킹
jest.mock('../../backend/src/services/loadOptimizationService');
jest.mock('../../backend/src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Load Optimization API Integration Tests', () => {
  let app;
  
  // 테스트용 Express 앱 설정
  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    
    // 부하 최적화 API 엔드포인트 설정
    app.get('/api/loadOptimization/data', loadOptimizationController.getLoadData);
    app.get('/api/loadOptimization/resource', loadOptimizationController.getResourceLoad);
    app.get('/api/loadOptimization/recommendations', loadOptimizationController.getLoadOptimizationRecommendations);
    app.post('/api/loadOptimization/autoDistribute', loadOptimizationController.autoDistributeTasks);
    app.post('/api/loadOptimization/apply', loadOptimizationController.applyLoadOptimization);
    app.post('/api/loadOptimization/predict', loadOptimizationController.predictFutureLoad);
  });
  
  // 테스트 전에 모든 mock 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/loadOptimization/data', () => {
    it('부하 데이터를 성공적으로 조회해야 함', async () => {
      // Mock 응답 설정
      const mockLoadData = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        resourceLoads: [],
        systemLoadByDate: []
      };
      loadOptimizationService.getLoadData.mockResolvedValue(mockLoadData);
      
      // API 요청
      const response = await request(app)
        .get('/api/loadOptimization/data')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          projectId: 'project-1',
          teamId: 'team-1'
        });
      
      // 검증
      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toEqual(mockLoadData);
      
      // 서비스 호출 검증
      expect(loadOptimizationService.getLoadData).toHaveBeenCalledWith(
        '2025-01-01',
        '2025-01-31',
        'project-1',
        'team-1'
      );
    });
    
    it('에러 발생 시 적절한 오류 응답을 반환해야 함', async () => {
      // 서비스에서 에러 발생시키기
      loadOptimizationService.getLoadData.mockRejectedValue(new Error('서비스 오류'));
      
      // API 요청
      const response = await request(app)
        .get('/api/loadOptimization/data')
        .query({
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        });
      
      // 검증
      expect(response.status).toBe(500);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('GET /api/loadOptimization/resource', () => {
    it('리소스별 부하 데이터를 성공적으로 조회해야 함', async () => {
      // Mock 응답 설정
      const mockResourceLoadData = [
        { resourceId: 'resource-1', resourceName: '리소스 1', loadByDate: [] },
        { resourceId: 'resource-2', resourceName: '리소스 2', loadByDate: [] }
      ];
      loadOptimizationService.getResourceLoad.mockResolvedValue(mockResourceLoadData);
      
      // API 요청
      const response = await request(app)
        .get('/api/loadOptimization/resource')
        .query({
          resourceIds: 'resource-1,resource-2',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        });
      
      // 검증
      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toEqual(mockResourceLoadData);
      
      // 서비스 호출 검증
      expect(loadOptimizationService.getResourceLoad).toHaveBeenCalledWith(
        ['resource-1', 'resource-2'],
        '2025-01-01',
        '2025-01-31'
      );
    });
  });

  describe('GET /api/loadOptimization/recommendations', () => {
    it('부하 최적화 추천 사항을 성공적으로 조회해야 함', async () => {
      // Mock 응답 설정
      const mockRecommendations = {
        optimizationId: 'opt-1',
        overloadedResources: [],
        underutilizedResources: [],
        recommendations: []
      };
      loadOptimizationService.getLoadOptimizationRecommendations.mockResolvedValue(mockRecommendations);
      
      // API 요청
      const response = await request(app)
        .get('/api/loadOptimization/recommendations')
        .query({
          projectId: 'project-1',
          teamId: 'team-1',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          threshold: '85'
        });
      
      // 검증
      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toEqual(mockRecommendations);
      
      // 서비스 호출 검증
      expect(loadOptimizationService.getLoadOptimizationRecommendations).toHaveBeenCalledWith(
        'project-1',
        'team-1',
        '2025-01-01',
        '2025-01-31',
        85
      );
    });
  });

  describe('POST /api/loadOptimization/autoDistribute', () => {
    it('작업 자동 재분배 계획을 성공적으로 생성해야 함', async () => {
      // Mock 요청 데이터
      const mockRequestBody = {
        projectId: 'project-1',
        tasks: [
          { id: 'task-1', name: '작업 1' },
          { id: 'task-2', name: '작업 2' }
        ],
        resources: [
          { id: 'resource-1', name: '리소스 1' },
          { id: 'resource-2', name: '리소스 2' }
        ],
        constraints: {
          fixedAssignments: [
            { taskId: 'task-1', resourceId: 'resource-1' }
          ]
        }
      };
      
      // Mock 응답 설정
      const mockRedistributionResult = {
        redistributionId: 'redistribution-1',
        plan: [],
        analysis: {}
      };
      loadOptimizationService.autoDistributeTasks.mockResolvedValue(mockRedistributionResult);
      
      // API 요청
      const response = await request(app)
        .post('/api/loadOptimization/autoDistribute')
        .send(mockRequestBody);
      
      // 검증
      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toEqual(mockRedistributionResult);
      
      // 서비스 호출 검증
      expect(loadOptimizationService.autoDistributeTasks).toHaveBeenCalledWith(
        mockRequestBody.projectId,
        mockRequestBody.tasks,
        mockRequestBody.resources,
        mockRequestBody.constraints
      );
    });
  });

  describe('POST /api/loadOptimization/apply', () => {
    it('부하 최적화를 성공적으로 적용해야 함', async () => {
      // Mock 요청 데이터
      const mockRequestBody = {
        optimizationId: 'opt-1',
        modifications: [
          { taskId: 'task-1', newResourceId: 'resource-2' }
        ]
      };
      
      // Mock 응답 설정
      const mockResult = {
        appliedOptimizationId: 'applied-opt-1',
        modifications: mockRequestBody.modifications,
        postOptimizationLoad: {}
      };
      loadOptimizationService.applyLoadOptimization.mockResolvedValue(mockResult);
      
      // API 요청
      const response = await request(app)
        .post('/api/loadOptimization/apply')
        .send(mockRequestBody);
      
      // 검증
      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toEqual(mockResult);
      
      // 서비스 호출 검증
      expect(loadOptimizationService.applyLoadOptimization).toHaveBeenCalledWith(
        mockRequestBody.optimizationId,
        mockRequestBody.modifications
      );
    });
  });

  describe('POST /api/loadOptimization/predict', () => {
    it('미래 부하 예측을 성공적으로 수행해야 함', async () => {
      // Mock 요청 데이터
      const mockRequestBody = {
        projectId: 'project-1',
        teamId: 'team-1',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        newTasks: [
          {
            id: 'new-task-1',
            name: '새 작업 1',
            startDate: '2025-01-15',
            endDate: '2025-01-20',
            effort: 30,
            resourceId: 'resource-1'
          }
        ]
      };
      
      // Mock 응답 설정
      const mockPrediction = {
        predictionId: 'prediction-1',
        currentLoad: {},
        predictedLoad: {},
        difference: {}
      };
      loadOptimizationService.predictFutureLoad.mockResolvedValue(mockPrediction);
      
      // API 요청
      const response = await request(app)
        .post('/api/loadOptimization/predict')
        .send(mockRequestBody);
      
      // 검증
      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data).toEqual(mockPrediction);
      
      // 서비스 호출 검증
      expect(loadOptimizationService.predictFutureLoad).toHaveBeenCalledWith(
        mockRequestBody.projectId,
        mockRequestBody.teamId,
        mockRequestBody.startDate,
        mockRequestBody.endDate,
        mockRequestBody.newTasks
      );
    });
  });
});
