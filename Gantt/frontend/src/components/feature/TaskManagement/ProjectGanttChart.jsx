import React, { useState, useEffect } from 'react';
import { Tooltip, Empty, Spin, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './ProjectGanttChart.scss';

/**
 * 간트 차트 컴포넌트
 * 작업 일정 및 연계성을 시각적으로 보여주는 컴포넌트
 * 
 * @param {Array} tasks - 작업 목록
 * @param {Array} resources - 리소스 목록
 * @param {string} viewMode - 보기 모드 (day, week, month)
 * @param {boolean} showDependencies - 작업 간 의존성 표시 여부
 */
const ProjectGanttChart = ({ 
  tasks = [], 
  resources = [], 
  viewMode = 'week',
  showDependencies = true
}) => {
  const [loading, setLoading] = useState(true);
  const [timelineDates, setTimelineDates] = useState([]);
  const [processedTasks, setProcessedTasks] = useState([]);

  // 시간 범위 계산
  useEffect(() => {
    if (tasks.length === 0) {
      setLoading(false);
      return;
    }

    // 모든 작업의 시작일과 종료일 추출
    const allDates = tasks.flatMap(task => [
      new Date(task.start_date), 
      new Date(task.end_date)
    ]);

    // 프로젝트 시작일과 종료일 찾기
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    // 타임라인 눈금 생성
    const dates = [];
    let currentDate = new Date(minDate);
    
    // 뷰 모드에 따라 타임라인 설정
    const increment = viewMode === 'day' ? 1 : 
                      viewMode === 'week' ? 7 : 
                      viewMode === 'month' ? 30 : 7;

    const formatLabel = viewMode === 'day' ? 
                        date => `${date.getDate()}일` : 
                        viewMode === 'week' ? 
                        date => `${date.getMonth() + 1}/${date.getDate()}` : 
                        date => `${date.getMonth() + 1}월`;

    while (currentDate <= maxDate) {
      dates.push({
        date: new Date(currentDate),
        label: formatLabel(currentDate)
      });
      
      currentDate.setDate(currentDate.getDate() + increment);
    }

    setTimelineDates(dates);
    
    // 작업 처리
    const processed = tasks.map(task => {
      const resource = resources.find(r => r.id === task.resourceId);
      const dependencies = task.dependencies?.map(depId => {
        return tasks.find(t => t.id === depId);
      }).filter(Boolean) || [];
      
      return {
        ...task,
        resource,
        dependencies,
        startPosition: getPositionFromDate(minDate, new Date(task.start_date), dates.length),
        endPosition: getPositionFromDate(minDate, new Date(task.end_date), dates.length)
      };
    });
    
    setProcessedTasks(processed);
    setLoading(false);
  }, [tasks, resources, viewMode]);

  // 날짜 위치 계산 함수
  const getPositionFromDate = (minDate, date, totalSlots) => {
    const totalDays = (date - minDate) / (1000 * 60 * 60 * 24);
    return (totalDays / ((timelineDates.length - 1) * (viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30))) * 100;
  };

  // 작업 진행 상태에 따른 색상 반환
  const getTaskStatusColor = (progress) => {
    if (progress === 100) return '#52c41a'; // 완료
    if (progress >= 70) return '#1890ff';   // 진행 중 (많이 진행)
    if (progress >= 30) return '#faad14';   // 진행 중 (일부 진행)
    return '#f5222d';                      // 미시작/거의 시작 안함
  };

  // 작업 연결선 경로 계산
  const getDependencyPath = (fromTask, toTask) => {
    const fromX = fromTask.endPosition;
    const fromY = processedTasks.findIndex(t => t.id === fromTask.id) * 60 + 30;
    const toX = toTask.startPosition;
    const toY = processedTasks.findIndex(t => t.id === toTask.id) * 60 + 30;
    
    // 베지어 곡선 제어점 계산
    const controlX1 = fromX + (toX - fromX) * 0.3;
    const controlY1 = fromY;
    const controlX2 = toX - 10;
    const controlY2 = toY;
    
    return `M ${fromX}% ${fromY} C ${controlX1}% ${controlY1}, ${controlX2}% ${controlY2}, ${toX}% ${toY}`;
  };

  if (loading) {
    return (
      <div className="gantt-loading">
        <Spin tip="간트 차트 로딩 중..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return <Empty description="표시할 작업이 없습니다" />;
  }

  return (
    <div className="project-gantt-chart">
      <div className="gantt-container">
        {/* 헤더 */}
        <div className="gantt-header">
          <div className="task-header">작업</div>
          <div className="timeline-header">
            {timelineDates.map((date, idx) => (
              <div key={idx} className="timeline-cell">
                {date.label}
              </div>
            ))}
          </div>
        </div>
        
        {/* 내용 */}
        <div className="gantt-content">
          <div className="task-list">
            {processedTasks.map((task, idx) => (
              <div key={task.id} className="task-row">
                <div className="task-info">
                  <div>
                    <div className="task-name">{task.text}</div>
                    <div className="task-meta">
                      <span className="task-dates">
                        {new Date(task.start_date).toLocaleDateString()} - {new Date(task.end_date).toLocaleDateString()}
                      </span>
                      {task.progress === 100 ? (
                        <Tag color="success" icon={<CheckCircleOutlined />}>완료됨</Tag>
                      ) : (
                        <Tag color="processing" icon={<ClockCircleOutlined />}>진행 중 ({task.progress}%)</Tag>
                      )}
                    </div>
                  </div>
                  <div className="task-resource">
                    {task.resource?.name || '미할당'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="timeline-content">
            {/* 타임라인 그리드 */}
            <div className="timeline-grid">
              {timelineDates.map((date, idx) => (
                <div key={idx} className="timeline-column"></div>
              ))}
            </div>
            
            {/* 작업 바 */}
            {processedTasks.map((task, idx) => (
              <div key={task.id} className="task-timeline-row">
                <Tooltip 
                  title={
                    <>
                      <div><strong>{task.text}</strong></div>
                      <div>담당자: {task.resource?.name || '미할당'}</div>
                      <div>기간: {task.start_date} - {task.end_date}</div>
                      <div>진행률: {task.progress}%</div>
                    </>
                  }
                >
                  <div 
                    className="task-bar"
                    style={{
                      left: `${task.startPosition}%`,
                      width: `${task.endPosition - task.startPosition}%`,
                      backgroundColor: getTaskStatusColor(task.progress)
                    }}
                  >
                    <div 
                      className="task-progress"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                    <div className="task-label">{task.text}</div>
                  </div>
                </Tooltip>
              </div>
            ))}
            
            {/* 의존성 연결선 */}
            {showDependencies && (
              <svg className="dependencies-container">
                {processedTasks.flatMap(task => 
                  task.dependencies.map(dep => (
                    <path
                      key={`${dep.id}-${task.id}`}
                      d={getDependencyPath(dep, task)}
                      className="dependency-path"
                      markerEnd="url(#arrowhead)"
                    />
                  ))
                )}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="0"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" />
                  </marker>
                </defs>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectGanttChart;