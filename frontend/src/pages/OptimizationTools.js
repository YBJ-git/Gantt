import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Button, 
  Steps, 
  message, 
  Spin, 
  Typography, 
  Row, 
  Col, 
  Slider,
  Switch,
  Radio,
  Select,
  Divider,
  List,
  Tag,
  Modal,
  Tooltip,
  Alert,
  Progress
} from 'antd';
import {
  ToolOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  RightOutlined,
  ReloadOutlined,
  SaveOutlined,
  HistoryOutlined,
  UserOutlined,
  BarChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import './OptimizationTools.scss';

// 가정: 이러한 컴포넌트가 구현되어 있을 것
import LoadOptimizationRecommendations from '../components/feature/LoadOptimization/LoadOptimizationRecommendations';
import AutoTaskDistribution from '../components/feature/LoadOptimization/AutoTaskDistribution';
import OptimizationResultChart from '../components/feature/OptimizationTools/OptimizationResultChart';
import OptimizationParameters from '../components/feature/OptimizationTools/OptimizationParameters';
import OptimizationHistory from '../components/feature/OptimizationTools/OptimizationHistory';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;
const { Option } = Select;

const OptimizationTools = () => {
  const [activeTab, setActiveTab] = useState('auto');
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationComplete, setOptimizationComplete] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [parameters, setParameters] = useState({
    balancingWeight: 50,
    deadlineWeight: 50,
    skillMatchWeight: 50,
    costWeight: 50,
    maxOverallocation: 110,
    forceRedistribution: false,
    optimizationPeriod: 'month',
    startDate: moment(),
    endDate: moment().add(1, 'month')
  });
  
  // 더미 데이터
  const mockRecommendations = [
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
  
  const mockResources = [
    { id: 1, name: '개발자 A', capacity: 40, utilization: 85 },
    { id: 2, name: '개발자 B', capacity: 40, utilization: 45 },
    { id: 3, name: '개발자 C', capacity: 40, utilization: 110 },
    { id: 4, name: '디자이너 A', capacity: 40, utilization: 75 },
    { id: 5, name: '디자이너 B', capacity: 40, utilization: 60 },
    { id: 6, name: 'QA 엔지니어 A', capacity: 40, utilization: 95 },
  ];

  const mockTasks = [
    { id: 101, name: '프론트엔드 개발', resourceId: 1, startDate: '2025-05-10', endDate: '2025-05-20', workload: 37 },
    { id: 102, name: '백엔드 개발', resourceId: 2, startDate: '2025-05-12', endDate: '2025-05-25', workload: 18 },
    { id: 103, name: 'DB 모델링', resourceId: 3, startDate: '2025-05-08', endDate: '2025-05-15', workload: 45 },
    { id: 104, name: 'UI 디자인', resourceId: 4, startDate: '2025-05-05', endDate: '2025-05-18', workload: 30 },
    { id: 105, name: '테스트 자동화', resourceId: 6, startDate: '2025-05-15', endDate: '2025-05-30', workload: 38 },
    { id: 106, name: 'UX 개선', resourceId: 5, startDate: '2025-05-10', endDate: '2025-05-22', workload: 24 },
    { id: 107, name: 'API 개발', resourceId: 3, startDate: '2025-05-16', endDate: '2025-05-28', workload: 42 },
    { id: 108, name: '통합 테스트', resourceId: 6, startDate: '2025-05-25', endDate: '2025-06-05', workload: 40 },
  ];
  
  const mockOptimizationHistory = [
    {
      id: 1,
      timestamp: '2025-05-15T09:30:00',
      user: '홍길동',
      changes: [
        { taskId: 103, description: 'DB 모델링 작업을 박지원에서 김철수로 재할당' },
        { taskId: 107, description: 'API 개발 작업을 30% 김철수와 공유' }
      ],
      balancingScore: 85,
      beforeUtilization: { 1: 85, 2: 45, 3: 110, 4: 75, 5: 60, 6: 95 },
      afterUtilization: { 1: 85, 2: 75, 3: 80, 4: 75, 5: 60, 6: 95 }
    },
    {
      id: 2,
      timestamp: '2025-05-10T14:15:00',
      user: '김철수',
      changes: [
        { taskId: 108, description: '통합 테스트 일정 변경 (2025-05-25 ~ 2025-06-05) → (2025-05-18 ~ 2025-05-28)' }
      ],
      balancingScore: 78,
      beforeUtilization: { 1: 85, 2: 40, 3: 110, 4: 75, 5: 60, 6: 110 },
      afterUtilization: { 1: 85, 2: 40, 3: 110, 4: 75, 5: 60, 6: 95 }
    }
  ];
  
  // 최적화 실행
  const runOptimization = () => {
    setOptimizing(true);
    
    // 실제 구현에서는 API 호출
    setTimeout(() => {
      setOptimizing(false);
      setOptimizationComplete(true);
      setCurrentStep(1);
      
      // 최적화 결과 설정 (더미 데이터)
      setOptimizationResults({
        tasks: [
          { id: 103, name: 'DB 모델링', from: { id: 3, name: '개발자 C' }, to: { id: 2, name: '개발자 B' }, action: 'reassign' },
          { id: 107, name: 'API 개발', from: { id: 3, name: '개발자 C' }, to: { id: 2, name: '개발자 B' }, action: 'share', percentage: 30 }
        ],
        balancingScore: 85,
        beforeUtilization: { 1: 85, 2: 45, 3: 110, 4: 75, 5: 60, 6: 95 },
        afterUtilization: { 1: 85, 2: 75, 3: 80, 4: 75, 5: 60, 6: 95 },
        improvementPercentage: 22
      });
    }, 3000);
  };
  
  // 최적화 결과 적용
  const applyOptimization = () => {
    setLoading(true);
    
    // 실제 구현에서는 API 호출
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(2);
      message.success('최적화 결과가 성공적으로 적용되었습니다.');
    }, 2000);
  };
  
  // 최적화 결과 초기화
  const resetOptimization = () => {
    setOptimizationComplete(false);
    setOptimizationResults(null);
    setCurrentStep(0);
  };
  
  // 최적화 파라미터 변경 처리
  const handleParameterChange = (key, value) => {
    setParameters({
      ...parameters,
      [key]: value
    });
  };
  
  // 추천 적용 처리
  const handleApplyRecommendation = (recId) => {
    setLoading(true);
    
    // 실제 구현에서는 API 호출
    setTimeout(() => {
      setLoading(false);
      message.success(`추천 #${recId}이(가) 성공적으로 적용되었습니다.`);
    }, 1500);
  };
  
  const renderResults = () => {
    if (!optimizationResults) return null;
    
    return (
      <div className="optimization-results">
        <div className="results-header">
          <div className="results-score">
            <div className="score-label">균형 점수</div>
            <div className="score-value">{optimizationResults.balancingScore}%</div>
            <div className="score-improvement">
              <Tag color="green">+{optimizationResults.improvementPercentage}%</Tag>
            </div>
          </div>
        </div>
        
        <Divider />
        
        <div className="results-changes">
          <Title level={4}>변경 사항</Title>
          
          <List
            dataSource={optimizationResults.tasks}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.name}
                  description={
                    item.action === 'reassign' ? (
                      <span>
                        <UserOutlined /> <b>{item.from.name}</b>에서 <b>{item.to.name}</b>으로 재할당
                      </span>
                    ) : item.action === 'share' ? (
                      <span>
                        <UserOutlined /> <b>{item.from.name}</b>과(와) <b>{item.to.name}</b>이(가) {item.percentage}% 공유
                      </span>
                    ) : (
                      <span>일정 변경</span>
                    )
                  }
                />
              </List.Item>
            )}
          />
        </div>
        
        <div className="results-chart">
          <OptimizationResultChart 
            before={optimizationResults.beforeUtilization}
            after={optimizationResults.afterUtilization}
            resources={mockResources}
          />
        </div>
        
        <div className="results-actions">
          <Button type="default" onClick={resetOptimization}>
            다시 계산
          </Button>
          <Button 
            type="primary" 
            onClick={applyOptimization}
            loading={loading}
          >
            변경 사항 적용
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="optimization-tools-page">
      <div className="page-header">
        <Title level={2}>부하 최적화 도구</Title>
        <Text type="secondary">
          리소스 작업 부하를 자동으로 균형 및 최적화하는 도구입니다.
        </Text>
      </div>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <span>
              <ToolOutlined /> 자동 최적화
            </span>
          } 
          key="auto"
        >
          <Card className="optimization-card">
            <Steps current={currentStep}>
              <Step title="최적화 설정" description="파라미터 설정" />
              <Step title="결과 검토" description="제안된 변경 사항" />
              <Step title="완료" description="변경 사항 적용됨" />
            </Steps>
            
            <div className="step-content">
              {currentStep === 0 && (
                <div className="configuration-step">
                  <Title level={4}>최적화 파라미터</Title>
                  <div className="parameters-container">
                    <OptimizationParameters 
                      parameters={parameters}
                      onChange={handleParameterChange}
                    />
                  </div>
                  
                  <Alert
                    message="이 최적화는 팀 내 균형 잡힌 작업 부하 분배를 목적으로 합니다."
                    description="최적화는 기존 작업의 재할당, 일정 조정 및 작업 공유를 조합하여 작업 부하를 균형있게 분배합니다. 가중치를 조정하여 각 요소의 중요도를 설정할 수 있습니다."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                  
                  <div className="step-actions">
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />} 
                      onClick={runOptimization}
                      loading={optimizing}
                      size="large"
                    >
                      최적화 실행
                    </Button>
                  </div>
                </div>
              )}
              
              {currentStep === 1 && (
                <div className="results-step">
                  {renderResults()}
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="completed-step">
                  <div className="completion-message">
                    <CheckCircleOutlined className="completion-icon" />
                    <Title level={3}>최적화 완료!</Title>
                    <Paragraph>
                      작업 부하 최적화가 성공적으로 적용되었습니다. 이제 작업 관리 페이지에서 변경된 할당을 확인할 수 있습니다.
                    </Paragraph>
                  </div>
                  
                  <div className="completion-actions">
                    <Button 
                      type="primary" 
                      onClick={resetOptimization}
                    >
                      새 최적화 시작
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <InfoCircleOutlined /> 추천
            </span>
          } 
          key="recommendations"
        >
          <Card className="recommendations-card">
            <LoadOptimizationRecommendations 
              recommendations={mockRecommendations}
              onApply={handleApplyRecommendation}
              loading={loading}
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <HistoryOutlined /> 이력
            </span>
          } 
          key="history"
        >
          <Card className="history-card">
            <OptimizationHistory 
              history={mockOptimizationHistory}
              resources={mockResources}
            />
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <SettingOutlined /> 고급 설정
            </span>
          } 
          key="settings"
        >
          <Card className="settings-card">
            <Title level={4}>고급 최적화 설정</Title>
            
            <div className="settings-section">
              <Title level={5}>최적화 알고리즘</Title>
              <Radio.Group defaultValue="balanced">
                <Radio.Button value="balanced">균형적</Radio.Button>
                <Radio.Button value="aggressive">적극적</Radio.Button>
                <Radio.Button value="conservative">보수적</Radio.Button>
              </Radio.Group>
              <Text type="secondary">
                알고리즘의 균형 조정 접근 방식을 선택합니다.
              </Text>
            </div>
            
            <div className="settings-section">
              <Title level={5}>작업 제약 조건</Title>
              <div className="settings-option">
                <div className="option-label">
                  <Text>모든 작업이 재할당 가능</Text>
                  <Tooltip title="활성화하면 모든 작업을 재할당할 수 있습니다. 비활성화하면 특정 작업을 잠글 수 있습니다.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="settings-option">
                <div className="option-label">
                  <Text>작업 분할 허용</Text>
                  <Tooltip title="활성화하면 작업을 여러 리소스 간에 분할할 수 있습니다.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="settings-option">
                <div className="option-label">
                  <Text>일정 변경 허용</Text>
                  <Tooltip title="활성화하면 작업 일정을 변경하여 부하를 분산할 수 있습니다.">
                    <InfoCircleOutlined />
                  </Tooltip>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="settings-section">
              <Title level={5}>최적화 빈도</Title>
              <Select defaultValue="weekly" style={{ width: 200 }}>
                <Option value="daily">매일</Option>
                <Option value="weekly">매주</Option>
                <Option value="monthly">매월</Option>
                <Option value="manual">수동으로만</Option>
              </Select>
              <Text type="secondary">
                자동 최적화 실행 빈도를 설정합니다.
              </Text>
            </div>
            
            <div className="settings-section">
              <Title level={5}>알림</Title>
              <div className="settings-option">
                <div className="option-label">
                  <Text>최적화 완료 시 알림</Text>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="settings-option">
                <div className="option-label">
                  <Text>부하 불균형 발생 시 알림</Text>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="settings-actions">
              <Button type="primary">
                설정 저장
              </Button>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default OptimizationTools;