import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Tag } from 'antd';
import './LoadHeatmap.scss';

/**
 * 부하 히트맵 컴포넌트
 * 리소스별/날짜별 부하 데이터를 시각화하는 히트맵 컴포넌트
 */
const LoadHeatmap = ({ data, startDate, endDate }) => {
  // 날짜 범위 생성
  const generateDateRange = (start, end) => {
    const dates = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  
  const dateRange = generateDateRange(startDate, endDate);
  
  // 부하 수준별 색상 클래스 반환
  const getLoadColorClass = (load) => {
    if (load === undefined || load === null) return 'no-data';
    if (load < 3) return 'load-low';
    if (load < 6) return 'load-medium';
    if (load < 8) return 'load-high';
    return 'load-critical';
  };
  
  // 날짜 포맷팅
  const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' });
  };
  
  // 요일 확인
  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
  };

  // 열 헤더 렌더링
  const renderColumnHeaders = () => {
    return (
      <div className="heatmap-header">
        <div className="heatmap-resource-column">리소스</div>
        {dateRange.map((date, index) => (
          <div 
            key={index} 
            className={`heatmap-date-column ${isWeekend(date) ? 'weekend' : ''}`}
          >
            {formatDate(date)}
          </div>
        ))}
      </div>
    );
  };
  
  // 리소스별 행 렌더링
  const renderRows = () => {
    return data.map((resource, resourceIndex) => (
      <div key={resourceIndex} className="heatmap-row">
        <div className="heatmap-resource-cell">
          {resource.resourceName}
          <div className="resource-capacity">
            <Tag color="blue">용량: {resource.resourceId % 2 === 0 ? '40h' : '32h'}/주</Tag>
          </div>
        </div>
        
        {dateRange.map((date, dateIndex) => {
          // 해당 날짜의 부하값 찾기
          const dateStr = date.toISOString().split('T')[0];
          const dateData = resource.dates.find(d => d.date === dateStr);
          const loadValue = dateData ? dateData.value : null;
          
          return (
            <Tooltip 
              key={dateIndex}
              title={
                <div>
                  <p><strong>리소스:</strong> {resource.resourceName}</p>
                  <p><strong>날짜:</strong> {dateStr}</p>
                  <p><strong>부하:</strong> {loadValue !== null ? `${loadValue}/10` : '데이터 없음'}</p>
                </div>
              }
            >
              <div 
                className={`
                  heatmap-cell 
                  ${getLoadColorClass(loadValue)} 
                  ${isWeekend(date) ? 'weekend' : ''}
                `}
              >
                {loadValue !== null && loadValue}
              </div>
            </Tooltip>
          );
        })}
      </div>
    ));
  };
  
  return (
    <div className="load-heatmap">
      <div className="heatmap-legend">
        <div className="legend-item">
          <span className="legend-color load-low"></span>
          <span>낮음 (0-3)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color load-medium"></span>
          <span>중간 (3-6)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color load-high"></span>
          <span>높음 (6-8)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color load-critical"></span>
          <span>심각 (8-10)</span>
        </div>
      </div>
      
      <div className="heatmap-grid">
        {renderColumnHeaders()}
        {renderRows()}
      </div>
    </div>
  );
};

LoadHeatmap.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      resourceId: PropTypes.number.isRequired,
      resourceName: PropTypes.string.isRequired,
      dates: PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.string.isRequired,
          value: PropTypes.number
        })
      ).isRequired
    })
  ).isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired
};

export default LoadHeatmap;