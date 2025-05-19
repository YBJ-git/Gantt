import React from 'react';
import { Progress, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import './LoadGauge.scss';

const LoadGauge = ({ 
  value, 
  capacity = 40, 
  size = 120,
  showTooltip = true
}) => {
  // 부하 백분율 계산
  const percentage = Math.min(Math.round(value), 100);
  
  // 상태에 따른 색상 결정
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return '#f5222d'; // 심각 (빨강)
    if (percentage >= 75) return '#faad14';  // 경고 (주황)
    return '#52c41a';  // 정상 (초록)
  };

  // 툴팁 내용
  const tooltipContent = (
    <div>
      <p><strong>사용량:</strong> {value}%</p>
      <p><strong>용량:</strong> {capacity}시간/주</p>
      <p><strong>상태:</strong> {value >= 90 ? '과부하' : value >= 75 ? '주의' : '정상'}</p>
    </div>
  );

  const gauge = (
    <Progress 
      type="dashboard"
      percent={percentage}
      strokeColor={getStatusColor(percentage)}
      size={size}
      strokeWidth={8}
    />
  );

  return (
    <div className="load-gauge">
      {showTooltip ? (
        <Tooltip title={tooltipContent} placement="right">
          {gauge}
        </Tooltip>
      ) : gauge}
    </div>
  );
};

LoadGauge.propTypes = {
  value: PropTypes.number.isRequired,
  capacity: PropTypes.number,
  size: PropTypes.number,
  showTooltip: PropTypes.bool
};

export default LoadGauge;