import React, { useState, useEffect } from 'react';
import { 
  BarChart,
  Bar,
  LineChart, 
  Line, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Table
} from 'recharts';

/**
 * ResourceUtilizationChart Component
 * 
 * 리소스 활용도를 다양한 차트 형식으로 시각화하는 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 차트에 표시할 데이터 배열
 * @param {string} props.type - 차트 유형 ('bar', 'line', 'pie', 'table')
 * @param {string} props.title - 차트 제목 (선택 사항)
 * @param {string} props.className - 추가 CSS 클래스 (선택 사항)
 * @param {Object} props.colors - 차트 색상 
 */
const ResourceUtilizationChart = ({ 
  data = [], 
  type = 'bar',
  title = '리소스 활용도', 
  className = '',
  colors = {
    bars: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'],
    pie: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
  }
}) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      // 샘플 데이터 설정 (실제 데이터가 없을 경우)
      setChartData(generateSampleData());
    }
  }, [data]);

  // 샘플 데이터 생성 함수
  const generateSampleData = () => {
    const resourceTypes = ['개발자', '디자이너', 'QA', '프로젝트 매니저', '마케팅'];
    const departments = ['개발팀', '디자인팀', 'QA팀', '마케팅팀'];
    
    return departments.map(dept => {
      const result = {
        name: dept,
        department: dept,
      };
      
      resourceTypes.forEach(type => {
        result[type] = Math.floor(Math.random() * 80) + 10; // 10-90 사이의 임의 활용도
      });
      
      return result;
    });
  };

  // 차트 데이터 가공 (파이 차트용)
  const getPieData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    // 리소스 유형별 평균 활용도 계산
    const resourceTypes = Object.keys(chartData[0]).filter(key => 
      key !== 'name' && key !== 'department'
    );
    
    return resourceTypes.map(type => {
      const sum = chartData.reduce((acc, item) => acc + (item[type] || 0), 0);
      const average = Math.round(sum / chartData.length);
      
      return {
        name: type,
        value: average
      };
    });
  };

  // 차트 유형에 따른 렌더링
  const renderChart = () => {
    switch(type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'table':
        return renderTable();
      default:
        return renderBarChart();
    }
  };

  // 바 차트 렌더링
  const renderBarChart = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    const resourceTypes = Object.keys(chartData[0]).filter(key => 
      key !== 'name' && key !== 'department'
    );
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: '활용도 (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {resourceTypes.map((type, index) => (
            <Bar 
              key={`bar-${type}`}
              dataKey={type} 
              name={type} 
              fill={colors.bars[index % colors.bars.length]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 라인 차트 렌더링
  const renderLineChart = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    const resourceTypes = Object.keys(chartData[0]).filter(key => 
      key !== 'name' && key !== 'department'
    );
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: '활용도 (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {resourceTypes.map((type, index) => (
            <Line 
              key={`line-${type}`}
              type="monotone" 
              dataKey={type} 
              name={type} 
              stroke={colors.bars[index % colors.bars.length]} 
              activeDot={{ r: 8 }} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // 파이 차트 렌더링
  const renderPieChart = () => {
    const pieData = getPieData();
    
    if (!pieData || pieData.length === 0) return <div>데이터가 없습니다.</div>;
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({name, value}) => `${name}: ${value}%`}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors.pie[index % colors.pie.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, '활용도']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 테이블 렌더링
  const renderTable = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    // 테이블 형식의 데이터 렌더링 (ant design Table 컴포넌트가 필요)
    return (
      <div className="resource-table">
        <table className="resource-utilization-table">
          <thead>
            <tr>
              <th>부서</th>
              {Object.keys(chartData[0])
                .filter(key => key !== 'name' && key !== 'department')
                .map(key => <th key={key}>{key}</th>)
              }
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, index) => (
              <tr key={`row-${index}`}>
                <td>{row.name}</td>
                {Object.keys(row)
                  .filter(key => key !== 'name' && key !== 'department')
                  .map(key => <td key={`cell-${key}`}>{row[key]}%</td>)
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`resource-utilization-chart ${className}`}>
      <h3>{title}</h3>
      {renderChart()}
    </div>
  );
};

export default ResourceUtilizationChart;