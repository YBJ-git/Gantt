import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Tag, 
  Tooltip, 
  Modal,
  Form,
  InputNumber,
  Drawer,
  Typography,
  Tabs,
  Divider,
  Progress,
  Timeline,
  Badge,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  FilterOutlined,
  SyncOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ToolOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import moment from 'moment';
// SCSS 파일 임포트
import './TaskManagement.scss';

// Placeholder 컴포넌트 - 실제 구현 전까지 빈 컴포넌트로 대체
const TaskGanttChart = () => <div>간트 차트 (데모용 플레이스홀더)</div>;
const TaskDependencyGraph = () => <div>의존성 그래프 (데모용 플레이스홀더)</div>;
const TaskKanbanBoard = () => <div>칸반 보드 (데모용 플레이스홀더)</div>;

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const TaskManagement = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  
  // 필터 상태
  const [filters, setFilters] = useState({
    status: [],
    resourceId: [],
    priority: [],
    dateRange: [null, null],
    searchText: ''
  });
  
  // 모달 상태
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskFormMode, setTaskFormMode] = useState('create'); // 'create' or 'edit'
  const [currentTask, setCurrentTask] = useState(null);
  const [taskForm] = Form.useForm();
  
  // 드로어 상태
  const [taskDetailDrawerVisible, setTaskDetailDrawerVisible] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  
  // 더미 데이터
  const resources = [
    { id: 1, name: '개발자 A' },
    { id: 2, name: '개발자 B' },
    { id: 3, name: '개발자 C' },
    { id: 4, name: '디자이너 A' },
    { id: 5, name: '디자이너 B' },
    { id: 6, name: 'QA 엔지니어 A' }
  ];
  
  const projects = [
    { id: 1, name: '웹사이트 리뉴얼' },
    { id: 2, name: '모바일 앱 개발' },
    { id: 3, name: '데이터 분석 시스템' }
  ];
  
  const mockTasks = [
    { 
      id: 101, 
      name: '프론트엔드 개발', 
      resourceId: 1, 
      projectId: 1,
      startDate: '2025-05-10', 
      endDate: '2025-05-20', 
      workload: 37,
      status: 'in-progress',
      priority: 'high',
      progress: 65,
      dependencies: [102],
      description: '웹사이트의 사용자 인터페이스 및 프론트엔드 기능 개발.'
    },
    { 
      id: 102, 
      name: '백엔드 개발', 
      resourceId: 2, 
      projectId: 1,
      startDate: '2025-05-12', 
      endDate: '2025-05-25', 
      workload: 18,
      status: 'in-progress',
      priority: 'medium',
      progress: 30,
      dependencies: [],
      description: '웹사이트 백엔드 API 및 데이터베이스 연동 개발.'
    },
    { 
      id: 103, 
      name: 'DB 모델링', 
      resourceId: 3, 
      projectId: 1,
      startDate: '2025-05-08', 
      endDate: '2025-05-15', 
      workload: 45,
      status: 'completed',
      priority: 'high',
      progress: 100,
      dependencies: [],
      description: '데이터베이스 스키마 및 모델 설계.'
    }
  ];
  
  // 작업 히스토리 더미 데이터
  const mockTaskHistory = [
    { 
      id: 1, 
      taskId: 101, 
      action: 'created', 
      timestamp: '2025-05-01T10:30:00',
      user: '홍길동',
      details: '작업이 생성되었습니다.'
    },
    { 
      id: 2, 
      taskId: 101, 
      action: 'updated', 
      timestamp: '2025-05-05T14:15:00',
      user: '김철수',
      details: '작업 기간이 변경되었습니다. (2025-05-08 ~ 2025-05-18) → (2025-05-10 ~ 2025-05-20)'
    },
    { 
      id: 3, 
      taskId: 101, 
      action: 'progress', 
      timestamp: '2025-05-12T09:45:00',
      user: '홍길동',
      details: '진행률이 업데이트되었습니다. 30% → 65%'
    }
  ];
  
  // 댓글 더미 데이터
  const mockTaskComments = [
    {
      id: 1,
      taskId: 101,
      user: '홍길동',
      timestamp: '2025-05-12T10:30:00',
      content: '디자인 가이드라인에 맞게 구현 중입니다.'
    },
    {
      id: 2,
      taskId: 101,
      user: '김철수',
      timestamp: '2025-05-12T11:15:00',
      content: '관련 라이브러리 버전 이슈가 있으니 확인해주세요.'
    },
    {
      id: 3,
      taskId: 101,
      user: '이영희',
      timestamp: '2025-05-13T09:00:00',
      content: '모바일 반응형 구현도 포함하나요?'
    }
  ];
  
  useEffect(() => {
    // 더미 데이터 로드
    setTimeout(() => {
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 필터 변경 처리
  useEffect(() => {
    let result = [...tasks];
    
    // 상태 필터
    if (filters.status.length > 0) {
      result = result.filter(task => filters.status.includes(task.status));
    }
    
    // 리소스 필터
    if (filters.resourceId.length > 0) {
      result = result.filter(task => filters.resourceId.includes(task.resourceId));
    }
    
    // 우선순위 필터
    if (filters.priority.length > 0) {
      result = result.filter(task => filters.priority.includes(task.priority));
    }
    
    // 날짜 범위 필터
    if (filters.dateRange[0] && filters.dateRange[1]) {
      const startDate = filters.dateRange[0].format('YYYY-MM-DD');
      const endDate = filters.dateRange[1].format('YYYY-MM-DD');
      
      result = result.filter(task => {
        const taskStart = task.startDate;
        const taskEnd = task.endDate;
        
        return (
          (taskStart >= startDate && taskStart <= endDate) ||
          (taskEnd >= startDate && taskEnd <= endDate) ||
          (taskStart <= startDate && taskEnd >= endDate)
        );
      });
    }
    
    // 검색어 필터
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter(task =>
        task.name.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTasks(result);
  }, [filters, tasks]);
  
  // 작업 추가/편집 모달 열기
  const openTaskModal = (mode, task = null) => {
    setTaskFormMode(mode);
    setCurrentTask(task);
    
    if (mode === 'edit' && task) {
      taskForm.setFieldsValue({
        name: task.name,
        resourceId: task.resourceId,
        projectId: task.projectId,
        startDate: moment(task.startDate),
        endDate: moment(task.endDate),
        workload: task.workload,
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        description: task.description,
        dependencies: task.dependencies
      });
    } else {
      taskForm.resetFields();
    }
    
    setTaskModalVisible(true);
  };
  
  // 작업 추가/편집 제출 처리
  const handleTaskFormSubmit = (values) => {
    if (taskFormMode === 'create') {
      const newTask = {
        id: Date.now(),
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        dependencies: values.dependencies || []
      };
      
      setTasks([...tasks, newTask]);
      message.success('작업이 생성되었습니다.');
    } else {
      const updatedTask = {
        ...currentTask,
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
        dependencies: values.dependencies || []
      };
      
      setTasks(tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      message.success('작업이 업데이트되었습니다.');
    }
    
    setTaskModalVisible(false);
  };
  
  // 작업 삭제 처리
  const handleDeleteTask = (taskId) => {
    Modal.confirm({
      title: '작업 삭제',
      content: '이 작업을 삭제하시겠습니까? 이 작업은 다른 작업의 의존성으로 사용될 수 있습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk() {
        setTasks(tasks.filter(task => task.id !== taskId));
        message.success('작업이 삭제되었습니다.');
      }
    });
  };
  
  // 작업 상세 정보 보기
  const openTaskDetail = (task) => {
    setSelectedTaskDetail(task);
    setTaskDetailDrawerVisible(true);
  };
  
  // 댓글 추가 핸들러
  const handleAddComment = (values) => {
    message.success('댓글이 추가되었습니다.');
  };
  
  // 테이블 컬럼 설정
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: '작업명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => openTaskDetail(record)}>
          {text}
        </Button>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: status => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'planned':
            color = 'default';
            text = '계획됨';
            break;
          case 'in-progress':
            color = 'processing';
            text = '진행 중';
            break;
          case 'completed':
            color = 'success';
            text = '완료됨';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '계획됨', value: 'planned' },
        { text: '진행 중', value: 'in-progress' },
        { text: '완료됨', value: 'completed' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '담당자',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 120,
      render: resourceId => {
        const resource = resources.find(r => r.id === resourceId);
        return resource ? resource.name : '미할당';
      },
      filters: resources.map(resource => ({
        text: resource.name,
        value: resource.id
      })),
      onFilter: (value, record) => record.resourceId === value
    },
    {
      title: '프로젝트',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 150,
      render: projectId => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.name : '미지정';
      },
      filters: projects.map(project => ({
        text: project.name,
        value: project.id
      })),
      onFilter: (value, record) => record.projectId === value
    },
    {
      title: '우선순위',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: priority => {
        let color = '';
        let text = '';
        
        switch (priority) {
          case 'low':
            color = 'blue';
            text = '낮음';
            break;
          case 'medium':
            color = 'orange';
            text = '중간';
            break;
          case 'high':
            color = 'red';
            text = '높음';
            break;
          default:
            color = 'default';
            text = priority;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '낮음', value: 'low' },
        { text: '중간', value: 'medium' },
        { text: '높음', value: 'high' }
      ],
      onFilter: (value, record) => record.priority === value
    },
    {
      title: '기간',
      key: 'period',
      width: 180,
      render: (text, record) => `${record.startDate} ~ ${record.endDate}`,
      sorter: (a, b) => moment(a.startDate).diff(moment(b.startDate))
    },
    {
      title: '진행률',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: progress => (
        <Progress percent={progress} size="small" />
      ),
      sorter: (a, b) => a.progress - b.progress
    },
    {
      title: '부하',
      dataIndex: 'workload',
      key: 'workload',
      width: 80,
      render: workload => `${workload}h`,
      sorter: (a, b) => a.workload - b.workload
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
              onClick={() => openTaskModal('edit', record)}
            />
          </Tooltip>
          <Tooltip title="삭제">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteTask(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];
  
  // 상태 표시 뱃지 렌더링
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'planned':
        return <Badge status="default" text="계획됨" />;
      case 'in-progress':
        return <Badge status="processing" text="진행 중" />;
      case 'completed':
        return <Badge status="success" text="완료됨" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };
  
  return (
    <div className="task-management-page">
      <div className="page-header">
        <div className="header-left">
          <Title level={2}>작업 관리</Title>
          <Text type="secondary">
            프로젝트 작업을 관리하고 리소스에 할당합니다.
          </Text>
        </div>
        <div className="header-right">
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openTaskModal('create')}
            >
              작업 추가
            </Button>
          </Space>
        </div>
      </div>
      
      {/* 필터 영역 */}
      <Card className="filter-card">
        <div className="filter-section">
          <Space size="large">
            <Select
              mode="multiple"
              placeholder="상태 필터"
              style={{ width: 150 }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="planned">계획됨</Option>
              <Option value="in-progress">진행 중</Option>
              <Option value="completed">완료됨</Option>
            </Select>
            
            <Select
              mode="multiple"
              placeholder="담당자 필터"
              style={{ width: 150 }}
              value={filters.resourceId}
              onChange={(value) => setFilters({ ...filters, resourceId: value })}
              allowClear
            >
              {resources.map(resource => (
                <Option key={resource.id} value={resource.id}>
                  {resource.name}
                </Option>
              ))}
            </Select>
            
            <Select
              mode="multiple"
              placeholder="우선순위 필터"
              style={{ width: 150 }}
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
              allowClear
            >
              <Option value="low">낮음</Option>
              <Option value="medium">중간</Option>
              <Option value="high">높음</Option>
            </Select>
            
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: 240 }}
            />
            
            <Input.Search
              placeholder="작업 검색"
              style={{ width: 200 }}
              value={filters.searchText}
              onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              allowClear
            />
          </Space>
          
          <Space size="small">
            <Button
              icon={<SyncOutlined />}
              onClick={() => {
                setFilters({
                  status: [],
                  resourceId: [],
                  priority: [],
                  dateRange: [null, null],
                  searchText: ''
                });
              }}
              title="필터 초기화"
            >
              초기화
            </Button>
            
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 130 }}
            >
              <Option value="table">표 보기</Option>
              <Option value="gantt">간트 차트</Option>
              <Option value="kanban">칸반 보드</Option>
              <Option value="dependency">의존성 그래프</Option>
            </Select>
          </Space>
        </div>
      </Card>
      
      {/* 작업 목록 */}
      <Card className="task-list-card" bodyStyle={{ padding: 0 }}>
        {viewMode === 'table' && (
          <Table
            columns={columns}
            dataSource={filteredTasks}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
        
        {viewMode === 'gantt' && (
          <div className="gantt-view">
            <TaskGanttChart />
          </div>
        )}
        
        {viewMode === 'kanban' && (
          <div className="kanban-view">
            <TaskKanbanBoard />
          </div>
        )}
        
        {viewMode === 'dependency' && (
          <div className="dependency-view">
            <TaskDependencyGraph />
          </div>
        )}
      </Card>
      
      {/* 작업 추가/편집 모달 */}
      <Modal
        title={taskFormMode === 'create' ? '작업 추가' : '작업 편집'}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskFormSubmit}
        >
          <Form.Item
            name="name"
            label="작업명"
            rules={[{ required: true, message: '작업명을 입력해주세요' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="설명"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          
          <div className="form-row">
            <Form.Item
              name="resourceId"
              label="담당자"
              className="form-col"
              rules={[{ required: true, message: '담당자를 선택해주세요' }]}
            >
              <Select placeholder="담당자 선택">
                {resources.map(resource => (
                  <Option key={resource.id} value={resource.id}>
                    {resource.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="projectId"
              label="프로젝트"
              className="form-col"
              rules={[{ required: true, message: '프로젝트를 선택해주세요' }]}
            >
              <Select placeholder="프로젝트 선택">
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="startDate"
              label="시작일"
              className="form-col"
              rules={[{ required: true, message: '시작일을 선택해주세요' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="endDate"
              label="종료일"
              className="form-col"
              rules={[{ required: true, message: '종료일을 선택해주세요' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="status"
              label="상태"
              className="form-col"
              rules={[{ required: true, message: '상태를 선택해주세요' }]}
            >
              <Select placeholder="상태 선택">
                <Option value="planned">계획됨</Option>
                <Option value="in-progress">진행 중</Option>
                <Option value="completed">완료됨</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="priority"
              label="우선순위"
              className="form-col"
              rules={[{ required: true, message: '우선순위를 선택해주세요' }]}
            >
              <Select placeholder="우선순위 선택">
                <Option value="low">낮음</Option>
                <Option value="medium">중간</Option>
                <Option value="high">높음</Option>
              </Select>
            </Form.Item>
          </div>
          
          <div className="form-row">
            <Form.Item
              name="workload"
              label="작업 부하 (시간)"
              className="form-col"
              rules={[{ required: true, message: '작업 부하를 입력해주세요' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="progress"
              label="진행률 (%)"
              className="form-col"
              rules={[{ required: true, message: '진행률을 입력해주세요' }]}
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          
          <Form.Item
            name="dependencies"
            label="의존 작업"
          >
            <Select
              mode="multiple"
              placeholder="의존 작업 선택"
              style={{ width: '100%' }}
              optionFilterProp="children"
            >
              {tasks
                .filter(task => !currentTask || task.id !== currentTask.id)
                .map(task => (
                  <Option key={task.id} value={task.id}>
                    {task.name}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
          
          <div className="form-footer">
            <Button onClick={() => setTaskModalVisible(false)}>
              취소
            </Button>
            <Button type="primary" htmlType="submit">
              {taskFormMode === 'create' ? '추가' : '저장'}
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* 작업 상세 드로어 */}
      <Drawer
        title={selectedTaskDetail?.name}
        placement="right"
        width={600}
        onClose={() => setTaskDetailDrawerVisible(false)}
        open={taskDetailDrawerVisible}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => {
                setTaskDetailDrawerVisible(false);
                openTaskModal('edit', selectedTaskDetail);
              }}
            >
              편집
            </Button>
          </Space>
        }
      >
        {selectedTaskDetail && (
          <div className="task-detail-content">
            <div className="task-detail-header">
              <div className="status-badge">
                {renderStatusBadge(selectedTaskDetail.status)}
              </div>
              <Tag color={
                selectedTaskDetail.priority === 'high' ? 'red' :
                selectedTaskDetail.priority === 'medium' ? 'orange' : 'blue'
              }>
                {selectedTaskDetail.priority === 'high' ? '높음' :
                 selectedTaskDetail.priority === 'medium' ? '중간' : '낮음'}
              </Tag>
            </div>
            
            <Divider />
            
            <div className="task-detail-info">
              <div className="info-item">
                <div className="info-label">
                  <UserOutlined /> 담당자
                </div>
                <div className="info-value">
                  {resources.find(r => r.id === selectedTaskDetail.resourceId)?.name || '미할당'}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  <ApartmentOutlined /> 프로젝트
                </div>
                <div className="info-value">
                  {projects.find(p => p.id === selectedTaskDetail.projectId)?.name || '미지정'}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  <CalendarOutlined /> 기간
                </div>
                <div className="info-value">
                  {selectedTaskDetail.startDate} ~ {selectedTaskDetail.endDate}
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-label">
                  <ToolOutlined /> 부하
                </div>
                <div className="info-value">
                  {selectedTaskDetail.workload}시간
                </div>
              </div>
            </div>
            
            <div className="task-progress">
              <div className="progress-label">
                진행률: {selectedTaskDetail.progress}%
              </div>
              <Progress percent={selectedTaskDetail.progress} />
            </div>
            
            <Divider orientation="left">설명</Divider>
            <Paragraph>
              {selectedTaskDetail.description || '설명이 없습니다.'}
            </Paragraph>
            
            {/* 의존성 정보 */}
            <Divider orientation="left">의존 작업</Divider>
            {selectedTaskDetail.dependencies?.length > 0 ? (
              <div className="dependencies-list">
                {selectedTaskDetail.dependencies.map(depId => {
                  const depTask = tasks.find(t => t.id === depId);
                  return depTask ? (
                    <Tag key={depId} className="dependency-tag">
                      {depTask.name}
                    </Tag>
                  ) : null;
                })}
              </div>
            ) : (
              <Text type="secondary">의존 작업이 없습니다.</Text>
            )}
            
            <Tabs defaultActiveKey="history" style={{ marginTop: '20px' }}>
              <TabPane tab="작업 히스토리" key="history">
                <Timeline>
                  {mockTaskHistory
                    .filter(h => h.taskId === selectedTaskDetail.id)
                    .map(history => (
                      <Timeline.Item key={history.id}>
                        <div className="history-entry">
                          <div className="history-header">
                            <Text strong>{history.user}</Text>
                            <Text type="secondary">{moment(history.timestamp).format('YYYY-MM-DD HH:mm')}</Text>
                          </div>
                          <div className="history-content">
                            {history.details}
                          </div>
                        </div>
                      </Timeline.Item>
                    ))
                  }
                </Timeline>
              </TabPane>
              
              <TabPane tab="댓글" key="comments">
                <div className="comments-section">
                  {mockTaskComments
                    .filter(c => c.taskId === selectedTaskDetail.id)
                    .map(comment => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                          <Text strong>{comment.user}</Text>
                          <Text type="secondary">{moment(comment.timestamp).format('YYYY-MM-DD HH:mm')}</Text>
                        </div>
                        <div className="comment-content">
                          {comment.content}
                        </div>
                      </div>
                    ))
                  }
                  
                  <Divider />
                  
                  <Form onFinish={handleAddComment}>
                    <Form.Item name="content" rules={[{ required: true, message: '댓글 내용을 입력해주세요' }]}>
                      <Input.TextArea rows={3} placeholder="댓글 작성..." />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        댓글 추가
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TaskManagement;