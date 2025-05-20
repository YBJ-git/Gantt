import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Layout, 
  Typography, 
  Card, 
  Tabs, 
  Button, 
  Divider, 
  Row, 
  Col, 
  Space,
  Spin,
  Alert,
  Badge
} from 'antd';
import './TestPage.css';

// 작업 부하 최적화 컴포넌트들 임포트
import { 
  AutoTaskDistribution, 
  LoadGauge, 
  LoadHeatmap,
  LoadOptimizationRecommendations
} from '../components/feature/LoadOptimization';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 더미 데이터 생성 함수
const generateMockData = () => {
  // 리소스 데이터
  const resources = [
    { id: 1, name: '개발자 A', capacity: 40, utilization: 85 },
    { id: 2, name: '개발자 B', capacity: 40, utilization: 45 },
    { id: 3, name: '개발자 C', capacity: 40, utilization: 110 },
    { id: 4, name: '디자이너 A', capacity: 40, utilization: 75 },
    { id: 5, name: '디자이너 B', capacity: 40, utilization: 60 },
    { id: 6, name: 'QA 엔지니어 A', capacity: 40, utilization: 95 },
  ];

  // 작업 데이터
  const tasks = [
    { id: 101, name: '프론트엔드 개발', resourceId: 1, startDate: '2025-05-10', endDate: '2025-05-20', workload: 37 },
    { id: 102, name: '백엔드 개발', resourceId: 2, startDate: '2025-05-12', endDate: '2025-05-25', workload: 18 },
    { id: 103, name: 'DB 모델링', resourceId: 3, startDate: '2025-05-08', endDate: '2025-05-15', workload: 45 },
    { id: 104, name: 'UI 디자인', resourceId: 4, startDate: '2025-05-05', endDate: '2025-05-18', workload: 30 },
    { id: 105, name: '테스트 자동화', resourceId: 6, startDate: '2025-05-15', endDate: '2025-05-30', workload: 38 },
    { id: 106, name: 'UX 개선', resourceId: 5, startDate: '2025-05-10', endDate: '2025-05-22', workload: 24 },
    { id: 107, name: 'API 개발', resourceId: 3, startDate: '2025-05-16', endDate: '2025-05-28', workload: 42 },
    { id: 108, name: '통합 테스트', resourceId: 6, startDate: '2025-05-25', endDate: '2025-06-05', workload: 40 },
  ];

  // 히트맵 데이터 (일별 부하)
  const heatmapData = [];
  
  for (let i = 0; i < 6; i++) {
    const resource = resources[i];
    const resourceData = {
      resourceId: resource.id,
      resourceName: resource.name,
      dates: []
    };
    
    const startDate = new Date('2025-05-01');
    for (let j = 0; j < 31; j++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + j);
      
      resourceData.dates.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 10) + (i === 2 ? 6 : 1) // 개발자 C는 높은 부하
      });
    }
    
    heatmapData.push(resourceData);
  }

  // 최적화 추천 데이터
  const recommendations = [
    {
      id: 1,
      title: '개발자 C의 작업 부하 재할당',
      description: '개발자 C의 부하가 110%로 너무 높습니다. DB 모델링 작업을 개발자 B에게 재할당하는 것을 고려하세요.',
      severity: 'high',
      potentialGain: '부하 균형화로 프로젝트 지연 위험 감소',
      suggestedActions: [
        { taskId: 103, action: 'reassign', fromResource: 3, toResource: 2 }
      ]
    },
    {
      id: 2,
      title: 'QA 엔지니어의 부하 최적화',
      description: 'QA 엔지니어 A의 부하가 95%로 높습니다. 통합 테스트 일정을 1주일 앞당기면 부하를 분산할 수 있습니다.',
      severity: 'medium',
      potentialGain: '테스트 병목 현상 방지',
      suggestedActions: [
        { taskId: 108, action: 'reschedule', newStartDate: '2025-05-18', newEndDate: '2025-05-28' }
      ]
    },
    {
      id: 3,
      title: '개발자 B의 부하 활용',
      description: '개발자 B의 부하가 45%로 낮습니다. 추가 작업을 할당하거나 다른 팀원의 작업을 지원할 수 있습니다.',
      severity: 'low',
      potentialGain: '리소스 활용 효율 증가',
      suggestedActions: [
        { taskId: 107, action: 'share', fromResource: 3, toResource: 2, splitPercentage: 30 }
      ]
    }
  ];

  return {
    resources,
    tasks,
    heatmapData,
    recommendations
  };
};

const TestPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(true);
  const [mockData, setMockData] = useState(null);
  
  useEffect(() => {
    // 실제로는 API에서 데이터를 가져오지만, 여기서는 목업 데이터 사용
    setTimeout(() => {
      setMockData(generateMockData());
      setLoading(false);
    }, 1000);
  }, []);
  
  // 최적화 실행 핸들러 (실제 동작하지는 않음)
  const handleOptimize = () => {
    setLoading(true);
    
    // 로딩 상태 시뮬레이션
    setTimeout(() => {
      setLoading(false);
      // 여기에 최적화 수행 후 UI 업데이트 로직이 들어갈 것입니다
    }, 2000);
  };
  
  if (loading && !mockData) {
    return (
      <Layout className="test-page-layout">
        <Content className="test-page-content loading-container">
          <Spin size="large" tip="데이터 로딩 중..." />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="test-page-layout">
      <Header className="test-header">
        <div className="logo">WMS</div>
        <Typography.Title level={3} style={{ color: 'white', margin: 0 }}>
          작업 부하 관리 시스템
        </Typography.Title>
      </Header>
      
      <Content className="test-page-content">
        <div className="test-page-container">
          <Card className="overview-card">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>작업 부하 대시보드</Title>
                <Text type="secondary">
                  현재 프로젝트의 부하 상태와 리소스 할당 상황을 살펴보고 최적화 작업을 수행하는 테스트 페이지입니다.
                </Text>
              </Col>
              
              <Col span={24}>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                  <TabPane tab="리소스 현황" key="1">
                    <div className="dashboard-container">
                      <Row gutter={[16, 16]}>
                        {mockData.resources.map(resource => (
                          <Col xs={24} sm={12} md={8} key={resource.id}>
                            <Card className="resource-card">
                              <Row align="middle" justify="space-between">
                                <Col>
                                  <Text strong>{resource.name}</Text>
                                  <div>
                                    <Badge 
                                      status={
                                        resource.utilization > 90 ? 'error' : 
                                        resource.utilization > 75 ? 'warning' : 'success'
                                      } 
                                    />
                                    <Text>{resource.utilization}% 활용</Text>
                                  </div>
                                </Col>
                                <Col>
                                  <LoadGauge 
                                    value={resource.utilization} 
                                    capacity={resource.capacity}
                                    size={80}
                                  />
                                </Col>
                              </Row>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </TabPane>
                  
                  <TabPane tab="부하 히트맵" key="2">
                    <div className="heatmap-container">
                      <LoadHeatmap 
                        data={mockData.heatmapData}
                        startDate="2025-05-01"
                        endDate="2025-05-31"
                      />
                    </div>
                  </TabPane>
                  
                  <TabPane tab="최적화 추천" key="3">
                    <div className="recommendations-container">
                      <LoadOptimizationRecommendations 
                        recommendations={mockData.recommendations}
                        onApply={(recId) => console.log(`Applying recommendation ${recId}`)}
                      />
                    </div>
                  </TabPane>
                  
                  <TabPane tab="자동 작업 분배" key="4">
                    <div className="auto-distribution-container">
                      <AutoTaskDistribution 
                        tasks={mockData.tasks}
                        resources={mockData.resources}
                        onDistribute={handleOptimize}
                      />
                    </div>
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </Card>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Alert
                message="테스트 환경 알림"
                description="이 페이지는 작업 부하 최적화 시스템의 UI 컴포넌트를 테스트하기 위한 데모 환경입니다. 실제 데이터는 사용되지 않으며, 모든 기능은 목업 데이터로 시뮬레이션됩니다."
                type="info"
                showIcon
              />
            </Col>
          </Row>
        </div>
      </Content>
      
      <Footer className="test-footer">
        작업 부하 관리 시스템 ©2025 - 테스트 환경
      </Footer>
    </Layout>
  );
};

export default TestPage;