import React from 'react';
import { Card, Row, Col, Tag, Progress, Avatar } from 'antd';

const TaskKanbanBoard = ({ tasks, resources, onTaskUpdate }) => {
  // 상태 컬럼 정의
  const columns = [
    { id: 'planned', title: '계획됨', color: '#d9d9d9' },
    { id: 'in-progress', title: '진행 중', color: '#1890ff' },
    { id: 'completed', title: '완료됨', color: '#52c41a' }
  ];
  
  // 우선순위에 따른 태그 색상 결정
  const getPriorityTag = (priority) => {
    let color = '';
    let text = '';
    
    switch (priority) {
      case 'low':
        color = 'blue';
        text = '낮음';
        break;
      case 'medium':
        color = 'orange';
        text = '중간';
        break;
      case 'high':
        color = 'red';
        text = '높음';
        break;
      default:
        color = 'default';
        text = priority;
    }
    
    return <Tag color={color}>{text}</Tag>;
  };
  
  // 작업 카드 렌더링
  const renderTaskCard = (task) => {
    const resource = resources && resources.find(r => r.id === task.resourceId);
    
    return (
      <Card 
        key={task.id}
        size="small"
        className="task-card"
        style={{ marginBottom: 16 }}
      >
        <div className="task-card-title">{task.name}</div>
        <div className="task-card-info">
          <div className="task-card-dates">
            {task.startDate} ~ {task.endDate}
          </div>
          <div className="task-card-priority">
            {getPriorityTag(task.priority)}
          </div>
        </div>
        <div className="task-card-resource">
          <Avatar size="small" style={{ marginRight: 8 }}>
            {resource ? resource.name.charAt(0) : '?'}
          </Avatar>
          <span>{resource ? resource.name : '미할당'}</span>
        </div>
        <Progress percent={task.progress} size="small" />
      </Card>
    );
  };
  
  return (
    <div className="kanban-board">
      <Row gutter={16}>
        {columns.map(column => (
          <Col span={8} key={column.id}>
            <div 
              className="kanban-column"
              style={{ 
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
                padding: '8px',
                height: '100%'
              }}
            >
              <div 
                className="kanban-column-header"
                style={{
                  padding: '8px 12px',
                  backgroundColor: column.color,
                  color: '#fff',
                  borderRadius: 4,
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{column.title}</span>
                <Tag>{tasks && tasks.filter(task => task.status === column.id).length}</Tag>
              </div>
              <div className="kanban-column-content">
                {tasks && tasks
                  .filter(task => task.status === column.id)
                  .map(task => renderTaskCard(task))
                }
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TaskKanbanBoard;