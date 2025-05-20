/**
 * Load Optimization Service 단위 테스트
 */
const loadOptimizationService = require('../../backend/src/services/loadOptimizationService');
const loadOptimizationRepository = require('../../backend/src/repositories/loadOptimizationRepository');
const resourceRepository = require('../../backend/src/repositories/resourceRepository');
const taskRepository = require('../../backend/src/repositories/taskRepository');

// 모듈 모킹
jest.mock('../../backend/src/repositories/loadOptimizationRepository');
jest.mock('../../backend/src/repositories/resourceRepository');
jest.mock('../../backend/src/repositories/taskRepository');
jest.mock('../../backend/src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Load Optimization Service', () => {
  // 테스트 전에 모든 mock 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLoadData', () => {
    it('기간 내 작업과 리소스 부하 데이터를 정상적으로 조회해야 함', async () => {
      // Mock 데이터 설정
      const mockStartDate = '2025-01-01';
      const mockEndDate = '2025-01-31';
      const mockProjectId = 'project-1';
      const mockTeamId = 'team-1';
      
      const mockTasks = [
        { 
          id: 'task-1', 
          name: '작업 1', 
          startDate: '2025-01-05', 
          endDate: '2025-01-10', 
          effort: 40, 
          resourceId: 'resource-1' 
        },
        { 
          id: 'task-2', 
          name: '작업 2', 
          startDate: '2025-01-15', 
          endDate: '2025-01-20', 
          effort: 30, 
          resourceId: 'resource-2' 
        }
      ];
      
      const mockResources = [
        { 
          id: 'resource-1', 
          name: '리소스 1', 
          type: 'DEVELOPER', 
          capacity: 8, 
          dailyCapacity: 8 
        },
        { 
          id: 'resource-2', 
          name: '리소스 2', 
          type: 'DESIGNER', 
          capacity: 8, 
          dailyCapacity: 8 
        }
      ];
      
      // Repository Mock 구현
      taskRepository.getTasksByDateRange = jest.fn().mockResolvedValue(mockTasks);
      resourceRepository.getResourcesByIds = jest.fn().mockResolvedValue(mockResources);
      
      // 함수 실행
      const result = await loadOptimizationService.getLoadData(
        mockStartDate, 
        mockEndDate, 
        mockProjectId, 
        mockTeamId
      );
      
      // 검증
      expect(taskRepository.getTasksByDateRange).toHaveBeenCalledWith(
        mockStartDate, 
        mockEndDate, 
        mockProjectId, 
        mockTeamId
      );
      
      expect(resourceRepository.getResourcesByIds).toHaveBeenCalledWith(
        ['resource-1', 'resource-2']
      );
      
      // 결과 검증
      expect(result).toBeDefined();
      expect(result.startDate).toBe(mockStartDate);
      expect(result.endDate).toBe(mockEndDate);
      expect(result.resourceLoads).toHaveLength(2);
      expect(result.systemLoadByDate).toBeDefined();
      
      // 리소스 부하 데이터 검증
      const resource1Load = result.resourceLoads.find(r => r.resourceId === 'resource-1');
      expect(resource1Load).toBeDefined();
      expect(resource1Load.resourceName).toBe('리소스 1');
      expect(resource1Load.loadByDate).toBeDefined();
      
      // 시스템 부하 데이터 검증
      expect(result.systemLoadByDate.length).toBeGreaterThan(0);
    });
    
    it('날짜 범위가 지정되지 않았을 때 기본값으로 설정되어야 함', async () => {
      // Mock 데이터 설정
      const mockProjectId = 'project-1';
      const mockTeamId = 'team-1';
      
      // 빈 작업 및 리소스 반환
      taskRepository.getTasksByDateRange = jest.fn().mockResolvedValue([]);
      resourceRepository.getResourcesByIds = jest.fn().mockResolvedValue([]);
      
      // 함수 실행
      const result = await loadOptimizationService.getLoadData(
        null, 
        null, 
        mockProjectId, 
        mockTeamId
      );
      
      // 검증
      expect(taskRepository.getTasksByDateRange).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.startDate).toBeDefined();
      expect(result.endDate).toBeDefined();
      expect(result.resourceLoads).toHaveLength(0);
      expect(result.systemLoadByDate).toBeDefined();
    });
    
    it('에러 발생 시 적절히 처리해야 함', async () => {
      // Repository Mock에서 에러 발생시키기
      taskRepository.getTasksByDateRange = jest.fn().mockRejectedValue(
        new Error('데이터베이스 연결 오류')
      );
      
      // 함수 실행 및 에러 검증
      await expect(loadOptimizationService.getLoadData(
        '2025-01-01', 
        '2025-01-31', 
        'project-1', 
        'team-1'
      )).rejects.toThrow('데이터베이스 연결 오류');
    });
  });

  describe('getResourceLoad', () => {
    it('리소스 ID가 지정된 경우 해당 리소스의 부하를 조회해야 함', async () => {
      // Mock 데이터 설정
      const mockResourceIds = ['resource-1', 'resource-2'];
      const mockStartDate = '2025-01-01';
      const mockEndDate = '2025-01-31';
      
      const mockResources = [
        { 
          id: 'resource-1', 
          name: '리소스 1', 
          type: 'DEVELOPER', 
          capacity: 8 
        },
        { 
          id: 'resource-2', 
          name: '리소스 2', 
          type: 'DESIGNER', 
          capacity: 8 
        }
      ];
      
      const mockTasks = [
        { 
          id: 'task-1', 
          resourceId: 'resource-1', 
          startDate: '2025-01-05', 
          endDate: '2025-01-10', 
          effort: 40 
        }
      ];
      
      // Repository Mock 구현
      resourceRepository.getResourcesByIds = jest.fn().mockResolvedValue(mockResources);
      taskRepository.getTasksByResourceIds = jest.fn().mockResolvedValue(mockTasks);
      
      // 함수 실행
      const result = await loadOptimizationService.getResourceLoad(
        mockResourceIds, 
        mockStartDate, 
        mockEndDate
      );
      
      // 검증
      expect(resourceRepository.getResourcesByIds).toHaveBeenCalledWith(mockResourceIds);
      expect(taskRepository.getTasksByResourceIds).toHaveBeenCalledWith(
        mockResourceIds, 
        mockStartDate, 
        mockEndDate
      );
      
      // 결과 검증
      expect(result).toHaveLength(2);
      expect(result[0].resourceId).toBe('resource-1');
      expect(result[0].resourceName).toBe('리소스 1');
      expect(result[0].loadByDate).toBeDefined();
    });
    
    it('리소스 ID가 지정되지 않은 경우 모든 활성 리소스의 부하를 조회해야 함', async () => {
      // Mock 데이터 설정
      const mockStartDate = '2025-01-01';
      const mockEndDate = '2025-01-31';
      
      const mockResources = [
        { 
          id: 'resource-1', 
          name: '리소스 1', 
          type: 'DEVELOPER', 
          capacity: 8 
        },
        { 
          id: 'resource-2', 
          name: '리소스 2', 
          type: 'DESIGNER', 
          capacity: 8 
        }
      ];
      
      const mockTasks = [];
      
      // Repository Mock 구현
      resourceRepository.getAllActiveResources = jest.fn().mockResolvedValue(mockResources);
      taskRepository.getTasksByResourceIds = jest.fn().mockResolvedValue(mockTasks);
      
      // 함수 실행
      const result = await loadOptimizationService.getResourceLoad(
        null, 
        mockStartDate, 
        mockEndDate
      );
      
      // 검증
      expect(resourceRepository.getAllActiveResources).toHaveBeenCalled();
      expect(taskRepository.getTasksByResourceIds).toHaveBeenCalled();
      
      // 결과 검증
      expect(result).toHaveLength(2);
    });
  });

  describe('getLoadOptimizationRecommendations', () => {
    it('부하 최적화 추천 사항을 정상적으로 생성해야 함', async () => {
      // Mock 데이터 설정
      const mockProjectId = 'project-1';
      const mockTeamId = 'team-1';
      const mockStartDate = '2025-01-01';
      const mockEndDate = '2025-01-31';
      const mockThreshold = 80;
      
      // getLoadData의 결과를 모킹
      const mockLoadData = {
        startDate: mockStartDate,
        endDate: mockEndDate,
        resourceLoads: [
          {
            resourceId: 'resource-1',
            resourceName: '리소스 1',
            resourceType: 'DEVELOPER',
            capacity: 8,
            avgLoad: 90,
            maxLoad: 110,
            loadByDate: [
              {
                date: '2025-01-05',
                tasks: ['task-1', 'task-2'],
                workHours: 9,
                capacity: 8,
                load: 110
              }
            ]
          },
          {
            resourceId: 'resource-2',
            resourceName: '리소스 2',
            resourceType: 'DEVELOPER',
            capacity: 8,
            avgLoad: 30,
            maxLoad: 40,
            loadByDate: [
              {
                date: '2025-01-05',
                tasks: [],
                workHours: 3,
                capacity: 8,
                load: 40
              }
            ]
          }
        ],
        systemLoadByDate: []
      };
      
      // 이동 가능한 작업 데이터
      const mockMovableTasks = [
        {
          id: 'task-1',
          name: '작업 1',
          priority: 'MEDIUM',
          effort: 5,
          requiredSkills: [],
          resourceId: 'resource-1',
          resourceName: '리소스 1',
          overloadDate: '2025-01-05'
        }
      ];
      
      // taskRepository.getTasksByIds Mock 구현
      taskRepository.getTasksByIds = jest.fn().mockResolvedValue([
        {
          id: 'task-1',
          name: '작업 1',
          priority: 'MEDIUM',
          effort: 5,
          requiredSkills: [],
          isFixed: false
        },
        {
          id: 'task-2',
          name: '작업 2',
          priority: 'HIGH',
          effort: 4,
          requiredSkills: [],
          isFixed: false
        }
      ]);
      
      // 최적화 추천 사항 ID Mock
      const mockOptimizationId = 'opt-1';
      loadOptimizationRepository.saveOptimizationRecommendations = jest.fn().mockResolvedValue(mockOptimizationId);
      
      // getLoadData Mock
      jest.spyOn(loadOptimizationService, 'getLoadData').mockResolvedValue(mockLoadData);
      
      // 함수 실행
      const result = await loadOptimizationService.getLoadOptimizationRecommendations(
        mockProjectId,
        mockTeamId,
        mockStartDate,
        mockEndDate,
        mockThreshold
      );
      
      // 검증
      expect(loadOptimizationService.getLoadData).toHaveBeenCalledWith(
        mockStartDate, 
        mockEndDate, 
        mockProjectId, 
        mockTeamId
      );
      
      expect(loadOptimizationRepository.saveOptimizationRecommendations).toHaveBeenCalled();
      
      // 결과 검증
      expect(result).toBeDefined();
      expect(result.optimizationId).toBe(mockOptimizationId);
      expect(result.overloadedResources).toBeDefined();
      expect(result.underutilizedResources).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });

  // autoDistributeTasks 메서드 단위 테스트
  describe('autoDistributeTasks', () => {
    it('작업 자동 재분배 계획을 정상적으로 생성해야 함', async () => {
      // Mock 데이터 설정
      const mockProjectId = 'project-1';
      const mockTasks = [
        { 
          id: 'task-1', 
          name: '작업 1', 
          priority: 'HIGH', 
          effort: 20, 
          resourceType: 'DEVELOPER' 
        },
        { 
          id: 'task-2', 
          name: '작업 2', 
          priority: 'MEDIUM', 
          effort: 15, 
          resourceType: 'DESIGNER' 
        }
      ];
      
      const mockResources = [
        { 
          id: 'resource-1', 
          name: '리소스 1', 
          type: 'DEVELOPER', 
          capacity: 8, 
          skills: ['skill-1', 'skill-2'] 
        },
        { 
          id: 'resource-2', 
          name: '리소스 2', 
          type: 'DESIGNER', 
          capacity: 8, 
          skills: ['skill-3'] 
        }
      ];
      
      const mockConstraints = {
        fixedAssignments: [
          { taskId: 'task-1', resourceId: 'resource-1' }
        ]
      };
      
      // 재분배 계획 ID Mock
      const mockRedistributionId = 'redistribution-1';
      loadOptimizationRepository.saveRedistributionPlan = jest.fn().mockResolvedValue(mockRedistributionId);
      
      // 함수 실행
      const result = await loadOptimizationService.autoDistributeTasks(
        mockProjectId,
        mockTasks,
        mockResources,
        mockConstraints
      );
      
      // 검증
      expect(loadOptimizationRepository.saveRedistributionPlan).toHaveBeenCalled();
      
      // 결과 검증
      expect(result).toBeDefined();
      expect(result.redistributionId).toBe(mockRedistributionId);
      expect(result.plan).toBeDefined();
      expect(result.analysis).toBeDefined();
      
      // 재분배 계획에 예상되는 작업 및 리소스 할당 확인
      expect(result.plan.some(item => item.taskId === 'task-1' && item.resourceId === 'resource-1')).toBeTruthy();
      expect(result.plan.some(item => item.taskId === 'task-2')).toBeTruthy();
    });
    
    it('유효하지 않은 입력으로 에러가 발생해야 함', async () => {
      // 빈 작업 배열로 테스트
      await expect(loadOptimizationService.autoDistributeTasks(
        'project-1',
        [],
        [{ id: 'resource-1', name: '리소스 1' }],
        {}
      )).rejects.toThrow('유효한 작업 및 리소스 데이터가 필요합니다.');
      
      // 빈 리소스 배열로 테스트
      await expect(loadOptimizationService.autoDistributeTasks(
        'project-1',
        [{ id: 'task-1', name: '작업 1' }],
        [],
        {}
      )).rejects.toThrow('유효한 작업 및 리소스 데이터가 필요합니다.');
    });
  });

  // applyLoadOptimization 메서드 단위 테스트
  describe('applyLoadOptimization', () => {
    it('부하 최적화를 성공적으로 적용해야 함', async () => {
      // Mock 데이터 설정
      const mockOptimizationId = 'opt-1';
      const mockModifications = [
        { taskId: 'task-1', newResourceId: 'resource-2' }
      ];
      
      // 최적화 정보 Mock
      const mockOptimization = {
        id: mockOptimizationId,
        projectId: 'project-1',
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      };
      
      // 최적화 적용 ID Mock
      const mockAppliedOptimizationId = 'applied-opt-1';
      
      // Repository Mock 구현
      loadOptimizationRepository.getOptimizationById = jest.fn().mockResolvedValue(mockOptimization);
      taskRepository.updateTaskResource = jest.fn().mockResolvedValue(true);
      loadOptimizationRepository.saveAppliedOptimization = jest.fn().mockResolvedValue(mockAppliedOptimizationId);
      
      // getLoadData Mock
      const mockPostOptimizationLoad = { resourceLoads: [], systemLoadByDate: [] };
      jest.spyOn(loadOptimizationService, 'getLoadData').mockResolvedValue(mockPostOptimizationLoad);
      
      // 함수 실행
      const result = await loadOptimizationService.applyLoadOptimization(
        mockOptimizationId,
        mockModifications
      );
      
      // 검증
      expect(loadOptimizationRepository.getOptimizationById).toHaveBeenCalledWith(mockOptimizationId);
      expect(taskRepository.updateTaskResource).toHaveBeenCalledWith('task-1', 'resource-2');
      expect(loadOptimizationRepository.saveAppliedOptimization).toHaveBeenCalled();
      expect(loadOptimizationService.getLoadData).toHaveBeenCalled();
      
      // 결과 검증
      expect(result).toBeDefined();
      expect(result.appliedOptimizationId).toBe(mockAppliedOptimizationId);
      expect(result.modifications).toEqual(mockModifications);
      expect(result.postOptimizationLoad).toEqual(mockPostOptimizationLoad);
    });
    
    it('존재하지 않는 최적화 ID로 에러가 발생해야 함', async () => {
      // 존재하지 않는 최적화 ID 모킹
      loadOptimizationRepository.getOptimizationById = jest.fn().mockResolvedValue(null);
      
      // 함수 실행 및 에러 검증
      await expect(loadOptimizationService.applyLoadOptimization(
        'invalid-opt-id',
        [{ taskId: 'task-1', newResourceId: 'resource-2' }]
      )).rejects.toThrow('존재하지 않는 최적화 ID입니다.');
    });
  });

  // predictFutureLoad 메서드 단위 테스트
  describe('predictFutureLoad', () => {
    it('미래 부하를 정확하게 예측해야 함', async () => {
      // Mock 데이터 설정
      const mockProjectId = 'project-1';
      const mockTeamId = 'team-1';
      const mockStartDate = '2025-01-01';
      const mockEndDate = '2025-01-31';
      const mockNewTasks = [
        {
          id: 'new-task-1',
          name: '새 작업 1',
          startDate: '2025-01-15',
          endDate: '2025-01-20',
          effort: 30,
          resourceId: 'resource-1'
        }
      ];
      
      // 현재 부하 데이터 Mock
      const mockCurrentLoadData = {
        startDate: mockStartDate,
        endDate: mockEndDate,
        resourceLoads: [
          {
            resourceId: 'resource-1',
            resourceName: '리소스 1',
            resourceType: 'DEVELOPER',
            capacity: 8,
            avgLoad: 50,
            maxLoad: 70,
            loadByDate: Array.from({ length: 31 }, (_, i) => ({
              date: `2025-01-${String(i + 1).padStart(2, '0')}`,
              tasks: [],
              workHours: 4,
              capacity: 8,
              load: 50
            }))
          }
        ],
        systemLoadByDate: []
      };
      
      // 리소스 Mock
      const mockResources = [
        {
          id: 'resource-1',
          name: '리소스 1',
          type: 'DEVELOPER',
          capacity: 8,
          dailyCapacity: 8
        }
      ];
      
      // 예측 ID Mock
      const mockPredictionId = 'prediction-1';
      
      // Repository Mock 구현
      jest.spyOn(loadOptimizationService, 'getLoadData').mockResolvedValue(mockCurrentLoadData);
      resourceRepository.getResourcesByTeamId = jest.fn().mockResolvedValue(mockResources);
      loadOptimizationRepository.savePrediction = jest.fn().mockResolvedValue(mockPredictionId);
      
      // 함수 실행
      const result = await loadOptimizationService.predictFutureLoad(
        mockProjectId,
        mockTeamId,
        mockStartDate,
        mockEndDate,
        mockNewTasks
      );
      
      // 검증
      expect(loadOptimizationService.getLoadData).toHaveBeenCalledWith(
        mockStartDate, 
        mockEndDate, 
        mockProjectId, 
        mockTeamId
      );
      expect(resourceRepository.getResourcesByTeamId).toHaveBeenCalledWith(mockTeamId);
      expect(loadOptimizationRepository.savePrediction).toHaveBeenCalled();
      
      // 결과 검증
      expect(result).toBeDefined();
      expect(result.predictionId).toBe(mockPredictionId);
      expect(result.currentLoad).toBeDefined();
      expect(result.predictedLoad).toBeDefined();
      expect(result.difference).toBeDefined();
    });
  });
});
