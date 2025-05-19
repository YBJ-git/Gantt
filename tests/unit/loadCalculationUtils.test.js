/**
 * Load Calculation Utilities 단위 테스트
 */
const loadCalculationUtils = require('../../backend/src/utils/loadCalculationUtils');
const dateUtils = require('../../backend/src/utils/dateUtils');

// 모듈 모킹
jest.mock('../../backend/src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

describe('Load Calculation Utilities', () => {
  // 테스트를 위한 공통 날짜 설정
  const testStartDate = '2025-01-06'; // 월요일
  const testEndDate = '2025-01-10';   // 금요일
  
  // isWeekend 함수 테스트를 위한 원본 함수 백업
  const originalIsWeekend = dateUtils.isWeekend;
  
  // 테스트 후 원본 함수 복원
  afterAll(() => {
    dateUtils.isWeekend = originalIsWeekend;
  });

  describe('calculateResourceLoad', () => {
    it('단일 리소스의 작업 부하를 정확하게 계산해야 함', () => {
      // Mock 데이터 설정
      const tasks = [
        {
          id: 'task-1',
          name: '작업 1',
          startDate: '2025-01-06', // 월요일
          endDate: '2025-01-08',   // 수요일
          effort: 24 // 3일간 총 24시간 (일 8시간)
        },
        {
          id: 'task-2',
          name: '작업 2',
          startDate: '2025-01-09', // 목요일
          endDate: '2025-01-10',   // 금요일
          effort: 12 // 2일간 총 12시간 (일 6시간)
        }
      ];
      
      const resource = {
        id: 'resource-1',
        name: '리소스 1',
        type: 'DEVELOPER',
        capacity: 8,
        dailyCapacity: 8
      };
      
      // isWeekend Mock: 테스트 기간 내 모든 날짜를 주중으로 처리
      dateUtils.isWeekend = jest.fn().mockReturnValue(false);
      
      // 함수 실행
      const result = loadCalculationUtils.calculateResourceLoad(
        tasks, 
        resource, 
        testStartDate, 
        testEndDate
      );
      
      // 검증
      expect(result).toBeDefined();
      expect(result.resourceId).toBe('resource-1');
      expect(result.resourceName).toBe('리소스 1');
      expect(result.loadByDate).toHaveLength(5); // 5일간의 데이터
      
      // 날짜별 부하 검증
      const day1 = result.loadByDate.find(day => day.date === '2025-01-06');
      const day2 = result.loadByDate.find(day => day.date === '2025-01-07');
      const day3 = result.loadByDate.find(day => day.date === '2025-01-08');
      const day4 = result.loadByDate.find(day => day.date === '2025-01-09');
      const day5 = result.loadByDate.find(day => day.date === '2025-01-10');
      
      // 각 일자별 작업량 및 부하율 검증
      expect(day1.workHours).toBe(8); // 작업 1의 일일 할당량
      expect(day1.load).toBe(100);    // 8시간/8시간 = 100%
      
      expect(day2.workHours).toBe(8);
      expect(day2.load).toBe(100);
      
      expect(day3.workHours).toBe(8);
      expect(day3.load).toBe(100);
      
      expect(day4.workHours).toBe(6); // 작업 2의 일일 할당량
      expect(day4.load).toBe(75);     // 6시간/8시간 = 75%
      
      expect(day5.workHours).toBe(6);
      expect(day5.load).toBe(75);
      
      // 평균 및 최대 부하 검증
      expect(result.avgLoad).toBe(90); // (100 + 100 + 100 + 75 + 75) / 5 = 90
      expect(result.maxLoad).toBe(100);
    });
    
    it('주말에는 작업 부하가 0이어야 함 (workOnWeekend 옵션이 없는 경우)', () => {
      // Mock 데이터 설정
      const tasks = [
        {
          id: 'task-1',
          name: '작업 1',
          startDate: '2025-01-10', // 금요일
          endDate: '2025-01-13',   // 월요일
          effort: 16 // 2 근무일간 총 16시간
        }
      ];
      
      const resource = {
        id: 'resource-1',
        name: '리소스 1',
        capacity: 8,
        dailyCapacity: 8
      };
      
      // isWeekend Mock: 주말 설정 (토, 일)
      dateUtils.isWeekend = jest.fn(date => {
        const day = date.getDay();
        return day === 0 || day === 6; // 0: 일요일, 6: 토요일
      });
      
      // 함수 실행
      const result = loadCalculationUtils.calculateResourceLoad(
        tasks, 
        resource, 
        '2025-01-10', // 금요일
        '2025-01-13'  // 월요일
      );
      
      // 검증
      expect(result.loadByDate).toHaveLength(4); // 4일간의 데이터
      
      // 날짜별 부하 검증
      const fridayLoad = result.loadByDate.find(day => day.date === '2025-01-10');
      const saturdayLoad = result.loadByDate.find(day => day.date === '2025-01-11');
      const sundayLoad = result.loadByDate.find(day => day.date === '2025-01-12');
      const mondayLoad = result.loadByDate.find(day => day.date === '2025-01-13');
      
      // 금요일과 월요일은 작업일, 토요일과 일요일은 작업이 없어야 함
      expect(fridayLoad.workHours).toBe(8);
      expect(fridayLoad.load).toBe(100);
      
      expect(saturdayLoad.workHours).toBe(0);
      expect(saturdayLoad.load).toBe(0);
      
      expect(sundayLoad.workHours).toBe(0);
      expect(sundayLoad.load).toBe(0);
      
      expect(mondayLoad.workHours).toBe(8);
      expect(mondayLoad.load).toBe(100);
      
      // 평균 부하는 근무일만 포함 (금, 월)
      expect(result.avgLoad).toBe(100); // (100 + 100) / 2 = 100
    });
    
    it('총 작업량 대신 작업 기간을 사용하는 경우에도 정확히 계산해야 함', () => {
      // Mock 데이터 설정
      const tasks = [
        {
          id: 'task-1',
          name: '작업 1',
          startDate: '2025-01-06', // 월요일
          endDate: '2025-01-10',   // 금요일
          duration: 40             // 총 작업 기간 (시간)
        }
      ];
      
      const resource = {
        id: 'resource-1',
        name: '리소스 1',
        capacity: 8,
        dailyCapacity: 8
      };
      
      // isWeekend Mock: 테스트 기간 내 모든 날짜를 주중으로 처리
      dateUtils.isWeekend = jest.fn().mockReturnValue(false);
      
      // 함수 실행
      const result = loadCalculationUtils.calculateResourceLoad(
        tasks, 
        resource, 
        testStartDate, 
        testEndDate
      );
      
      // 검증
      // 5일간 총 40시간이므로 일일 8시간
      const dailyLoad = result.loadByDate[0];
      expect(dailyLoad.workHours).toBe(8);
      expect(dailyLoad.load).toBe(100);
    });
  });

  describe('calculateSystemLoad', () => {
    it('리소스별 부하 데이터를 기반으로 시스템 전체 부하를 계산해야 함', () => {
      // Mock 데이터 설정
      const resourceLoads = [
        {
          resourceId: 'resource-1',
          resourceName: '리소스 1',
          loadByDate: [
            { date: '2025-01-06', load: 100, capacity: 8 },
            { date: '2025-01-07', load: 100, capacity: 8 },
            { date: '2025-01-08', load: 100, capacity: 8 },
            { date: '2025-01-09', load: 75, capacity: 8 },
            { date: '2025-01-10', load: 75, capacity: 8 }
          ]
        },
        {
          resourceId: 'resource-2',
          resourceName: '리소스 2',
          loadByDate: [
            { date: '2025-01-06', load: 50, capacity: 8 },
            { date: '2025-01-07', load: 50, capacity: 8 },
            { date: '2025-01-08', load: 50, capacity: 8 },
            { date: '2025-01-09', load: 120, capacity: 8 },
            { date: '2025-01-10', load: 120, capacity: 8 }
          ]
        }
      ];
      
      // isWeekend Mock: 테스트 기간 내 모든 날짜를 주중으로 처리
      dateUtils.isWeekend = jest.fn().mockReturnValue(false);
      
      // 함수 실행
      const result = loadCalculationUtils.calculateSystemLoad(
        resourceLoads, 
        testStartDate, 
        testEndDate
      );
      
      // 검증
      expect(result).toBeDefined();
      expect(result.systemLoadByDate).toHaveLength(5); // 5일간의 데이터
      
      // 날짜별 시스템 부하 검증
      const day1 = result.systemLoadByDate.find(day => day.date === '2025-01-06');
      const day4 = result.systemLoadByDate.find(day => day.date === '2025-01-09');
      
      // 각 일자별 시스템 평균 부하 및 상태 검증
      expect(day1.load).toBe(75);  // (100 + 50) / 2 = 75
      expect(day1.status).toBe('NORMAL');
      expect(day1.resourcesCount).toBe(2);
      
      expect(day4.load).toBe(97.5); // (75 + 120) / 2 = 97.5
      expect(day4.overloadedCount).toBe(1); // 리소스 2가 과부하
      
      // 시스템 평균 및 최대 부하 검증
      expect(result.avgLoad).toBe(82.5); // 5일간 평균
      expect(result.loadScore).toBeGreaterThan(0); // 부하 점수는 0보다 커야 함
    });
  });

  describe('analyzePeriodicalLoad', () => {
    it('일별 부하 데이터를 주별로 분석해야 함', () => {
      // Mock 데이터 설정
      const loadData = [
        { date: '2025-01-06', load: 75, status: 'NORMAL' },
        { date: '2025-01-07', load: 75, status: 'NORMAL' },
        { date: '2025-01-08', load: 75, status: 'NORMAL' },
        { date: '2025-01-09', load: 97.5, status: 'HIGH' },
        { date: '2025-01-10', load: 97.5, status: 'HIGH' },
        { date: '2025-01-13', load: 60, status: 'NORMAL' },
        { date: '2025-01-14', load: 60, status: 'NORMAL' }
      ];
      
      // 함수 실행
      const result = loadCalculationUtils.analyzePeriodicalLoad(loadData, 'week');
      
      // 검증
      expect(result).toBeDefined();
      expect(result).toHaveLength(2); // 2주간의 데이터
      
      // 첫 번째 주 검증
      const week1 = result[0];
      expect(week1.startDate).toBe('2025-01-06');
      expect(week1.endDate).toBe('2025-01-10');
      expect(week1.avgLoad).toBe(84); // 5일간 평균
      expect(week1.workingDays).toBe(5);
      expect(week1.highLoadDays).toBe(2); // 2일이 HIGH 상태
      
      // 두 번째 주 검증
      const week2 = result[1];
      expect(week2.startDate).toBe('2025-01-13');
      expect(week2.workingDays).toBe(2);
      expect(week2.avgLoad).toBe(60); // 2일간 평균
    });
    
    it('일별 부하 데이터를 월별로 분석해야 함', () => {
      // Mock 데이터 설정
      const loadData = [
        { date: '2025-01-06', load: 75, status: 'NORMAL' },
        { date: '2025-01-20', load: 85, status: 'HIGH' },
        { date: '2025-02-03', load: 60, status: 'NORMAL' },
        { date: '2025-02-17', load: 110, status: 'OVERLOAD' }
      ];
      
      // 함수 실행
      const result = loadCalculationUtils.analyzePeriodicalLoad(loadData, 'month');
      
      // 검증
      expect(result).toBeDefined();
      expect(result).toHaveLength(2); // 2개월간의 데이터
      
      // 첫 번째 월 검증
      const month1 = result[0];
      expect(month1.periodKey).toBe('2025-01');
      expect(month1.avgLoad).toBe(80); // 1월 평균
      
      // 두 번째 월 검증
      const month2 = result[1];
      expect(month2.periodKey).toBe('2025-02');
      expect(month2.overloadedDays).toBe(1); // 2월에 1일 과부하
    });
  });

  describe('calculateLoadScore', () => {
    it('부하 데이터를 기반으로 적절한 부하 점수를 계산해야 함', () => {
      // Mock 데이터 설정
      const optimalLoadData = [
        { date: '2025-01-06', load: 80, workHours: 6.4, capacity: 8 },
        { date: '2025-01-07', load: 75, workHours: 6, capacity: 8 }
      ];
      
      const overloadedData = [
        { date: '2025-01-06', load: 120, workHours: 9.6, capacity: 8 },
        { date: '2025-01-07', load: 110, workHours: 8.8, capacity: 8 }
      ];
      
      const underutilizedData = [
        { date: '2025-01-06', load: 20, workHours: 1.6, capacity: 8 },
        { date: '2025-01-07', load: 25, workHours: 2, capacity: 8 }
      ];
      
      // 함수 실행
      const optimalScore = loadCalculationUtils.calculateLoadScore(optimalLoadData);
      const overloadedScore = loadCalculationUtils.calculateLoadScore(overloadedData);
      const underutilizedScore = loadCalculationUtils.calculateLoadScore(underutilizedData);
      
      // 검증
      // 최적 부하 (80%)는 높은 점수를 받아야 함
      expect(optimalScore).toBeGreaterThan(90);
      
      // 과부하 (120%)는 중간 정도 점수를 받아야 함
      expect(overloadedScore).toBeLessThan(optimalScore);
      
      // 저부하 (20-25%)는 낮은 점수를 받아야 함
      expect(underutilizedScore).toBeLessThan(overloadedScore);
    });
    
    it('작업이 없는 날짜에 대해 0 점수를 반환해야 함', () => {
      // Mock 데이터 설정
      const emptyLoadData = [
        { date: '2025-01-06', load: 0, workHours: 0, capacity: 8 },
        { date: '2025-01-07', load: 0, workHours: 0, capacity: 8 }
      ];
      
      // 함수 실행
      const score = loadCalculationUtils.calculateLoadScore(emptyLoadData);
      
      // 검증
      expect(score).toBe(0);
    });
  });

  describe('getDateRange', () => {
    it('시작일부터 종료일까지의 모든 날짜를 배열로 반환해야 함', () => {
      // 함수 실행
      const result = loadCalculationUtils.getDateRange(
        new Date('2025-01-06'),
        new Date('2025-01-10')
      );
      
      // 검증
      expect(result).toHaveLength(5); // 5일간의 데이터
      
      // 각 날짜 검증
      expect(result[0].toISOString().split('T')[0]).toBe('2025-01-06');
      expect(result[1].toISOString().split('T')[0]).toBe('2025-01-07');
      expect(result[2].toISOString().split('T')[0]).toBe('2025-01-08');
      expect(result[3].toISOString().split('T')[0]).toBe('2025-01-09');
      expect(result[4].toISOString().split('T')[0]).toBe('2025-01-10');
    });
    
    it('시작일과 종료일이 같은 경우 하나의 날짜만 반환해야 함', () => {
      // 함수 실행
      const result = loadCalculationUtils.getDateRange(
        new Date('2025-01-06'),
        new Date('2025-01-06')
      );
      
      // 검증
      expect(result).toHaveLength(1);
      expect(result[0].toISOString().split('T')[0]).toBe('2025-01-06');
    });
  });
});
