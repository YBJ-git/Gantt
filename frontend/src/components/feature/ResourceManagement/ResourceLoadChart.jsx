import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Empty, Spin, Radio, Typography, Space } from 'antd';
import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import './ResourceLoadChart.scss';

const { Title } = Typography;

const ResourceLoadChart = ({ 
  resources, 
  monthlyData, 
  type = 'utilization', 
  height = 400 
}) => {
  // 이 컴포넌트는 실제로는 Chart.js를 사용해 구현됩니다
  // 여기서는 UI 구조만 작성합니다
  
  // 실제 구현에서 이 부분은 실제 데이터를 기반으로 차트 설정
  const renderChart = () => {
    if (resources.length === 0) {
      return <Empty description="선택된 리소스가 없습니다" />;
    }
    
    if (type === 'trend' && !monthlyData) {
      return <Empty description="월별 데이터가 없습니다" />;
    }
    
    // 이 부분은 실제 구현에서 Chart.js 컴포넌트로 대체
    return (
      <div 
        className="chart-placeholder" 
        style={{ height: `${height}px` }}
      >
        <div className="chart-title">
          {type === 'utilization' && '리소스 부하율 비교'}
          {type === 'cost' && '리소스 시간당 비용 비교'}
          {type === 'trend' && '월별 부하 추세'}
        </div>
        <div className="chart-content">
          {/* 실제 구현에서는 Chart.js 컴포넌트 */}
          <div className="chart-bars">
            {resources.map(resource => (
              <div className="chart-bar-item" key={resource.id}>
                <div className="bar-label">{resource.name}</div>
                <div className="bar-container">
                  <div 
                    className="bar"
                    style={{ 
                      height: type === 'utilization' ? `${Math.min(resource.utilization, 100)}%` : `${(resource.costRate / 100000) * 100}%`,
                      backgroundColor: 
                        type === 'utilization' 
                          ? (resource.utilization > 100 ? '#ff4d4f' : 
                             resource.utilization > 80 ? '#faad14' : '#52c41a')
                          : '#1890ff'
                    }}
                  />
                </div>
                <div className="bar-value">
                  {type === 'utilization' && `${resource.utilization}%`}
                  {type === 'cost' && `₩${resource.costRate.toLocaleString()}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="resource-load-chart">
      {renderChart()}
    </div>
  );
};

export default ResourceLoadChart;