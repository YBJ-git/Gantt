/**
 * Date Utilities
 * 날짜 관련 유틸리티 함수
 */

/**
 * 주말 여부 확인
 * @param {Date} date - 확인할 날짜
 * @returns {Boolean} 주말 여부
 */
exports.isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0: 일요일, 6: 토요일
};

/**
 * 두 날짜 사이의 근무일 수 계산 (주말 제외)
 * @param {Date} startDate - 시작일
 * @param {Date} endDate - 종료일
 * @returns {Number} 근무일 수
 */
exports.calculateWorkingDays = (startDate, endDate) => {
  let workingDays = 0;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  
  // 종료일까지 각 날짜를 확인
  while (currentDate <= lastDate) {
    // 주말이 아니면 근무일 카운트 증가
    if (!exports.isWeekend(currentDate)) {
      workingDays++;
    }
    
    // 다음 날짜로 이동
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

/**
 * 날짜 범위 내 근무일 목록 반환
 * @param {Date} startDate - 시작일
 * @param {Date} endDate - 종료일
 * @returns {Array} 근무일 목록
 */
exports.getWorkingDays = (startDate, endDate) => {
  const workingDays = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  
  // 종료일까지 각 날짜를 확인
  while (currentDate <= lastDate) {
    // 주말이 아니면 근무일 목록에 추가
    if (!exports.isWeekend(currentDate)) {
      workingDays.push(new Date(currentDate));
    }
    
    // 다음 날짜로 이동
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

/**
 * 날짜를 YYYY-MM-DD 형식의 문자열로 변환
 * @param {Date} date - 변환할 날짜
 * @returns {String} YYYY-MM-DD 형식 문자열
 */
exports.formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * YYYY-MM-DD 형식 문자열을 Date 객체로 변환
 * @param {String} dateString - 변환할 날짜 문자열
 * @returns {Date} Date 객체
 */
exports.parseStringToDate = (dateString) => {
  if (!dateString) return null;
  
  // 날짜 문자열이 이미 Date 객체인 경우 그대로 반환
  if (dateString instanceof Date) return dateString;
  
  // YYYY-MM-DD 형식 파싱
  const [year, month, day] = dateString.split('-').map(Number);
  
  return new Date(year, month - 1, day);
};

/**
 * 두 날짜 간의 차이를 일 단위로 계산
 * @param {Date} startDate - 시작일
 * @param {Date} endDate - 종료일
 * @returns {Number} 일 수 차이
 */
exports.getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 시간, 분, 초, 밀리초 제거하여 날짜만 비교
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // 밀리초 단위 차이를 일 단위로 변환
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * 날짜에 지정된 일수를 더함
 * @param {Date} date - 기준 날짜
 * @param {Number} days - 더할 일수
 * @returns {Date} 결과 날짜
 */
exports.addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 날짜에 지정된 월수를 더함
 * @param {Date} date - 기준 날짜
 * @param {Number} months - 더할 월수
 * @returns {Date} 결과 날짜
 */
exports.addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/**
 * 날짜가 특정 범위 내에 있는지 확인
 * @param {Date} date - 확인할 날짜
 * @param {Date} startDate - 범위 시작일
 * @param {Date} endDate - 범위 종료일
 * @returns {Boolean} 범위 내 포함 여부
 */
exports.isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  
  // 시간, 분, 초, 밀리초 제거하여 날짜만 비교
  checkDate.setHours(0, 0, 0, 0);
  rangeStart.setHours(0, 0, 0, 0);
  rangeEnd.setHours(0, 0, 0, 0);
  
  return checkDate >= rangeStart && checkDate <= rangeEnd;
};