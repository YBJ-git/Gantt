import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Statistic, Typography, Button, Divider, Radio, Badge } from 'antd';
import { 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { fetchDashboardData } from '../redux/actions/dashboardActions';
import './Dashboard.scss';

// 안전한 컴포넌트 fallback
const SafeLoadGauge = ({ value, capacity, size }) => (
  <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: '50%' }}>
    {value}%
  </div>
);

const SafeLoadHeatmap = ({ data, startDate, endDate, compact }) => (
  <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
    히트맵 (개발 중)
  </div>
);

const SafeProjectGanttChart = ({ tasks, resources, viewMode }) => (
  <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
    간트 차트 (개발 중)
  </div>
);

const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [ganttViewMode, setGanttViewMode] = useState('week');
  
  // Redux state를 안전하게 가져오기
  const reduxState = useSelector(state => {
    // state가 undefined일 경우를 대비
    if (!state || typeof state !== 'object') {
      console.warn('Redux state is not properly initialized');
      return {};
    }
    return state;
  });
  
  const dashboardState = reduxState?.dashboard || {};
  const { data: dashboardData, loading = false, error = null } = dashboardState;
  
  useEffect(() => {
    // Redux 액션을 통해 데이터 가져오기 (안전하게)
    try {
      if (dispatch && typeof dispatch === 'function') {
        dispatch(fetchDashboardData());
      }
    } catch (error) {
      console.error('Dashboard dispatch error:', error);
    }
  }, [dispatch]);

  // 더미 데이터 생성
  const mockData = {
    overallLoad: 72,
    resourcesCount: 18,
    tasksCount: 45,
    criticalTasks: 3,
    overdueTasksCount: 2,
    upcomingDeadlinesCount: 5,
    mostLoadedResources: [
      { id: 3, name: '개발자 C', utilization: 110, capacity: 40 },
      { id: 6, name: 'QA 엔지니어 A', utilization: 95, capacity: 40 },
      { id: 1, name: '개발자 A', utilization: 85, capacity: 40 }
    ],
    leastLoadedResources: [
      { id: 2, name: '개발자 B', utilization: 45, capacity: 40 },
      { id: 8, name: '마케팅 담당자 A', utilization: 50, capacity: 40 },
      { id: 5, name: '디자이너 B', utilization: 60, capacity: 40 }
    ],
    recentOptimizations: [
      { id: 1, timestamp: '2025-05-15T14:30:00', description: '개발자 C의 작업 부하 재분배' },
      { id: 2, timestamp: '2025-05-14T11:15:00', description: 'QA 엔지니어 일정 최적화' }
    ],
    upcomingDeadlines: [
      { id: 105, name: '테스트 자동화', resourceName: 'QA 엔지니어 A', deadline: '2025-05-30' },
      { id: 108, name: '통합 테스트', resourceName: 'QA 엔지니어 A', deadline: '2025-06-05' },
      { id: 107, name: 'API 개발', resourceName: '개발자 C', deadline: '2025-05-28' }
    ]
  };

  // 간트 차트를 위한 더미 데이터
  const ganttChartData = {
    resources: [
      { id: 1, name: '김철수', title: '개발팀', load: 140, tasks: 2 },
      { id: 2, name: '이영희', title: '디자인팀', load: 140, tasks: 2 },
      { id: 3, name: '박지민', title: '개발팀', load: 170, tasks: 2 },
      { id: 4, name: '최용주', title: '개발팀', load: 285, tasks: 4 }
    ],
    tasks: [
      { 
        id: 1, 
        text: '요구사항 분석', 
        resourceId: 1, 
        start_date: '2025-07-31', 
        end_date: '2025-08-07', 
        progress: 100, 
        dependencies: []
      },
      { 
        id: 2, 
        text: 'UI 디자인', 
        resourceId: 2, 
        start_date: '2025-08-07', 
        end_date: '2025-08-14', 
        progress: 70, 
        dependencies: [1]
      },
      { 
        id: 3, 
        text: '프론트엔드 개발', 
        resourceId: 4, 
        start_date: '2025-08-14', 
        end_date: '2025-08-28', 
        progress: 40, 
        dependencies: [2]
      },
      { 
        id: 4, 
        text: '백엔드 개발', 
        resourceId: 3, 
        start_date: '2025-08-14', 
        end_date: '2025-09-04', 
        progress: 30, 
        dependencies: [1]
      },
      { 
        id: 5, 
        text: '통합 테스트', 
        resourceId: 3, 
        start_date: '2025-09-04', 
        end_date: '2025-09-11', 
        progress: 0, 
        dependencies: [3, 4]
      },
      { 
        id: 6, 
        text: '사용자 테스트', 
        resourceId: 2, 
        start_date: '2025-09-11', 
        end_date: '2025-09-18', 
        progress: 0, 
        dependencies: [5]
      },
      { 
        id: 7, 
        text: '버그 수정', 
        resourceId: 4, 
        start_date: '2025-09-18', 
        end_date: '2025-09-25', 
        progress: 0, 
        dependencies: [6]
      },
      { 
        id: 8, 
        text: '배포', 
        resourceId: 4, 
        start_date: '2025-09-25', 
        end_date: '2025-10-02', 
        progress: 0, 
        dependencies: [7]
      }
    ]
  };

  const data = dashboardData || mockData;

  // 안전한 데이터 접근을 위한 기본값 설정
  const safeData = {
    overallLoad: data?.overallLoad || 0,
    resourcesCount: data?.resourcesCount || 0,
    tasksCount: data?.tasksCount || 0,
    criticalTasks: data?.criticalTasks || 0,
    overdueTasksCount: data?.overdueTasksCount || 0,
    upcomingDeadlinesCount: data?.upcomingDeadlinesCount || 0,
    mostLoadedResources: data?.mostLoadedResources || [],
    leastLoadedResources: data?.leastLoadedResources || [],
    recentOptimizations: data?.recentOptimizations || [],
    upcomingDeadlines: data?.upcomingDeadlines || [],
    heatmapData: data?.heatmapData || []
  };

  // 컴포넌트 안전성 검사
  if (!dispatch || typeof useSelector !== 'function') {
    return (
      <div className="dashboard-error">
        <Title level={2}>시스템 초기화 중...</Title>
        <Text type="secondary">
          대시보드를 로드하는 중입니다. 잠시만 기다려 주세요.
        </Text>
        <div style={{ marginTop: 20 }}>
          <Button onClick={() => window.location.reload()}>
            페이지 새로고침
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="대시보드 데이터 로딩 중..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <Title level={2}>대시보드</Title>
        <Text type="secondary">
          작업 부하 관리 시스템의 현재 상태 및 주요 지표를 확인할 수 있습니다.
        </Text>
      </div>

      {/* 주요 지표 */}
      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic 
              title="전체 리소스 부하율" 
              value={safeData.overallLoad} 
              suffix="%" 
              valueStyle={{ color: safeData.overallLoad > 80 ? '#cf1322' : '#3f8600' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic 
              title="리소스 수" 
              value={safeData.resourcesCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic 
              title="활성 작업 수" 
              value={safeData.tasksCount}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card warning-card">
            <Statistic 
              title="부하 임계치 초과" 
              value={safeData.criticalTasks}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 리소스 부하 개요 */}
      <Row gutter={[16, 16]} className="resource-load-summary">
        <Col xs={24}>
          <Card title="리소스 부하 개요" className="resource-summary-card">
            <Row gutter={16}>
              {ganttChartData.resources.map(resource => (
                <Col xs={24} sm={12} md={6} key={resource.id}>
                  <Card 
                    className={`resource-load-card ${resource.load > 200 ? 'critical' : resource.load > 100 ? 'warning' : ''}`}
                    bordered={false}
                  >
                    <div className="resource-header">
                      <h3>{resource.name}</h3>
                      <Badge count={<div className="resource-badge">{resource.title}</div>} />
                    </div>
                    <div className="resource-load">
                      <span>작업 부하</span>
                      <span className="load-value">{resource.load}%</span>
                    </div>
                    <div className="assigned-tasks">
                      <span>할당된 작업</span>
                      <span>{resource.tasks}개</span>
                    </div>
                    <div className="view-details">
                      <Button type="link" size="small">상세 보기</Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 간트 차트 */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card 
            title={
              <div className="gantt-header">
                <span>간트 차트</span>
                <Radio.Group 
                  value={ganttViewMode} 
                  onChange={e => setGanttViewMode(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  size="small"
                >
                  <Radio.Button value="day">일</Radio.Button>
                  <Radio.Button value="week">주</Radio.Button>
                  <Radio.Button value="month">월</Radio.Button>
                </Radio.Group>
              </div>
            } 
            className="gantt-chart-card"
          >
            <SafeProjectGanttChart 
              tasks={ganttChartData.tasks} 
              resources={ganttChartData.resources}
              viewMode={ganttViewMode}
            />
            <div className="view-details-btn">
              <Button type="primary" onClick={() => navigate('/tasks')}>
                작업 관리로 이동
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 부하 현황 및 최적화 추천 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="리소스 부하 현황" className="load-status-card">
            <Row gutter={[16, 16]}>
              {safeData.mostLoadedResources.map(resource => (
                <Col xs={24} sm={8} key={resource.id}>
                  <Card 
                    size="small" 
                    className={`resource-card ${resource.utilization > 90 ? 'overloaded' : ''}`}
                    onClick={() => navigate(`/resources/${resource.id}`)}
                  >
                    <div className="resource-info">
                      <div>
                        <div className="resource-name">{resource.name}</div>
                        <div className="resource-utilization">
                          {resource.utilization}% 활용
                        </div>
                      </div>
                      <SafeLoadGauge 
                        value={resource.utilization} 
                        capacity={resource.capacity}
                        size={60}
                      />
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="view-all-btn">
              <Button type="link" onClick={() => navigate('/resources')}>
                모든 리소스 보기
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="작업 일정 현황" className="task-status-card">
            <div className="status-section">
              <div className="status-item overdue">
                <WarningOutlined />
                <span className="status-text">
                  기한 초과: {safeData.overdueTasksCount}건
                </span>
              </div>
              <div className="status-item upcoming">
                <ClockCircleOutlined />
                <span className="status-text">
                  7일 내 마감: {safeData.upcomingDeadlinesCount}건
                </span>
              </div>
            </div>
            
            <Divider orientation="left">다가오는 마감일</Divider>
            <div className="deadline-list">
              {safeData.upcomingDeadlines.map(task => (
                <div className="deadline-item" key={task.id} onClick={() => navigate(`/tasks/${task.id}`)}>
                  <div className="deadline-info">
                    <div className="task-name">{task.name}</div>
                    <div className="resource-name">{task.resourceName}</div>
                  </div>
                  <div className="deadline-date">
                    {moment(task.deadline).format('YYYY-MM-DD')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 히트맵 및 최적화 히스토리 */}
      <Row gutter={[16, 16]} className="bottom-row">
        <Col xs={24} lg={16}>
          <Card title="부하 히트맵" className="heatmap-card">
            <SafeLoadHeatmap 
              data={safeData.heatmapData}
              startDate="2025-05-01"
              endDate="2025-05-31"
              compact={true}
            />
            <div className="view-details-btn">
              <Button type="primary" onClick={() => navigate('/reports')}>
                상세 보고서 보기
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="최근 최적화 이력" className="optimization-history-card">
            <div className="history-list">
              {safeData.recentOptimizations.map(opt => (
                <div className="history-item" key={opt.id}>
                  <div className="history-icon">
                    <CheckCircleOutlined />
                  </div>
                  <div className="history-content">
                    <div className="history-desc">{opt.description}</div>
                    <div className="history-time">
                      {moment(opt.timestamp).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="view-all-btn">
              <Button type="link" onClick={() => navigate('/optimization')}>
                최적화 도구로 이동
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;