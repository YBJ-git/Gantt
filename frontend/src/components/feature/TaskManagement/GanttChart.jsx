import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import { handleTaskMove, generateDependencyLinks } from '../../../utils/dependencyUtils';

/**
 * 간트 차트 컴포넌트
 * 작업 일정을 간트 차트 형식으로 표시하고 상호작용을 처리합니다.
 */
const GanttChart = ({ tasks, onTaskUpdate }) => {
  const [chartTasks, setChartTasks] = useState([]);
  const [dependencyLinks, setDependencyLinks] = useState([]);
  
  useEffect(() => {
    // 작업 데이터 변환
    const formattedTasks = tasks.map(task => ({
      ...task,
      start_date: new Date(task.startDate),
      end_date: new Date(task.endDate),
      text: task.name,
      progress: task.completed / 100 || 0
    }));
    
    setChartTasks(formattedTasks);
    
    // 종속성 링크 생성
    const links = generateDependencyLinks(tasks);
    setDependencyLinks(links);
  }, [tasks]);
  
  /**
   * 작업 이동 이벤트 처리
   * @param {number} id - 작업 ID
   * @param {Date} start_date - 새 시작일
   * @param {Date} end_date - 새 종료일
   */
  const handleTaskDrag = (id, start_date, end_date) => {
    const task = tasks.find(t => t.id === id);
    
    // 종속성 검증
    const isValid = handleTaskMove({
      task,
      allTasks: tasks,
      newStartDate: start_date,
      newEndDate: end_date,
      onInvalid: (errorMessage) => {
        message.error(errorMessage);
      }
    });
    
    if (isValid) {
      // 작업 업데이트
      onTaskUpdate(id, {
        startDate: start_date.toISOString().split('T')[0],
        endDate: end_date.toISOString().split('T')[0]
      });
    }
    
    // 유효성 검사 결과 반환 (무효한 이동은 차트에서 되돌림)
    return isValid;
  };
  
  /**
   * 작업 링크 생성 이벤트 처리
   * @param {number} sourceId - 원본 작업 ID
   * @param {number} targetId - 대상 작업 ID
   */
  const handleLinkCreated = (sourceId, targetId) => {
    // 순환 종속성 방지
    const sourceTask = tasks.find(t => t.id === sourceId);
    const targetTask = tasks.find(t => t.id === targetId);
    
    // 대상 작업이 이미 원본 작업에 의존하는 경우 (순환 종속성)
    if (targetTask.dependencies && targetTask.dependencies.includes(sourceId)) {
      message.error('순환 종속성은 허용되지 않습니다.');
      return false;
    }
    
    // 종속성 추가
    const updatedTargetTask = {
      ...targetTask,
      dependencies: [...(targetTask.dependencies || []), sourceId]
    };
    
    // 시작일/종료일 검증
    const sourceEndDate = new Date(sourceTask.endDate);
    const targetStartDate = new Date(targetTask.startDate);
    
    if (sourceEndDate > targetStartDate) {
      message.warning('종속 작업이 선행 작업보다 늦게 시작되도록 일정을 조정합니다.');
      
      // 대상 작업 시작일 조정
      const newStartDate = new Date(sourceEndDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      
      const duration = (new Date(targetTask.endDate) - targetStartDate) / (1000 * 60 * 60 * 24);
      const newEndDate = new Date(newStartDate);
      newEndDate.setDate(newEndDate.getDate() + duration);
      
      updatedTargetTask.startDate = newStartDate.toISOString().split('T')[0];
      updatedTargetTask.endDate = newEndDate.toISOString().split('T')[0];
    }
    
    // 작업 업데이트
    onTaskUpdate(targetId, updatedTargetTask);
    return true;
  };
  
  return (
    <div className="gantt-chart-container">
      {/* 실제 차트 라이브러리 구현 (dhtmlx-gantt, react-gantt, 등) */}
      {/* 이 예제에서는 실제 구현 대신 구조만 제공합니다 */}
      <div className="gantt-chart">
        {/* 차트 헤더 */}
        <div className="gantt-header">
          <div className="gantt-task-info">작업 정보</div>
          <div className="gantt-timeline">
            {/* 타임라인 눈금 */}
          </div>
        </div>
        
        {/* 차트 바디 */}
        <div className="gantt-body">
          {chartTasks.map(task => (
            <div key={task.id} className="gantt-task-row">
              <div className="gantt-task-info">
                {task.text}
              </div>
              <div className="gantt-timeline">
                <div 
                  className="gantt-task-bar"
                  style={{
                    left: `${getTaskPosition(task, chartTasks)}%`,
                    width: `${getTaskWidth(task, chartTasks)}%`
                  }}
                >
                  {task.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 차트 컨트롤 */}
      <div className="gantt-controls">
        <button>확대</button>
        <button>축소</button>
        <button>오늘</button>
      </div>
    </div>
  );
};

/**
 * 작업의 상대적 위치 계산 (실제 구현은 차트 라이브러리에 따라 다름)
 */
const getTaskPosition = (task, allTasks) => {
  // 구현 필요
  return 10; // 임시 값
};

/**
 * 작업의 상대적 너비 계산 (실제 구현은 차트 라이브러리에 따라 다름)
 */
const getTaskWidth = (task, allTasks) => {
  // 구현 필요
  return 20; // 임시 값
};

export default GanttChart;
