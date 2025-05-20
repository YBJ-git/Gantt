import React from 'react';
import { Progress, Tooltip } from 'antd';

const LoadGauge = ({ value, capacity = 40, size = 120 }) => {
  // 값에 따른 색상 결정
  const getColor = (val) => {
    if (val < 70) return '#52c41a'; // 녹색
    if (val < 90) return '#faad14'; // 노란색
    return '#f5222d'; // 빨간색
  };
  
  // 부하율에 따른 스타일
  const color = getColor(value);
  
  return (
    <Tooltip title={`${value}% 부하율`}>
      <div className="load-gauge" style={{ width: size, height: size }}>
        <Progress
          type="dashboard"
          percent={value}
          strokeColor={color}
          width={size}
          strokeWidth={10}
        />
      </div>
    </Tooltip>
  );
};

export default LoadGauge;
