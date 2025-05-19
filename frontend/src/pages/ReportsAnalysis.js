import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  Spin, 
  DatePicker, 
  Button, 
  Space, 
  Select, 
  Typography, 
  Table,
  Input,
  Row,
  Col,
  Radio,
  Dropdown,
  Menu,
  Alert
} from 'antd';
import { 
  DownloadOutlined, 
  FilterOutlined, 
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  SaveOutlined,
  ExportOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './ReportsAnalysis.scss';

// 가정: 이러한 컴포넌트가 구현되어 있을 것
import LoadTrendsChart from '../components/feature/Reports/LoadTrendsChart';
import ResourceUtilizationChart from '../components/feature/Reports/ResourceUtilizationChart';
import TaskCompletionChart from '../components/feature/Reports/TaskCompletionChart';
import CostAnalysisChart from '../components/feature/Reports/CostAnalysisChart';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const ReportsAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('1');
  const [dateRange, setDateRange] = useState([
    moment().subtract(30, 'days'),
    moment()
  ]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [reportData, setReportData] = useState(null);
  
  // 필터 상태
  const [filterVisible, setFilterVisible] = useState(false);
  
  // 더미 데이터 - 실제 구현에서는 API에서 가져옴
  const departments = [
    { id: 1, name: '개발팀' },
    { id: 2, name: '디자인팀' },
    { id: 3, name: 'QA팀' },
    { id: 4, name: '마케팅팀' }
  ];
  
  const resourceTypes = [
    { id: 1, name: '개발자' },
    { id: 2, name: '디자이너' },
    { id: 3, name: 'QA 엔지니어' },
    { id: 4, name: '프로젝트 매니저' }
  ];
  
  // 저장된 보고서 템플릿
  const savedReportTemplates = [
    { id: 1, name: '월간 리소스 활용도 보고서' },
    { id: 2, name: '부서별 비용 분석' },
    { id: 3, name: '개발팀 작업 완료율' }
  ];
  
  useEffect(() => {
    // 실제 구현에서는 API 호출
    setTimeout(() => {
      setLoading(false);
      // 더미 데이터 로드
      setReportData({
        loadTrends: [
          /* 부하 추세 데이터 */
        ],
        resourceUtilization: [
          /* 리소스 활용도 데이터 */
        ],
        taskCompletion: [
          /* 작업 완료 데이터 */
        ],
        costAnalysis: [
          /* 비용 분석 데이터 */
        ]
      });
    }, 1000);
  }, []);
  
  // 필터 변경 시 데이터 새로고침
  const handleFilterChange = () => {
    setLoading(true);
    // 실제 구현에서는 필터를 적용하여 API 호출
    setTimeout(() => {
      setLoading(false);
      // 필터된 데이터 설정
    }, 1000);
  };
  
  // 보고서 저장
  const handleSaveReport = () => {
    // 현재 설정으로 보고서 저장 로직
  };
  
  // 보고서 내보내기 (Excel, PDF)
  const handleExportReport = (type) => {
    // 선택한 형식으로 보고서 내보내기 로직
  };
  
  // 템플릿 로드
  const handleLoadTemplate = (templateId) => {
    // 템플릿 설정 로드 로직
  };
  
  const exportMenu = (
    <Menu>
      <Menu.Item key="excel" onClick={() => handleExportReport('excel')}>
        Excel로 내보내기
      </Menu.Item>
      <Menu.Item key="pdf" onClick={() => handleExportReport('pdf')}>
        PDF로 내보내기
      </Menu.Item>
      <Menu.Item key="print" onClick={() => window.print()}>
        인쇄
      </Menu.Item>
    </Menu>
  );
  
  const templatesMenu = (
    <Menu>
      {savedReportTemplates.map(template => (
        <Menu.Item key={template.id} onClick={() => handleLoadTemplate(template.id)}>
          {template.name}
        </Menu.Item>
      ))}
    </Menu>
  );
  
  if (loading && !reportData) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="보고서 데이터 로딩 중..." />
      </div>
    );
  }
  
  return (
    <div className="reports-analysis-page">
      <div className="page-header">
        <div className="header-left">
          <Title level={2}>보고서 및 분석</Title>
          <Text type="secondary">
            작업 부하 및 리소스 활용도에 대한 상세 보고서와 분석 도구를 제공합니다.
          </Text>
        </div>
        <div className="header-right">
          <Space>
            <Dropdown overlay={templatesMenu} placement="bottomRight">
              <Button icon={<SaveOutlined />}>템플릿</Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveReport}
            >
              저장
            </Button>
            <Dropdown overlay={exportMenu} placement="bottomRight">
              <Button type="primary" icon={<ExportOutlined />}>
                내보내기
              </Button>
            </Dropdown>
          </Space>
        </div>
      </div>
      
      {/* 필터 영역 */}
      <Card className="filter-card">
        <div className="filter-header">
          <Title level={4}>보고서 필터</Title>
          <Button 
            type="text" 
            icon={<FilterOutlined />} 
            onClick={() => setFilterVisible(!filterVisible)}
          >
            {filterVisible ? '필터 접기' : '필터 펼치기'}
          </Button>
        </div>
        
        {filterVisible && (
          <div className="filter-content">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="filter-item">
                  <label>기간 선택:</label>
                  <RangePicker 
                    value={dateRange}
                    onChange={setDateRange}
                    style={{ width: '100%' }}
                  />
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="filter-item">
                  <label>부서:</label>
                  <Select
                    mode="multiple"
                    placeholder="부서 선택"
                    value={selectedDepartments}
                    onChange={setSelectedDepartments}
                    style={{ width: '100%' }}
                  >
                    {departments.map(dept => (
                      <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="filter-item">
                  <label>리소스 유형:</label>
                  <Select
                    mode="multiple"
                    placeholder="리소스 유형 선택"
                    value={selectedResourceTypes}
                    onChange={setSelectedResourceTypes}
                    style={{ width: '100%' }}
                  >
                    {resourceTypes.map(type => (
                      <Option key={type.id} value={type.id}>{type.name}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>
            <div className="filter-actions">
              <Button type="primary" onClick={handleFilterChange}>
                필터 적용
              </Button>
              <Button 
                onClick={() => {
                  setDateRange([moment().subtract(30, 'days'), moment()]);
                  setSelectedDepartments([]);
                  setSelectedResourceTypes([]);
                }}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* 보고서 탭 */}
      <Card className="reports-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="리소스 활용도" key="1">
            <div className="chart-controls">
              <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
                <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
                <Radio.Button value="line"><LineChartOutlined /></Radio.Button>
                <Radio.Button value="pie"><PieChartOutlined /></Radio.Button>
                <Radio.Button value="table"><TableOutlined /></Radio.Button>
              </Radio.Group>
            </div>
            
            <div className="chart-container">
              {loading ? (
                <Spin tip="데이터 로딩 중..." />
              ) : (
                <ResourceUtilizationChart 
                  data={reportData?.resourceUtilization || []}
                  type={chartType}
                />
              )}
            </div>
          </TabPane>
          
          <TabPane tab="작업 부하 추세" key="2">
            <div className="chart-controls">
              <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
                <Radio.Button value="line"><LineChartOutlined /></Radio.Button>
                <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
                <Radio.Button value="table"><TableOutlined /></Radio.Button>
              </Radio.Group>
            </div>
            
            <div className="chart-container">
              {loading ? (
                <Spin tip="데이터 로딩 중..." />
              ) : (
                <LoadTrendsChart 
                  data={reportData?.loadTrends || []}
                  type={chartType}
                />
              )}
            </div>
          </TabPane>
          
          <TabPane tab="작업 완료율" key="3">
            <div className="chart-controls">
              <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
                <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
                <Radio.Button value="pie"><PieChartOutlined /></Radio.Button>
                <Radio.Button value="table"><TableOutlined /></Radio.Button>
              </Radio.Group>
            </div>
            
            <div className="chart-container">
              {loading ? (
                <Spin tip="데이터 로딩 중..." />
              ) : (
                <TaskCompletionChart 
                  data={reportData?.taskCompletion || []}
                  type={chartType}
                />
              )}
            </div>
          </TabPane>
          
          <TabPane tab="비용 분석" key="4">
            <div className="chart-controls">
              <Radio.Group value={chartType} onChange={e => setChartType(e.target.value)}>
                <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
                <Radio.Button value="line"><LineChartOutlined /></Radio.Button>
                <Radio.Button value="pie"><PieChartOutlined /></Radio.Button>
                <Radio.Button value="table"><TableOutlined /></Radio.Button>
              </Radio.Group>
            </div>
            
            <div className="chart-container">
              {loading ? (
                <Spin tip="데이터 로딩 중..." />
              ) : (
                <CostAnalysisChart 
                  data={reportData?.costAnalysis || []}
                  type={chartType}
                />
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 보고서 설명 및 안내 */}
      <div className="report-info">
        <Alert
          message="보고서 가이드"
          description={
            <>
              <p>이 보고서 도구를 사용하여 다음 정보를 확인할 수 있습니다:</p>
              <ul>
                <li>리소스별 작업 부하 및 활용도</li>
                <li>시간에 따른 부하 변화 추세</li>
                <li>작업 완료율 및 진행 상황</li>
                <li>리소스 비용 분석 및 예측</li>
              </ul>
              <p>필터를 사용하여 특정 기간, 부서 또는 리소스 유형에 따라 데이터를 필터링할 수 있습니다.</p>
            </>
          }
          type="info"
          showIcon
        />
      </div>
    </div>
  );
};

export default ReportsAnalysis;