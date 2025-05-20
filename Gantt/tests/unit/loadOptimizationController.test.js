/**
 * Load Optimization Controller 단위 테스트
 */
const loadOptimizationController = require('../../backend/src/controllers/loadOptimizationController');
const loadOptimizationService = require('../../backend/src/services/loadOptimizationService');
const { handleError } = require('../../backend/src/utils/errorHandler');

// 모듈 모킹
jest.mock('../../backend/src/services/loadOptimizationService');
jest.mock('../../backend/src/utils/errorHandler');
jest.mock('../../backend/src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Load Optimization Controller', () => {
  // 테스트 전에 모든 mock 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Mock 응답 객체 생성 함수
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  // getLoadData 메서드 테스트
  describe('getLoadData', () => {
    it('부하 데이터를 정상적으로 조회하고 반환해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        query: {
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          projectId: 'project-1',
          teamId: 'team-1'
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      const mockLoadData = {
        resourceLoads: [],
        systemLoadByDate: []
      };
      loadOptimizationService.getLoadData.mockResolvedValue(mockLoadData);
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.getLoadData(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.getLoadData).toHaveBeenCalledWith(
        mockReq.query.startDate,
        mockReq.query.endDate,
        mockReq.query.projectId,
        mockReq.query.teamId
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockLoadData
      });
    });
    
    it('에러 발생 시 handleError를 호출해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        query: {
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      };
      const mockRes = mockResponse();
      
      // 서비스에서 에러 발생시키기
      const mockError = new Error('서비스 오류');
      loadOptimizationService.getLoadData.mockRejectedValue(mockError);
      
      // handleError Mock 구현
      handleError.mockImplementation((res, error) => {
        return res.status(500).json({
          success: false,
          message: error.message
        });
      });
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.getLoadData(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.getLoadData).toHaveBeenCalled();
      expect(handleError).toHaveBeenCalledWith(mockRes, mockError);
    });
  });

  // getResourceLoad 메서드 테스트
  describe('getResourceLoad', () => {
    it('리소스별 부하 데이터를 정상적으로 조회하고 반환해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        query: {
          resourceIds: 'resource-1,resource-2',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      const mockResourceLoadData = [
        { resourceId: 'resource-1', loadByDate: [] },
        { resourceId: 'resource-2', loadByDate: [] }
      ];
      loadOptimizationService.getResourceLoad.mockResolvedValue(mockResourceLoadData);
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.getResourceLoad(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.getResourceLoad).toHaveBeenCalledWith(
        ['resource-1', 'resource-2'],
        mockReq.query.startDate,
        mockReq.query.endDate
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResourceLoadData
      });
    });
    
    it('resourceIds가 지정되지 않은 경우에도 정상적으로 처리해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        query: {
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      const mockResourceLoadData = [];
      loadOptimizationService.getResourceLoad.mockResolvedValue(mockResourceLoadData);
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.getResourceLoad(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.getResourceLoad).toHaveBeenCalledWith(
        null,
        mockReq.query.startDate,
        mockReq.query.endDate
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // getLoadOptimizationRecommendations 메서드 테스트
  describe('getLoadOptimizationRecommendations', () => {
    it('부하 최적화 추천 사항을 정상적으로 반환해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        query: {
          projectId: 'project-1',
          teamId: 'team-1',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          threshold: '85'
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      const mockRecommendations = {
        optimizationId: 'opt-1',
        overloadedResources: [],
        underutilizedResources: [],
        recommendations: []
      };
      loadOptimizationService.getLoadOptimizationRecommendations.mockResolvedValue(mockRecommendations);
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.getLoadOptimizationRecommendations(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.getLoadOptimizationRecommendations).toHaveBeenCalledWith(
        mockReq.query.projectId,
        mockReq.query.teamId,
        mockReq.query.startDate,
        mockReq.query.endDate,
        85 // 문자열이 숫자로 변환됨
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecommendations
      });
    });
    
    it('threshold가 지정되지 않은 경우 기본값 80을 사용해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        query: {
          projectId: 'project-1',
          teamId: 'team-1',
          startDate: '2025-01-01',
          endDate: '2025-01-31'
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      loadOptimizationService.getLoadOptimizationRecommendations.mockResolvedValue({});
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.getLoadOptimizationRecommendations(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.getLoadOptimizationRecommendations).toHaveBeenCalledWith(
        mockReq.query.projectId,
        mockReq.query.teamId,
        mockReq.query.startDate,
        mockReq.query.endDate,
        80 // 기본값
      );
    });
  });

  // autoDistributeTasks 메서드 테스트
  describe('autoDistributeTasks', () => {
    it('작업 자동 재분배 계획을 정상적으로 처리해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        body: {
          projectId: 'project-1',
          tasks: [{ id: 'task-1' }, { id: 'task-2' }],
          resources: [{ id: 'resource-1' }, { id: 'resource-2' }],
          constraints: { fixedAssignments: [] }
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      const mockRedistributionResult = {
        redistributionId: 'redistribution-1',
        plan: [],
        analysis: {}
      };
      loadOptimizationService.autoDistributeTasks.mockResolvedValue(mockRedistributionResult);
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.autoDistributeTasks(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.autoDistributeTasks).toHaveBeenCalledWith(
        mockReq.body.projectId,
        mockReq.body.tasks,
        mockReq.body.resources,
        mockReq.body.constraints
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockRedistributionResult
      });
    });
  });

  // applyLoadOptimization 메서드 테스트
  describe('applyLoadOptimization', () => {
    it('부하 최적화를 성공적으로 적용해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        body: {
          optimizationId: 'opt-1',
          modifications: [{ taskId: 'task-1', newResourceId: 'resource-2' }]
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      const mockResult = {
        appliedOptimizationId: 'applied-opt-1',
        modifications: mockReq.body.modifications,
        postOptimizationLoad: {}
      };
      loadOptimizationService.applyLoadOptimization.mockResolvedValue(mockResult);
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.applyLoadOptimization(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.applyLoadOptimization).toHaveBeenCalledWith(
        mockReq.body.optimizationId,
        mockReq.body.modifications
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });
  });

  // predictFutureLoad 메서드 테스트
  describe('predictFutureLoad', () => {
    it('미래 부하 예측을 정상적으로 처리해야 함', async () => {
      // Mock 데이터 설정
      const mockReq = {
        body: {
          projectId: 'project-1',
          teamId: 'team-1',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          newTasks: [{ id: 'new-task-1' }]
        }
      };
      const mockRes = mockResponse();
      
      // 서비스 Mock 구현
      const mockPrediction = {
        predictionId: 'prediction-1',
        currentLoad: {},
        predictedLoad: {},
        difference: {}
      };
      loadOptimizationService.predictFutureLoad.mockResolvedValue(mockPrediction);
      
      // 컨트롤러 함수 실행
      await loadOptimizationController.predictFutureLoad(mockReq, mockRes);
      
      // 검증
      expect(loadOptimizationService.predictFutureLoad).toHaveBeenCalledWith(
        mockReq.body.projectId,
        mockReq.body.teamId,
        mockReq.body.startDate,
        mockReq.body.endDate,
        mockReq.body.newTasks
      );
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockPrediction
      });
    });
  });
});
