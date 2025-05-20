/**
 * 작업 종속성 관리 유틸리티
 * 간트 차트에서 작업 이동 시 종속성 관계를 검증합니다.
 */

/**
 * 작업 이동이 종속성 제약을 위반하는지 확인합니다.
 * @param {Object} task - 이동할 작업 객체
 * @param {Array} allTasks - 모든 작업 목록
 * @param {Date} newStartDate - 새로운 시작일
 * @param {Date} newEndDate - 새로운 종료일
 * @returns {Object} - 유효성 검사 결과 (isValid: boolean, message: string)
 */
export const validateTaskMove = (task, allTasks, newStartDate, newEndDate) => {
  // 종속성 관계가 없는 경우 항상 유효
  if (!task.dependencies || task.dependencies.length === 0) {
    return { isValid: true };
  }
  
  // 종속 작업들 찾기
  const dependentTasks = allTasks.filter(t => 
    task.dependencies.includes(t.id)
  );
  
  // 선행 작업 종료일이 현재 작업 시작일보다 늦은 경우 제약 위반
  for (const depTask of dependentTasks) {
    const depEndDate = new Date(depTask.endDate);
    if (depEndDate > newStartDate) {
      return {
        isValid: false,
        message: `작업 "${depTask.name}"이(가) ${depEndDate.toLocaleDateString()}에 종료되므로 이 작업은 ${depEndDate.toLocaleDateString()} 이후에 시작해야 합니다.`
      };
    }
  }
  
  // 현재 작업에 의존하는 작업들 찾기
  const dependingTasks = allTasks.filter(t => 
    t.dependencies && t.dependencies.includes(task.id)
  );
  
  // 현재 작업 종료일이 의존 작업 시작일보다 늦은 경우 제약 위반
  for (const depTask of dependingTasks) {
    const depStartDate = new Date(depTask.startDate);
    if (newEndDate > depStartDate) {
      return {
        isValid: false,
        message: `작업 "${depTask.name}"이(가) ${depStartDate.toLocaleDateString()}에 시작되므로 이 작업은 ${depStartDate.toLocaleDateString()} 이전에 종료되어야 합니다.`
      };
    }
  }
  
  return { isValid: true };
};

/**
 * 작업 이동 시 종속성 검증 및 경고 메시지 생성
 * @param {Object} params - 파라미터 객체
 * @param {Object} params.task - 이동할 작업
 * @param {Array} params.allTasks - 모든 작업 목록
 * @param {Date} params.newStartDate - 새 시작일
 * @param {Date} params.newEndDate - 새 종료일
 * @param {Function} params.onInvalid - 유효하지 않을 때 호출할 콜백
 * @returns {boolean} - 유효 여부
 */
export const handleTaskMove = ({ task, allTasks, newStartDate, newEndDate, onInvalid }) => {
  const validation = validateTaskMove(task, allTasks, newStartDate, newEndDate);
  
  if (!validation.isValid) {
    if (onInvalid) {
      onInvalid(validation.message);
    }
    return false;
  }
  
  return true;
};

/**
 * 종속성 관계를 시각적으로 표시하기 위한 데이터 생성
 * @param {Array} tasks - 작업 목록
 * @returns {Array} - 종속성 링크 객체 배열
 */
export const generateDependencyLinks = (tasks) => {
  const links = [];
  
  tasks.forEach(task => {
    if (task.dependencies && task.dependencies.length > 0) {
      task.dependencies.forEach(depId => {
        links.push({
          id: `${depId}-${task.id}`,
          source: depId,
          target: task.id,
          type: 'finish-to-start'
        });
      });
    }
  });
  
  return links;
};

/**
 * 두 작업 간의 종속성 관계를 확인
 * @param {Object} task1 - 첫 번째 작업
 * @param {Object} task2 - 두 번째 작업
 * @param {Array} allTasks - 모든 작업 목록
 * @returns {Object} - 종속성 관계 정보
 */
export const checkDependencyRelation = (task1, task2, allTasks) => {
  // task1이 task2에 의존하는지 확인
  const task1DependsOnTask2 = task1.dependencies && task1.dependencies.includes(task2.id);
  
  // task2가 task1에 의존하는지 확인
  const task2DependsOnTask1 = task2.dependencies && task2.dependencies.includes(task1.id);
  
  // 간접적 종속성 확인 (추가 구현 필요)
  
  return {
    direct: {
      task1DependsOnTask2,
      task2DependsOnTask1
    },
    indirect: {
      // 간접 종속성 정보
    },
    hasDependency: task1DependsOnTask2 || task2DependsOnTask1
  };
};
