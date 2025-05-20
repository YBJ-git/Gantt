import React, { useState } from 'react';
import { Calendar, Badge, Tooltip, Modal, List, Typography } from 'antd';
import moment from 'moment';
import './ResourceCalendar.scss';

const { Text } = Typography;

const ResourceCalendar = ({ resources, assignments }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateAssignments, setDateAssignments] = useState([]);
  
  // 캘린더 셀 렌더링
  const dateCellRender = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dateAssignments = assignments.filter(assignment => {
      const startDate = moment(assignment.startDate);
      const endDate = moment(assignment.endDate);
      return date.isBetween(startDate, endDate, null, '[]');
    });
    
    if (dateAssignments.length === 0) {
      return null;
    }
    
    // 리소스별 작업 그룹화
    const resourceGroups = {};
    dateAssignments.forEach(assignment => {
      if (!resourceGroups[assignment.resourceId]) {
        resourceGroups[assignment.resourceId] = [];
      }
      resourceGroups[assignment.resourceId].push(assignment);
    });
    
    return (
      <div className="assignment-cell">
        {Object.keys(resourceGroups).map(resourceId => {
          const resourceAssignments = resourceGroups[resourceId];
          const resource = resources.find(r => r.id === parseInt(resourceId));
          
          if (!resource) return null;
          
          // 리소스의 작업 수에 따라 뱃지 색상 결정
          let badgeStatus = 'default';
          if (resourceAssignments.length >= 3) badgeStatus = 'error';
          else if (resourceAssignments.length === 2) badgeStatus = 'warning';
          else if (resourceAssignments.length === 1) badgeStatus = 'processing';
          
          return (
            <div 
              key={resourceId}
              className="resource-assignment"
              onClick={() => {
                setSelectedDate(date.format('YYYY-MM-DD'));
                setDateAssignments(resourceAssignments);
                setModalVisible(true);
              }}
            >
              <Badge status={badgeStatus} text={resource.name} />
            </div>
          );
        })}
      </div>
    );
  };
  
  // 오늘 날짜로 네비게이션 처리
  const handleTodayClick = () => {
    const calendarElement = document.querySelector('.ant-picker-calendar');
    const todayCell = calendarElement?.querySelector('.ant-picker-cell-today');
    
    if (todayCell) {
      todayCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="resource-calendar">
      <div className="calendar-actions">
        <button onClick={handleTodayClick} className="today-button">
          오늘
        </button>
      </div>
      <Calendar dateCellRender={dateCellRender} />
      
      <Modal
        title={`${selectedDate} 작업 할당`}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <List
          itemLayout="horizontal"
          dataSource={dateAssignments}
          renderItem={item => {
            const resource = resources.find(r => r.id === item.resourceId);
            
            return (
              <List.Item>
                <List.Item.Meta
                  title={item.taskName}
                  description={
                    <>
                      <div>프로젝트: {item.projectName}</div>
                      <div>담당: {resource?.name || '미할당'}</div>
                      <div>기간: {item.startDate} ~ {item.endDate}</div>
                      <div>부하: {item.workload}시간</div>
                    </>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default ResourceCalendar;