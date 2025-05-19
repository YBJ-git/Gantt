import React from 'react';
import { Card, Tag, Progress } from 'antd';

const TaskGanttChart = ({ tasks, resources }) => {
  return (
    <div className="gantt-chart-container">
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>간트 차트</h2>
        <p>이 컴포넌트는 간트 차트를 표시합니다. (데모 플레이스홀더)</p>
        
        {tasks && tasks.map(task => (
          <Card 
            key={task.id}
            style={{ marginBottom: 16, textAlign: 'left' }}
            title={task.name}
          >
            <p><strong>담당자:</strong> {resources && resources.find(r => r.id === task.resourceId)?.name || '미할당'}</p>
            <p><strong>기간:</strong> {task.startDate} ~ {task.endDate}</p>
            <p><strong>진행률:</strong></p>
            <Progress percent={task.progress} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskGanttChart;