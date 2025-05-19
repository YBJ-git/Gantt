import React from 'react';
import { Typography, Progress, Row, Col } from 'antd';
import './OptimizationResultChart.scss';

const { Title, Text } = Typography;

const OptimizationResultChart = ({ before, after, resources }) => {
  // 이 컴포넌트는 실제로는 Chart.js 등을 사용하여 구현
  // 여기서는 간단한 UI로 표현
  
  const renderResourceBars = () => {
    return resources.map(resource => {
      const beforeValue = before[resource.id] || 0;
      const afterValue = after[resource.id] || 0;
      
      const getStatusColor = (value) => {
        if (value > 100) return '#ff4d4f';
        if (value > 80) return '#faad14';
        return '#52c41a';
      };
      
      const beforeColor = getStatusColor(beforeValue);
      const afterColor = getStatusColor(afterValue);
      
      const change = afterValue - beforeValue;
      const changeText = change === 0 ? 'No change' :
                        change > 0 ? `+${change}%` : `${change}%`;
      const changeColor = change === 0 ? '#8c8c8c' : 
                         change > 0 ? '#ff4d4f' : '#52c41a';
      
      return (
        <div className="resource-bar" key={resource.id}>
          <div className="resource-info">
            <Text strong>{resource.name}</Text>
            <div className="change-indicator" style={{ color: changeColor }}>
              {changeText}
            </div>
          </div>
          
          <div className="bars-container">
            <div className="bar-row">
              <Text className="bar-label">Before</Text>
              <div className="bar-wrapper">
                <div 
                  className="bar before-bar" 
                  style={{ 
                    width: `${Math.min(beforeValue, 150)}%`,
                    backgroundColor: beforeColor
                  }}
                >
                  <span className="bar-value">{beforeValue}%</span>
                </div>
              </div>
            </div>
            
            <div className="bar-row">
              <Text className="bar-label">After</Text>
              <div className="bar-wrapper">
                <div 
                  className="bar after-bar" 
                  style={{ 
                    width: `${Math.min(afterValue, 150)}%`,
                    backgroundColor: afterColor
                  }}
                >
                  <span className="bar-value">{afterValue}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="optimization-result-chart">
      <Title level={4}>리소스 부하 비교</Title>
      <div className="chart-content">
        {renderResourceBars()}
      </div>
    </div>
  );
};

export default OptimizationResultChart;