import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Progress, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select,
  Tooltip,
  Typography,
  Tabs,
  Row,
  Col,
  Drawer,
  Divider,
  Alert,
  Badge,
  Avatar,
  Statistic,
  DatePicker
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import moment from 'moment';
import LoadGauge from '../components/feature/LoadOptimization/LoadGauge';
import { useSelector, useDispatch } from 'react-redux';
// 실제 구현에서는 이러한 액션들이 있을 것
// import { fetchResources, createResource, updateResource, deleteResource } from '../redux/actions/resourceActions';
import './ResourceManagement.scss';

// 가정: 이러한 컴포넌트가 구현되어 있을 것
import ResourceCalendar from '../components/feature/ResourceManagement/ResourceCalendar';
import ResourceLoadChart from '../components/feature/ResourceManagement/ResourceLoadChart';
import ResourceFilterPanel from '../components/feature/ResourceManagement/ResourceFilterPanel';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ResourceManagement = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [searchText, setSearchText] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  
  // 필터 상태
  const [filters, setFilters] = useState({
    department: [],
    type: [],
    availability: [],
    loadRange: [0, 100]
  });
  
  // 모달 상태
  const [resourceModalVisible, setResourceModalVisible] = useState(false);
  const [resourceFormMode, setResourceFormMode] = useState('create'); // 'create' or 'edit'
  const [currentResource, setCurrentResource] = useState(null);
  const [resourceForm] = Form.useForm();
  
  // 상세 정보 드로어 상태
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // 부서 및 리소스 유형 더미 데이터
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
  
  // 리소스 더미 데이터
  const mockResources = [
    {
      id: 1,
      name: '홍길동',
      type: 1, // 개발자
      department: 1, // 개발팀
      email: 'hong@example.com',
      phone: '010-1234-5678',
      location: '서울',
      capacity: 40, // 주당 최대 작업 시간
      utilization: 85, // 현재 활용도 (%)
      skills: ['JavaScript', 'React', 'Node.js'],
      costRate: 100000, // 시간당 비용
      availableFrom: '2025-05-01',
      availableTo: '2025-12-31',
      profileImage: null, // 실제로는 이미지 URL
      description: '프론트엔드 개발 전문가. 웹 애플리케이션 개발 경험 5년.',
    },
    {
      id: 2,
      name: '김철수',
      type: 1, // 개발자
      department: 1, // 개발팀
      email: 'kim@example.com',
      phone: '010-2345-6789',
      location: '부산',
      capacity: 40,
      utilization: 45,
      skills: ['Java', 'Spring', 'MySQL'],
      costRate: 90000,
      availableFrom: '2025-05-01',
      availableTo: '2025-09-30',
      profileImage: null,
      description: '백엔드 개발자. Java 및 Spring 프레임워크 전문.',
    },
    {
      id: 3,
      name: '박지원',
      type: 1, // 개발자
      department: 1, // 개발팀
      email: 'park@example.com',
      phone: '010-3456-7890',
      location: '서울',
      capacity: 40,
      utilization: 110,
      skills: ['Python', 'Django', 'SQL', 'MongoDB'],
      costRate: 95000,
      availableFrom: '2025-05-01',
      availableTo: '2025-12-31',
      profileImage: null,
      description: '풀스택 개발자. 데이터베이스 설계 및 최적화 전문.',
    },
    {
      id: 4,
      name: '이지은',
      type: 2, // 디자이너
      department: 2, // 디자인팀
      email: 'lee@example.com',
      phone: '010-4567-8901',
      location: '서울',
      capacity: 40,
      utilization: 75,
      skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator'],
      costRate: 85000,
      availableFrom: '2025-05-01',
      availableTo: '2025-10-31',
      profileImage: null,
      description: 'UI/UX 디자이너. 사용자 경험 중심 디자인 전문가.',
    },
    {
      id: 5,
      name: '최민수',
      type: 2, // 디자이너
      department: 2, // 디자인팀
      email: 'choi@example.com',
      phone: '010-5678-9012',
      location: '서울',
      capacity: 40,
      utilization: 60,
      skills: ['Sketch', 'InVision', 'Photoshop'],
      costRate: 80000,
      availableFrom: '2025-05-01',
      availableTo: '2025-08-31',
      profileImage: null,
      description: '그래픽 디자이너. 브랜딩 및 마케팅 자료 디자인 전문.',
    },
    {
      id: 6,
      name: '정영희',
      type: 3, // QA 엔지니어
      department: 3, // QA팀
      email: 'jung@example.com',
      phone: '010-6789-0123',
      location: '인천',
      capacity: 40,
      utilization: 95,
      skills: ['Selenium', 'JUnit', 'Manual Testing', 'Test Planning'],
      costRate: 85000,
      availableFrom: '2025-05-01',
      availableTo: '2025-12-31',
      profileImage: null,
      description: 'QA 엔지니어. 자동화 테스트 및 품질 관리 전문가.',
    }
  ];
  
  // 작업 할당 더미 데이터
  const mockAssignments = [
    {
      id: 1,
      resourceId: 1,
      taskId: 101,
      taskName: '프론트엔드 개발',
      startDate: '2025-05-10',
      endDate: '2025-05-20',
      workload: 37,
      projectId: 1,
      projectName: '웹사이트 리뉴얼'
    },
    {
      id: 2,
      resourceId: 2,
      taskId: 102,
      taskName: '백엔드 개발',
      startDate: '2025-05-12',
      endDate: '2025-05-25',
      workload: 18,
      projectId: 1,
      projectName: '웹사이트 리뉴얼'
    },
    {
      id: 3,
      resourceId: 3,
      taskId: 103,
      taskName: 'DB 모델링',
      startDate: '2025-05-08',
      endDate: '2025-05-15',
      workload: 45,
      projectId: 1,
      projectName: '웹사이트 리뉴얼'
    },
    {
      id: 4,
      resourceId: 3,
      taskId: 107,
      taskName: 'API 개발',
      startDate: '2025-05-16',
      endDate: '2025-05-28',
      workload: 42,
      projectId: 3,
      projectName: '데이터 분석 시스템'
    }
  ];
  
  // 월별 부하 데이터
  const mockMonthlyLoads = {
    1: [ // 홍길동의 월별 부하
      { month: '2025-05', load: 85 },
      { month: '2025-06', load: 75 },
      { month: '2025-07', load: 90 },
    ],
    2: [ // 김철수의 월별 부하
      { month: '2025-05', load: 45 },
      { month: '2025-06', load: 60 },
      { month: '2025-07', load: 70 },
    ],
    3: [ // 박지원의 월별 부하
      { month: '2025-05', load: 110 },
      { month: '2025-06', load: 95 },
      { month: '2025-07', load: 85 },
    ]
  };
  
  useEffect(() => {
    // 실제 구현에서는 Redux 액션
    // dispatch(fetchResources());
    
    // 더미 데이터 로드
    setTimeout(() => {
      setResources(mockResources);
      setFilteredResources(mockResources);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 필터 변경 처리
  useEffect(() => {
    let result = [...resources];
    
    // 부서 필터
    if (filters.department.length > 0) {
      result = result.filter(resource => filters.department.includes(resource.department));
    }
    
    // 유형 필터
    if (filters.type.length > 0) {
      result = result.filter(resource => filters.type.includes(resource.type));
    }
    
    // 가용성 필터
    if (filters.availability.length > 0) {
      const now = moment();
      result = result.filter(resource => {
        const available = moment(resource.availableFrom).isSameOrBefore(now) && 
                          moment(resource.availableTo).isSameOrAfter(now);
        return filters.availability.includes('available') ? available : !available;
      });
    }
    
    // 부하 범위 필터
    if (filters.loadRange && filters.loadRange.length === 2) {
      const [min, max] = filters.loadRange;
      result = result.filter(resource => 
        resource.utilization >= min && resource.utilization <= max
      );
    }
    
    // 검색어 필터
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(resource =>
        resource.name.toLowerCase().includes(searchLower) ||
        resource.email.toLowerCase().includes(searchLower) ||
        resource.location.toLowerCase().includes(searchLower) ||
        resource.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredResources(result);
  }, [filters, searchText, resources]);
  
  // 리소스 추가/편집 모달 열기
  const openResourceModal = (mode, resource = null) => {
    setResourceFormMode(mode);
    setCurrentResource(resource);
    
    if (mode === 'edit' && resource) {
      resourceForm.setFieldsValue({
        name: resource.name,
        type: resource.type,
        department: resource.department,
        email: resource.email,
        phone: resource.phone,
        location: resource.location,
        capacity: resource.capacity,
        costRate: resource.costRate,
        availableFrom: moment(resource.availableFrom),
        availableTo: moment(resource.availableTo),
        skills: resource.skills,
        description: resource.description
      });
    } else {
      resourceForm.resetFields();
    }
    
    setResourceModalVisible(true);
  };
  
  // 리소스 추가/편집 제출 처리
  const handleResourceFormSubmit = (values) => {
    if (resourceFormMode === 'create') {
      const newResource = {
        id: Date.now(),
        ...values,
        availableFrom: values.availableFrom.format('YYYY-MM-DD'),
        availableTo: values.availableTo.format('YYYY-MM-DD'),
        utilization: 0, // 새 리소스는 활용도 0에서 시작
        profileImage: null
      };
      
      // 실제 구현에서는 Redux 액션
      // dispatch(createResource(newResource));
      
      setResources([...resources, newResource]);
      alert('리소스가 추가되었습니다.');
    } else {
      const updatedResource = {
        ...currentResource,
        ...values,
        availableFrom: values.availableFrom.format('YYYY-MM-DD'),
        availableTo: values.availableTo.format('YYYY-MM-DD')
      };
      
      // 실제 구현에서는 Redux 액션
      // dispatch(updateResource(updatedResource));
      
      setResources(resources.map(resource => 
        resource.id === updatedResource.id ? updatedResource : resource
      ));
      alert('리소스가 업데이트되었습니다.');
    }
    
    setResourceModalVisible(false);
  };
  
  // 리소스 삭제 처리
  const handleDeleteResource = (resourceId) => {
    Modal.confirm({
      title: '리소스 삭제',
      content: '이 리소스를 삭제하시겠습니까? 관련된 모든 작업 할당도 삭제됩니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        // 실제 구현에서는 Redux 액션
        // dispatch(deleteResource(resourceId));
        
        setResources(resources.filter(resource => resource.id !== resourceId));
        alert('리소스가 삭제되었습니다.');
      }
    });
  };
  
  // 상세 정보 드로어 열기
  const openDetailDrawer = (resource) => {
    setSelectedResource(resource);
    setDetailDrawerVisible(true);
  };
  
  // 테이블 컬럼 설정
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => openDetailDrawer(record)}
          className="resource-name-link"
        >
          <Space>
            <Avatar icon={<UserOutlined />} />
            {text}
          </Space>
        </Button>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: '부서',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      render: departmentId => {
        const department = departments.find(d => d.id === departmentId);
        return department ? department.name : '미지정';
      },
      filters: departments.map(dept => ({
        text: dept.name,
        value: dept.id
      })),
      onFilter: (value, record) => record.department === value
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: typeId => {
        const type = resourceTypes.find(t => t.id === typeId);
        return type ? type.name : '미지정';
      },
      filters: resourceTypes.map(type => ({
        text: type.name,
        value: type.id
      })),
      onFilter: (value, record) => record.type === value
    },
    {
      title: '역량/기술',
      dataIndex: 'skills',
      key: 'skills',
      width: 200,
      render: skills => (
        <div className="skills-container">
          {skills.map(skill => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      )
    },
    {
      title: '부하율',
      dataIndex: 'utilization',
      key: 'utilization',
      width: 150,
      render: (utilization, record) => (
        <div className="utilization-container">
          <Progress 
            percent={utilization} 
            size="small"
            status={
              utilization > 100 ? 'exception' :
              utilization > 80 ? 'warning' : 'normal'
            }
          />
          <div className="utilization-text">
            {utilization}% / {record.capacity}h
          </div>
        </div>
      ),
      sorter: (a, b) => a.utilization - b.utilization
    },
    {
      title: '가용 기간',
      key: 'availability',
      width: 180,
      render: (_, record) => `${record.availableFrom} ~ ${record.availableTo}`,
      sorter: (a, b) => moment(a.availableFrom).diff(moment(b.availableFrom))
    },
    {
      title: '시간당 비용',
      dataIndex: 'costRate',
      key: 'costRate',
      width: 120,
      render: costRate => `₩${costRate.toLocaleString()}`,
      sorter: (a, b) => a.costRate - b.costRate
    },
    {
      title: '작업',
      key: 'actions',
      width: 120,
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="편집">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openResourceModal('edit', record)}
            />
          </Tooltip>
          <Tooltip title="삭제">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteResource(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];
  
  return (
    <div className="resource-management-page">
      <div className="page-header">
        <div className="header-left">
          <Title level={2}>리소스 관리</Title>
          <Text type="secondary">
            팀 구성원 및 리소스를 관리하고 작업 부하를 모니터링합니다.
          </Text>
        </div>
        <div className="header-right">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openResourceModal('create')}
            >
              리소스 추가
            </Button>
          </Space>
        </div>
      </div>
      
      {/* 필터 및 검색 영역 */}
      <Card className="filter-card">
        <div className="filter-section">
          <div className="filter-section-left">
            <Input.Search
              placeholder="리소스 검색"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              type="text"
              icon={<FilterOutlined />}
              onClick={() => setFilterVisible(!filterVisible)}
              className={filterVisible ? 'filter-active' : ''}
            >
              필터
            </Button>
          </div>
          <div className="filter-section-right">
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 150 }}
            >
              <Option value="table">테이블 보기</Option>
              <Option value="calendar">캘린더 보기</Option>
              <Option value="chart">차트 보기</Option>
            </Select>
          </div>
        </div>
        
        {/* 확장 가능한 필터 패널 */}
        {filterVisible && (
          <div className="expanded-filters">
            <ResourceFilterPanel
              departments={departments}
              resourceTypes={resourceTypes}
              filters={filters}
              setFilters={setFilters}
            />
          </div>
        )}
      </Card>
      
      {/* 리소스 목록 */}
      <Card className="resource-list-card" bodyStyle={{ padding: viewMode === 'table' ? 0 : 24 }}>
        {viewMode === 'table' && (
          <Table
            columns={columns}
            dataSource={filteredResources}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
        
        {viewMode === 'calendar' && (
          <ResourceCalendar 
            resources={filteredResources}
            assignments={mockAssignments}
          />
        )}
        
        {viewMode === 'chart' && (
          <div className="resource-charts">
            <Tabs defaultActiveKey="utilization">
              <TabPane tab="부하율 비교" key="utilization">
                <ResourceLoadChart 
                  resources={filteredResources}
                  type="utilization"
                />
              </TabPane>
              <TabPane tab="시간당 비용" key="cost">
                <ResourceLoadChart 
                  resources={filteredResources}
                  type="cost"
                />
              </TabPane>
              <TabPane tab="월별 부하 추세" key="trend">
                <ResourceLoadChart 
                  resources={filteredResources}
                  monthlyData={mockMonthlyLoads}
                  type="trend"
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Card>
      
      {/* 리소스 추가/편집 모달 */}
      <Modal
        title={resourceFormMode === 'create' ? '리소스 추가' : '리소스 편집'}
        visible={resourceModalVisible}
        onCancel={() => setResourceModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={resourceForm}
          layout="vertical"
          onFinish={handleResourceFormSubmit}
        >
          <div className="form-row">
            <Form.Item
              name="name"
              label="이름"
              className="form-col"
              rules={[{ required: true, message: '이름을 입력해주세요' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="이메일"
              className="form-col"
              rules={[
                { required: true, message: '이메일을 입력해주세요' },
                { type: 'email', message: '유효한 이메일 주소를 입력해주세요' }
              ]}
            >
              <Input />
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="department"
              label="부서"
              className="form-col"
              rules={[{ required: true, message: '부서를 선택해주세요' }]}
            >
              <Select placeholder="부서 선택">
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="type"
              label="유형"
              className="form-col"
              rules={[{ required: true, message: '유형을 선택해주세요' }]}
            >
              <Select placeholder="유형 선택">
                {resourceTypes.map(type => (
                  <Option key={type.id} value={type.id}>{type.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="phone"
              label="전화번호"
              className="form-col"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="location"
              label="위치"
              className="form-col"
            >
              <Input />
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="capacity"
              label="주당 가용 시간 (시간)"
              className="form-col"
              rules={[{ required: true, message: '가용 시간을 입력해주세요' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="costRate"
              label="시간당 비용 (원)"
              className="form-col"
              rules={[{ required: true, message: '시간당 비용을 입력해주세요' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="availableFrom"
              label="가용 시작일"
              className="form-col"
              rules={[{ required: true, message: '가용 시작일을 선택해주세요' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="availableTo"
              label="가용 종료일"
              className="form-col"
              rules={[{ required: true, message: '가용 종료일을 선택해주세요' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          
          <Form.Item
            name="skills"
            label="역량/기술"
            rules={[{ required: true, message: '최소 하나의 기술을 입력해주세요' }]}
          >
            <Select
              mode="tags"
              placeholder="역량 또는 기술 입력"
              style={{ width: '100%' }}
            >
              {/* 자주 사용되는 기술 목록 제공 */}
              <Option value="JavaScript">JavaScript</Option>
              <Option value="React">React</Option>
              <Option value="Python">Python</Option>
              <Option value="Java">Java</Option>
              <Option value="SQL">SQL</Option>
              <Option value="Figma">Figma</Option>
              <Option value="Photoshop">Photoshop</Option>
              <Option value="Agile">Agile</Option>
              <Option value="Scrum">Scrum</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="설명"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <div className="form-footer">
            <Button onClick={() => setResourceModalVisible(false)}>
              취소
            </Button>
            <Button type="primary" htmlType="submit">
              {resourceFormMode === 'create' ? '추가' : '저장'}
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* 리소스 상세 정보 드로어 */}
      <Drawer
        title={selectedResource?.name}
        width={700}
        placement="right"
        onClose={() => setDetailDrawerVisible(false)}
        visible={detailDrawerVisible}
        extra={
          <Space>
            <Button 
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerVisible(false);
                openResourceModal('edit', selectedResource);
              }}
            >
              편집
            </Button>
          </Space>
        }
      >
        {selectedResource && (
          <div className="resource-detail">
            <div className="detail-header">
              <div className="profile-section">
                <Avatar
                  size={80}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <Title level={3}>{selectedResource.name}</Title>
                  <div>
                    {(() => {
                      const type = resourceTypes.find(t => t.id === selectedResource.type);
                      const department = departments.find(d => d.id === selectedResource.department);
                      return (
                        <Space direction="vertical" size={0}>
                          <Text>{type?.name || '미지정'}</Text>
                          <Text type="secondary">{department?.name || '미지정'}</Text>
                        </Space>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="contact-section">
                <div className="contact-item">
                  <MailOutlined /> <Text>{selectedResource.email}</Text>
                </div>
                {selectedResource.phone && (
                  <div className="contact-item">
                    <PhoneOutlined /> <Text>{selectedResource.phone}</Text>
                  </div>
                )}
                {selectedResource.location && (
                  <div className="contact-item">
                    <EnvironmentOutlined /> <Text>{selectedResource.location}</Text>
                  </div>
                )}
              </div>
            </div>
            
            <Divider />
            
            <div className="stats-section">
              <Row gutter={16}>
                <Col span={8}>
                  <Card className="stat-card">
                    <Statistic
                      title="부하율"
                      value={selectedResource.utilization}
                      suffix="%"
                      valueStyle={{
                        color: selectedResource.utilization > 100 ? '#cf1322' :
                              selectedResource.utilization > 80 ? '#faad14' : '#3f8600'
                      }}
                    />
                    <LoadGauge 
                      value={selectedResource.utilization} 
                      capacity={selectedResource.capacity}
                      size={60}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className="stat-card">
                    <Statistic
                      title="가용 시간"
                      value={selectedResource.capacity}
                      suffix="시간/주"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card className="stat-card">
                    <Statistic
                      title="시간당 비용"
                      value={selectedResource.costRate}
                      prefix="₩"
                      formatter={value => `${value.toLocaleString()}`}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
            
            <div className="availability-section">
              <Title level={4}>가용 기간</Title>
              <div className="availability-dates">
                <Badge status="processing" />
                <Text>{selectedResource.availableFrom} ~ {selectedResource.availableTo}</Text>
              </div>
            </div>
            
            <div className="skills-section">
              <Title level={4}>역량 및 기술</Title>
              <div className="skills-tags">
                {selectedResource.skills.map(skill => (
                  <Tag key={skill} color="blue" className="skill-tag">{skill}</Tag>
                ))}
              </div>
            </div>
            
            {selectedResource.description && (
              <div className="description-section">
                <Title level={4}>설명</Title>
                <Paragraph>{selectedResource.description}</Paragraph>
              </div>
            )}
            
            <Divider />
            
            <Tabs defaultActiveKey="assignments">
              <TabPane 
                tab={
                  <span>
                    <CalendarOutlined /> 작업 할당
                  </span>
                } 
                key="assignments"
              >
                <div className="assignments-section">
                  {mockAssignments.filter(a => a.resourceId === selectedResource.id).length > 0 ? (
                    <Table
                      columns={[
                        {
                          title: '작업명',
                          dataIndex: 'taskName',
                          key: 'taskName'
                        },
                        {
                          title: '프로젝트',
                          dataIndex: 'projectName',
                          key: 'projectName',
                          width: 150
                        },
                        {
                          title: '기간',
                          key: 'period',
                          width: 180,
                          render: (_, record) => `${record.startDate} ~ ${record.endDate}`
                        },
                        {
                          title: '부하',
                          dataIndex: 'workload',
                          key: 'workload',
                          width: 80,
                          render: workload => `${workload}h`
                        }
                      ]}
                      dataSource={mockAssignments.filter(a => a.resourceId === selectedResource.id)}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Alert
                      message="할당된 작업이 없습니다"
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <BarChartOutlined /> 부하 추세
                  </span>
                } 
                key="load"
              >
                <div className="load-trends-section">
                  {mockMonthlyLoads[selectedResource.id] ? (
                    <ResourceLoadChart 
                      resources={[selectedResource]}
                      monthlyData={{
                        [selectedResource.id]: mockMonthlyLoads[selectedResource.id]
                      }}
                      type="trend"
                      height={300}
                    />
                  ) : (
                    <Alert
                      message="부하 추세 데이터가 없습니다"
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <FileTextOutlined /> 문서 및 평가
                  </span>
                } 
                key="documents"
              >
                <div className="documents-section">
                  <Alert
                    message="준비 중인 기능입니다"
                    description="향후 업데이트에서 리소스 관련 문서 및 성과 평가 정보를 제공할 예정입니다."
                    type="info"
                    showIcon
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ResourceManagement;