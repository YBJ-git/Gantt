/**
 * Date Utilities 단위 테스트
 */
const dateUtils = require('../../backend/src/utils/dateUtils');

describe('Date Utilities', () => {
  describe('isWeekend', () => {
    it('토요일과 일요일은 주말로 인식해야 함', () => {
      // 2025-01-11은 토요일, 2025-01-12는 일요일
      const saturday = new Date('2025-01-11');
      const sunday = new Date('2025-01-12');
      
      expect(dateUtils.isWeekend(saturday)).toBeTruthy();
      expect(dateUtils.isWeekend(sunday)).toBeTruthy();
    });
    
    it('월요일부터 금요일까지는 주말로 인식하지 않아야 함', () => {
      // 2025-01-06부터 2025-01-10까지 (월~금)
      const monday = new Date('2025-01-06');
      const tuesday = new Date('2025-01-07');
      const wednesday = new Date('2025-01-08');
      const thursday = new Date('2025-01-09');
      const friday = new Date('2025-01-10');
      
      expect(dateUtils.isWeekend(monday)).toBeFalsy();
      expect(dateUtils.isWeekend(tuesday)).toBeFalsy();
      expect(dateUtils.isWeekend(wednesday)).toBeFalsy();
      expect(dateUtils.isWeekend(thursday)).toBeFalsy();
      expect(dateUtils.isWeekend(friday)).toBeFalsy();
    });
  });
  
  describe('calculateWorkingDays', () => {
    it('시작일부터 종료일까지의 근무일 수를 정확히 계산해야 함', () => {
      // 2025-01-06(월)부터 2025-01-10(금)까지: 5일
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-10');
      
      expect(dateUtils.calculateWorkingDays(startDate, endDate)).toBe(5);
    });
    
    it('주말을 제외하고 근무일 수를 계산해야 함', () => {
      // 2025-01-06(월)부터 2025-01-12(일)까지: 5일 (주말 2일 제외)
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-12');
      
      expect(dateUtils.calculateWorkingDays(startDate, endDate)).toBe(5);
    });
    
    it('주말만 포함된 기간은 근무일 수가 0이어야 함', () => {
      // 2025-01-11(토)부터 2025-01-12(일)까지: 0일
      const startDate = new Date('2025-01-11');
      const endDate = new Date('2025-01-12');
      
      expect(dateUtils.calculateWorkingDays(startDate, endDate)).toBe(0);
    });
    
    it('시작일과 종료일이 같고 주중인 경우 근무일 수는 1이어야 함', () => {
      // 2025-01-06(월) 하루: 1일
      const date = new Date('2025-01-06');
      
      expect(dateUtils.calculateWorkingDays(date, date)).toBe(1);
    });
    
    it('시작일과 종료일이 같고 주말인 경우 근무일 수는 0이어야 함', () => {
      // 2025-01-11(토) 하루: 0일
      const date = new Date('2025-01-11');
      
      expect(dateUtils.calculateWorkingDays(date, date)).toBe(0);
    });
  });
  
  describe('getWorkingDays', () => {
    it('시작일부터 종료일까지의 모든 근무일을 배열로 반환해야 함', () => {
      // 2025-01-06(월)부터 2025-01-12(일)까지
      const startDate = new Date('2025-01-06');
      const endDate = new Date('2025-01-12');
      
      const workingDays = dateUtils.getWorkingDays(startDate, endDate);
      
      // 검증
      expect(workingDays).toHaveLength(5); // 5 근무일
      
      // 각 날짜가 월~금인지 검증
      workingDays.forEach(date => {
        const day = date.getDay();
        expect(day).not.toBe(0); // 일요일이 아님
        expect(day).not.toBe(6); // 토요일이 아님
      });
      
      // 날짜 순서 검증
      expect(workingDays[0].toISOString().split('T')[0]).toBe('2025-01-06');
      expect(workingDays[1].toISOString().split('T')[0]).toBe('2025-01-07');
      expect(workingDays[2].toISOString().split('T')[0]).toBe('2025-01-08');
      expect(workingDays[3].toISOString().split('T')[0]).toBe('2025-01-09');
      expect(workingDays[4].toISOString().split('T')[0]).toBe('2025-01-10');
    });
    
    it('주말만 포함된 기간은 빈 배열을 반환해야 함', () => {
      // 2025-01-11(토)부터 2025-01-12(일)까지
      const startDate = new Date('2025-01-11');
      const endDate = new Date('2025-01-12');
      
      const workingDays = dateUtils.getWorkingDays(startDate, endDate);
      
      // 검증
      expect(workingDays).toHaveLength(0); // 근무일 없음
    });
  });
  
  describe('formatDateToString', () => {
    it('Date 객체를 YYYY-MM-DD 형식 문자열로 변환해야 함', () => {
      const date = new Date('2025-01-06');
      
      expect(dateUtils.formatDateToString(date)).toBe('2025-01-06');
    });
    
    it('월과 일이 한 자리 수인 경우 앞에 0을 붙여야 함', () => {
      const date = new Date('2025-01-01');
      
      expect(dateUtils.formatDateToString(date)).toBe('2025-01-01');
    });
  });
  
  describe('parseStringToDate', () => {
    it('YYYY-MM-DD 형식 문자열을 Date 객체로 변환해야 함', () => {
      const dateString = '2025-01-06';
      const date = dateUtils.parseStringToDate(dateString);
      
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0);  // 0-based (0: 1월)
      expect(date.getDate()).toBe(6);
    });
    
    it('이미 Date 객체인 경우 그대로 반환해야 함', () => {
      const originalDate = new Date('2025-01-06');
      const parsedDate = dateUtils.parseStringToDate(originalDate);
      
      expect(parsedDate).toBe(originalDate);
    });
    
    it('null이나 undefined가 전달되면 null을 반환해야 함', () => {
      expect(dateUtils.parseStringToDate(null)).toBeNull();
      expect(dateUtils.parseStringToDate(undefined)).toBeNull();
    });
  });
  
  describe('getDaysDifference', () => {
    it('두 날짜 간의 차이를 일 단위로 정확히 계산해야 함', () => {
      // 2025-01-01부터 2025-01-10까지: 9일 차이
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-10');
      
      expect(dateUtils.getDaysDifference(startDate, endDate)).toBe(9);
    });
    
    it('시작일과 종료일이 같은 경우 0을 반환해야 함', () => {
      const date = new Date('2025-01-01');
      
      expect(dateUtils.getDaysDifference(date, date)).toBe(0);
    });
    
    it('종료일이 시작일보다 앞서는 경우에도 양수를 반환해야 함', () => {
      const startDate = new Date('2025-01-10');
      const endDate = new Date('2025-01-01');
      
      expect(dateUtils.getDaysDifference(startDate, endDate)).toBe(9);
    });
  });
  
  describe('addDays', () => {
    it('날짜에 지정된 일수를 더해야 함', () => {
      const date = new Date('2025-01-01');
      const result = dateUtils.addDays(date, 5);
      
      expect(result.toISOString().split('T')[0]).toBe('2025-01-06');
    });
    
    it('음수 일수를 더하면 이전 날짜를 반환해야 함', () => {
      const date = new Date('2025-01-10');
      const result = dateUtils.addDays(date, -5);
      
      expect(result.toISOString().split('T')[0]).toBe('2025-01-05');
    });
    
    it('0일을 더하면 원래 날짜를 반환해야 함', () => {
      const date = new Date('2025-01-01');
      const result = dateUtils.addDays(date, 0);
      
      expect(result.toISOString().split('T')[0]).toBe('2025-01-01');
    });
  });
  
  describe('addMonths', () => {
    it('날짜에 지정된 월수를 더해야 함', () => {
      const date = new Date('2025-01-15');
      const result = dateUtils.addMonths(date, 2);
      
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(2);  // 0-based (2: 3월)
      expect(result.getDate()).toBe(15);
    });
    
    it('연말에 월수를 더하면 다음 해로 넘어가야 함', () => {
      const date = new Date('2025-12-15');
      const result = dateUtils.addMonths(date, 2);
      
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(1);  // 0-based (1: 2월)
      expect(result.getDate()).toBe(15);
    });
    
    it('음수 월수를 더하면 이전 월을 반환해야 함', () => {
      const date = new Date('2025-03-15');
      const result = dateUtils.addMonths(date, -2);
      
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0);  // 0-based (0: 1월)
      expect(result.getDate()).toBe(15);
    });
  });
  
  describe('isDateInRange', () => {
    it('날짜가 범위 내에 있는 경우 true를 반환해야 함', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const dateInRange = new Date('2025-01-15');
      
      expect(dateUtils.isDateInRange(dateInRange, startDate, endDate)).toBeTruthy();
    });
    
    it('날짜가 범위 외에 있는 경우 false를 반환해야 함', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const dateOutOfRange = new Date('2025-02-15');
      
      expect(dateUtils.isDateInRange(dateOutOfRange, startDate, endDate)).toBeFalsy();
    });
    
    it('날짜가 범위의 경계 (시작일 또는 종료일)와 같은 경우 true를 반환해야 함', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      expect(dateUtils.isDateInRange(startDate, startDate, endDate)).toBeTruthy();
      expect(dateUtils.isDateInRange(endDate, startDate, endDate)).toBeTruthy();
    });
  });
});
