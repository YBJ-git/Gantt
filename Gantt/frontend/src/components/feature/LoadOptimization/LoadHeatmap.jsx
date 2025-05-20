import React from 'react';
import { Card, Empty } from 'antd';

const LoadHeatmap = ({ data, startDate, endDate, compact = false }) => {
  // 실제 구현에서는 데이터를 기반으로 히트맵 그리기
  // 현재는 간단한 placeholder만 표시

  if (!data || data.length === 0) {
    return (
      <div className="load-heatmap" style={{ textAlign: 'center', padding: '20px' }}>
        <Empty description="표시할 데이터가 없습니다" />
      </div>
    );
  }

  return (
    <div className="load-heatmap">
      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        background: '#f9f9f9',
        borderRadius: '4px'
      }}>
        <p>리소스별 부하 히트맵이 여기에 표시됩니다.</p>
        <p>기간: {startDate} ~ {endDate}</p>
        {compact && <p>(간략 보기)</p>}
      </div>
    </div>
  );
};

export default LoadHeatmap;
