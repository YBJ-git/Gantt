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
  Area,
  AreaChart
} from 'recharts';

/**
 * CostAnalysisChart Component
 * 
 * 비용 분석 차트 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 차트에 표시할 데이터 배열
 * @param {string} props.type - 차트 유형 ('bar', 'line', 'pie', 'table')
 * @param {string} props.title - 차트 제목 (선택 사항)
 * @param {string} props.className - 추가 CSS 클래스 (선택 사항)
 * @param {Object} props.colors - 차트 색상 
 * @param {string} props.currency - 통화 단위 (기본값: '₩')
 */
const CostAnalysisChart = ({ 
  data = [], 
  type = 'bar',
  title = '비용 분석', 
  className = '',
  colors = {
    bars: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'],
    pie: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
    categories: {
      labor: '#1890ff',
      hardware: '#52c41a',
      software: '#722ed1',
      operations: '#fa8c16',
      other: '#f5222d'
    }
  },
  currency = '₩'
}) => {
  const [chartData, setChartData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  
  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      calculateTotalCost(data);
    } else {
      // 샘플 데이터 설정 (실제 데이터가 없을 경우)
      const sampleData = generateSampleData();
      setChartData(sampleData);
      calculateTotalCost(sampleData);
    }
  }, [data]);

  // 총 비용 계산
  const calculateTotalCost = (data) => {
    if (!data || data.length === 0) return;
    
    // 유형이 다른 경우에 따라 다른 계산 방식 적용
    if (data[0].hasOwnProperty('date')) {
      // 날짜별 데이터인 경우 마지막 데이터의 누적값 사용
      const lastEntry = data[data.length - 1];
      let sum = 0;
      
      // 모든 카테고리의 비용 합산
      Object.keys(lastEntry).forEach(key => {
        if (key !== 'date' && key !== 'name') {
          sum += lastEntry[key] || 0;
        }
      });
      
      setTotalCost(sum);
    } else {
      // 카테고리별 데이터인 경우 모든 항목의 값 합산
      const sum = data.reduce((acc, item) => acc + (item.value || 0), 0);
      setTotalCost(sum);
    }
  };

  // 샘플 데이터 생성 함수
  const generateSampleData = () => {
    // 차트 유형에 따라 다른 샘플 데이터 반환
    if (type === 'pie') {
      return generatePieSampleData();
    } else if (type === 'line') {
      return generateLineSampleData();
    } else {
      return generateBarSampleData();
    }
  };

  // 파이 차트용 샘플 데이터
  const generatePieSampleData = () => {
    const categories = [
      { name: '인건비', category: 'labor', value: Math.floor(Math.random() * 1000000) + 500000 },
      { name: '하드웨어', category: 'hardware', value: Math.floor(Math.random() * 300000) + 100000 },
      { name: '소프트웨어', category: 'software', value: Math.floor(Math.random() * 200000) + 100000 },
      { name: '운영 비용', category: 'operations', value: Math.floor(Math.random() * 150000) + 80000 },
      { name: '기타', category: 'other', value: Math.floor(Math.random() * 100000) + 50000 }
    ];
    
    return categories;
  };

  // 바 차트용 샘플 데이터
  const generateBarSampleData = () => {
    const departments = ['개발팀', '디자인팀', 'QA팀', '마케팅팀', '운영팀'];
    
    return departments.map(dept => {
      return {
        name: dept,
        department: dept,
        labor: Math.floor(Math.random() * 500000) + 300000,
        hardware: Math.floor(Math.random() * 200000) + 50000,
        software: Math.floor(Math.random() * 150000) + 50000,
        operations: Math.floor(Math.random() * 100000) + 40000,
        other: Math.floor(Math.random() * 80000) + 20000
      };
    });
  };

  // 라인 차트용 샘플 데이터
  const generateLineSampleData = () => {
    const months = [
      '1월', '2월', '3월', '4월', '5월', '6월', 
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    return months.map((month, index) => {
      // 비용이 점진적으로 증가하는 추세
      const baseValue = 100000 + (index * 10000);
      const randomFactor = 0.2; // 변동 폭
      
      return {
        name: month,
        date: month,
        labor: Math.floor(baseValue * (1 + Math.random() * randomFactor - randomFactor/2) * 1.5),
        hardware: Math.floor(baseValue * (1 + Math.random() * randomFactor - randomFactor/2) * 0.4),
        software: Math.floor(baseValue * (1 + Math.random() * randomFactor - randomFactor/2) * 0.3),
        operations: Math.floor(baseValue * (1 + Math.random() * randomFactor - randomFactor/2) * 0.2),
        other: Math.floor(baseValue * (1 + Math.random() * randomFactor - randomFactor/2) * 0.1)
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

  // 카테고리 이름 변환
  const getCategoryName = (category) => {
    const categoryNames = {
      labor: '인건비',
      hardware: '하드웨어',
      software: '소프트웨어',
      operations: '운영 비용',
      other: '기타'
    };
    
    return categoryNames[category] || category;
  };

  // 카테고리별 색상 가져오기
  const getCategoryColor = (category) => {
    return colors.categories[category] || colors.bars[0];
  };

  // 금액 포맷팅
  const formatCurrency = (amount) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  // 바 차트 렌더링
  const renderBarChart = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    const categories = ['labor', 'hardware', 'software', 'operations', 'other'];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: `비용 (${currency})`, angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          {categories.map(category => (
            <Bar 
              key={`bar-${category}`}
              dataKey={category} 
              name={getCategoryName(category)} 
              fill={getCategoryColor(category)} 
              stackId="a"
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // 라인 차트 렌더링
  const renderLineChart = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    const categories = ['labor', 'hardware', 'software', 'operations', 'other'];
    
    // 누적 영역 차트로 구현
    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: `비용 (${currency})`, angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          {categories.map(category => (
            <Area 
              key={`area-${category}`}
              type="monotone"
              dataKey={category} 
              name={getCategoryName(category)} 
              fill={getCategoryColor(category)}
              stroke={getCategoryColor(category)}
              stackId="1"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  // 파이 차트 렌더링
  const renderPieChart = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({name, value, percent}) => 
              `${name}: ${formatCurrency(value)} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {chartData.map(entry => (
              <Cell 
                key={`cell-${entry.category}`} 
                fill={getCategoryColor(entry.category)} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(value)} 
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 테이블 렌더링
  const renderTable = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    const categories = ['labor', 'hardware', 'software', 'operations', 'other'];
    
    // 부서별 데이터인 경우
    if (chartData[0].hasOwnProperty('department')) {
      return (
        <div className="cost-table">
          <table className="cost-analysis-table">
            <thead>
              <tr>
                <th>부서</th>
                {categories.map(category => (
                  <th key={`header-${category}`}>{getCategoryName(category)}</th>
                ))}
                <th>총 비용</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, index) => {
                const rowTotal = categories.reduce((sum, category) => sum + (row[category] || 0), 0);
                
                return (
                  <tr key={`row-${index}`}>
                    <td>{row.name}</td>
                    {categories.map(category => (
                      <td key={`cell-${category}`}>{formatCurrency(row[category] || 0)}</td>
                    ))}
                    <td>{formatCurrency(rowTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    } 
    // 카테고리별 데이터인 경우 (파이 차트 데이터)
    else {
      return (
        <div className="cost-table">
          <table className="cost-analysis-table">
            <thead>
              <tr>
                <th>카테고리</th>
                <th>비용</th>
                <th>비율</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row, index) => {
                const percentage = Math.round((row.value / totalCost) * 100);
                
                return (
                  <tr key={`row-${index}`}>
                    <td>{row.name}</td>
                    <td>{formatCurrency(row.value)}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td>총계</td>
                <td>{formatCurrency(totalCost)}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className={`cost-analysis-chart ${className}`}>
      <h3>{title}</h3>
      <div className="cost-summary">
        <div className="total-cost">
          <span className="cost-value">{formatCurrency(totalCost)}</span>
          <span className="cost-label">총 비용</span>
        </div>
      </div>
      {renderChart()}
    </div>
  );
};

export default CostAnalysisChart;