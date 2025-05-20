import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

/**
 * TaskCompletionChart Component
 * 
 * 작업 완료율을 시각화하는 차트 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.data - 차트에 표시할 데이터 배열
 * @param {string} props.type - 차트 유형 ('bar', 'pie', 'table')
 * @param {string} props.title - 차트 제목 (선택 사항)
 * @param {string} props.className - 추가 CSS 클래스 (선택 사항)
 * @param {Object} props.colors - 차트 색상 
 */
const TaskCompletionChart = ({ 
  data = [], 
  type = 'bar',
  title = '작업 완료율', 
  className = '',
  colors = {
    bars: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'],
    pie: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
    status: {
      completed: '#52c41a',
      inProgress: '#1890ff',
      pending: '#faad14',
      delayed: '#f5222d'
    }
  }
}) => {
  const [chartData, setChartData] = useState([]);
  const [totalCompletion, setTotalCompletion] = useState(0);

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data);
      calculateTotalCompletion(data);
    } else {
      // 샘플 데이터 설정 (실제 데이터가 없을 경우)
      const sampleData = generateSampleData();
      setChartData(sampleData);
      calculateTotalCompletion(sampleData);
    }
  }, [data]);

  // 전체 완료율 계산
  const calculateTotalCompletion = (data) => {
    if (!data || data.length === 0) return;
    
    let completedTasks = 0;
    let totalTasks = 0;
    
    data.forEach(item => {
      if (item.status === 'completed') {
        completedTasks += item.count || 1;
      }
      totalTasks += item.count || 1;
    });
    
    setTotalCompletion(Math.round((completedTasks / totalTasks) * 100));
  };

  // 샘플 데이터 생성 함수
  const generateSampleData = () => {
    const categories = ['개발', '디자인', 'QA', '문서화', '배포'];
    const statuses = ['completed', 'inProgress', 'pending', 'delayed'];
    
    const result = [];
    
    categories.forEach(category => {
      statuses.forEach(status => {
        result.push({
          category,
          status,
          count: Math.floor(Math.random() * 20) + 5,
          percentage: Math.floor(Math.random() * 100)
        });
      });
    });
    
    return result;
  };

  // 차트 데이터 가공 (바 차트용)
  const getBarData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    // 카테고리별로 데이터 그룹화
    const grouped = {};
    
    chartData.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = {
          name: item.category,
          category: item.category
        };
      }
      
      grouped[item.category][item.status] = item.count;
    });
    
    return Object.values(grouped);
  };

  // 차트 데이터 가공 (파이 차트용)
  const getPieData = () => {
    if (!chartData || chartData.length === 0) return [];
    
    // 상태별로 데이터 그룹화
    const grouped = {};
    
    chartData.forEach(item => {
      if (!grouped[item.status]) {
        grouped[item.status] = {
          name: getStatusName(item.status),
          value: 0,
          status: item.status
        };
      }
      
      grouped[item.status].value += item.count;
    });
    
    return Object.values(grouped);
  };

  // 상태 이름 변환
  const getStatusName = (status) => {
    const statusNames = {
      completed: '완료됨',
      inProgress: '진행 중',
      pending: '대기 중',
      delayed: '지연됨'
    };
    
    return statusNames[status] || status;
  };

  // 상태별 색상 가져오기
  const getStatusColor = (status) => {
    return colors.status[status] || colors.bars[0];
  };

  // 차트 유형에 따른 렌더링
  const renderChart = () => {
    switch(type) {
      case 'bar':
        return renderBarChart();
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
    const barData = getBarData();
    
    if (!barData || barData.length === 0) return <div>데이터가 없습니다.</div>;
    
    const statuses = ['completed', 'inProgress', 'pending', 'delayed'];
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={barData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: '작업 수', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          {statuses.map(status => (
            <Bar 
              key={`bar-${status}`}
              dataKey={status} 
              name={getStatusName(status)} 
              fill={getStatusColor(status)} 
              stackId="a"
            />
          ))}
        </BarChart>
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
            label={({name, value, percent}) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          >
            {pieData.map(entry => (
              <Cell 
                key={`cell-${entry.status}`} 
                fill={getStatusColor(entry.status)} 
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 테이블 렌더링
  const renderTable = () => {
    if (!chartData || chartData.length === 0) return <div>데이터가 없습니다.</div>;
    
    // 카테고리별로 데이터 그룹화
    const grouped = {};
    
    chartData.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = {
          category: item.category,
          completed: 0,
          inProgress: 0,
          pending: 0,
          delayed: 0,
          total: 0
        };
      }
      
      grouped[item.category][item.status] = item.count;
      grouped[item.category].total += item.count;
    });
    
    const tableData = Object.values(grouped);
    
    return (
      <div className="task-table">
        <table className="task-completion-table">
          <thead>
            <tr>
              <th>카테고리</th>
              <th>완료됨</th>
              <th>진행 중</th>
              <th>대기 중</th>
              <th>지연됨</th>
              <th>총 작업</th>
              <th>완료율</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={`row-${index}`}>
                <td>{row.category}</td>
                <td>{row.completed}</td>
                <td>{row.inProgress}</td>
                <td>{row.pending}</td>
                <td>{row.delayed}</td>
                <td>{row.total}</td>
                <td>
                  {Math.round((row.completed / row.total) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`task-completion-chart ${className}`}>
      <h3>{title}</h3>
      <div className="completion-summary">
        <div className="completion-rate">
          <span className="rate-value">{totalCompletion}%</span>
          <span className="rate-label">전체 완료율</span>
        </div>
      </div>
      {renderChart()}
    </div>
  );
};

export default TaskCompletionChart;