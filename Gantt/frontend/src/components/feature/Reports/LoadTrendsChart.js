import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

/**
 * LoadTrendsChart Component
 * 
 * 시스템 부하 추세를 시각화하는 차트 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 차트에 표시할 데이터 배열 [{time: '2023-01-01', load: 45}, ...]
 * @param {string} props.title - 차트 제목 (선택 사항)
 * @param {string} props.className - 추가 CSS 클래스 (선택 사항)
 * @param {Object} props.colors - 차트 라인 색상 {load: '#8884d8', average: '#82ca9d'}
 * @param {boolean} props.showAverage - 평균 부하 라인 표시 여부
 */
const LoadTrendsChart = ({ 
  data = [], 
  title = '시스템 부하 추세', 
  className = '',
  colors = { load: '#8884d8', average: '#82ca9d' },
  showAverage = true
}) => {
  const [chartData, setChartData] = useState([]);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      
      // 평균 부하 계산
      const sum = data.reduce((acc, item) => acc + (item.load || 0), 0);
      setAverage(Math.round(sum / data.length * 100) / 100);
    } else {
      // 샘플 데이터 설정 (실제 데이터가 없을 경우)
      const sampleData = generateSampleData();
      setChartData(sampleData);
      
      const sum = sampleData.reduce((acc, item) => acc + item.load, 0);
      setAverage(Math.round(sum / sampleData.length * 100) / 100);
    }
  }, [data]);

  // 샘플 데이터 생성 함수
  const generateSampleData = () => {
    const sampleData = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      sampleData.push({
        time: date.toISOString().split('T')[0],
        load: Math.floor(Math.random() * 70) + 10, // 10-80 사이의 임의 부하값
      });
    }
    
    return sampleData;
  };

  return (
    <div className={`load-trends-chart ${className}`}>
      <h3>{title}</h3>
      <div className="chart-container" style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: '부하 (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value}%`, '부하']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="load" 
              name="시스템 부하" 
              stroke={colors.load} 
              activeDot={{ r: 8 }} 
            />
            {showAverage && (
              <Line 
                type="monotone" 
                dataKey={(entry) => average}
                name="평균 부하" 
                stroke={colors.average} 
                strokeDasharray="5 5" 
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {showAverage && (
        <div className="chart-stats">
          <p>평균 부하: <strong>{average}%</strong></p>
        </div>
      )}
    </div>
  );
};

export default LoadTrendsChart;