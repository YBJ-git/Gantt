import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spin, Statistic, Typography, Button, Divider } from 'antd';
import { 
  WarningOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  BarChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { fetchDashboardData } from '../redux/actions/dashboardActions';
import LoadGauge from '../components/feature/LoadOptimization/LoadGauge';
import LoadHeatmap from '../components/feature/LoadOptimization/LoadHeatmap';
import './Dashboard.scss';

const { Title, Text } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const dashboardData = useSelector(state => state.dashboard?.data || {});
  
  useEffect(() => {
    // 실제 구현에서는 Redux 액션을 통해 데이터 가져오기
    setTimeout(() => {
      setLoading(false);
      // dispatch(fetchDashboardData());
    }, 1000);
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

  const data = loading ? {} : dashboardData?.data || mockData;

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
              value={data.overallLoad} 
              suffix="%" 
              valueStyle={{ color: data.overallLoad > 80 ? '#cf1322' : '#3f8600' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic 
              title="리소스 수" 
              value={data.resourcesCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic 
              title="활성 작업 수" 
              value={data.tasksCount}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card warning-card">
            <Statistic 
              title="부하 임계치 초과" 
              value={data.criticalTasks}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 부하 현황 및 최적화 추천 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="리소스 부하 현황" className="load-status-card">
            <Row gutter={[16, 16]}>
              {data.mostLoadedResources.map(resource => (
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
                      <LoadGauge 
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
                  기한 초과: {data.overdueTasksCount}건
                </span>
              </div>
              <div className="status-item upcoming">
                <ClockCircleOutlined />
                <span className="status-text">
                  7일 내 마감: {data.upcomingDeadlinesCount}건
                </span>
              </div>
            </div>
            
            <Divider orientation="left">다가오는 마감일</Divider>
            <div className="deadline-list">
              {data.upcomingDeadlines.map(task => (
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
            <LoadHeatmap 
              data={data.heatmapData || []}
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
              {data.recentOptimizations?.map(opt => (
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
