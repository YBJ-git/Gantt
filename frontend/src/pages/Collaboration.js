import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Tabs, 
  List, 
  Avatar, 
  Badge, 
  Button, 
  Input, 
  Space, 
  Typography, 
  Tag, 
  Dropdown,
  Menu,
  Modal,
  Form,
  Select,
  Divider,
  Switch,
  Alert,
  Empty,
  Table,
  Tooltip
} from 'antd';
import {
  MessageOutlined,
  BellOutlined,
  TeamOutlined,
  UserOutlined,
  FilterOutlined,
  SearchOutlined,
  SettingOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  MailOutlined,
  GlobalOutlined,
  PushpinOutlined,
  BulbOutlined,
  WarningOutlined,
  SyncOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useNotifications } from '../contexts/NotificationContext';
import './Collaboration.scss';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const Collaboration = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [notificationSettingsVisible, setNotificationSettingsVisible] = useState(false);
  const [newMessageVisible, setNewMessageVisible] = useState(false);
  const [newTeamVisible, setNewTeamVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  
  // 알림 설정 상태
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    browser: true,
    taskAssignment: true,
    taskCompletion: true,
    resourceOverload: true,
    deadlineApproaching: true,
    optimizationCompleted: true
  });
  
  // 컨텍스트에서 알림 가져오기
  const notificationContext = useNotifications();
  
  // 더미 데이터
  const mockNotifications = [
    {
      id: 1,
      type: 'warning',
      title: '작업 부하 경고',
      message: '개발자 C의 작업 부하가 임계치를 초과했습니다.',
      timestamp: new Date().getTime() - 3600000,
      read: false,
      link: '/resources/3',
      importance: 'high'
    },
    {
      id: 2,
      type: 'info',
      title: '최적화 완료',
      message: '작업 부하 최적화가 성공적으로 완료되었습니다.',
      timestamp: new Date().getTime() - 7200000,
      read: false,
      link: '/optimization',
      importance: 'medium'
    },
    {
      id: 3,
      type: 'success',
      title: '작업 완료',
      message: 'DB 모델링 작업이 완료되었습니다.',
      timestamp: new Date().getTime() - 86400000,
      read: true,
      link: '/tasks/103',
      importance: 'normal'
    },
    {
      id: 4,
      type: 'info',
      title: '작업 할당',
      message: '프론트엔드 개발 작업이 홍길동에게 할당되었습니다.',
      timestamp: new Date().getTime() - 172800000,
      read: true,
      link: '/tasks/101',
      importance: 'normal'
    },
    {
      id: 5,
      type: 'warning',
      title: '마감 임박',
      message: 'UI 디자인 작업의 마감일이 3일 남았습니다.',
      timestamp: new Date().getTime() - 259200000,
      read: true,
      link: '/tasks/104',
      importance: 'high'
    }
  ];
  
  const mockMessages = [
    {
      id: 1,
      sender: { id: 2, name: '김철수', avatar: null },
      content: 'API 개발 작업에 도움이 필요합니다. 금요일에 시간 되시나요?',
      timestamp: new Date().getTime() - 3600000,
      read: false,
      taskId: 107,
      taskName: 'API 개발'
    },
    {
      id: 2,
      sender: { id: 4, name: '이지은', avatar: null },
      content: 'UI 디자인 완료했습니다. 검토 부탁드립니다.',
      timestamp: new Date().getTime() - 86400000,
      read: true,
      taskId: 104,
      taskName: 'UI 디자인'
    },
    {
      id: 3,
      sender: { id: 6, name: '정영희', avatar: null },
      content: '테스트 자동화 관련해서 회의가 필요합니다. 내일 오전 10시에 가능하신가요?',
      timestamp: new Date().getTime() - 172800000,
      read: true,
      taskId: 105,
      taskName: '테스트 자동화'
    }
  ];
  
  const mockTeams = [
    {
      id: 1,
      name: '개발팀',
      description: '프론트엔드 및 백엔드 개발 담당 팀',
      members: [
        { id: 1, name: '홍길동', role: '팀장', avatar: null },
        { id: 2, name: '김철수', role: '개발자', avatar: null },
        { id: 3, name: '박지원', role: '개발자', avatar: null }
      ],
      tasks: [
        { id: 101, name: '프론트엔드 개발', status: 'in-progress' },
        { id: 102, name: '백엔드 개발', status: 'in-progress' },
        { id: 103, name: 'DB 모델링', status: 'completed' },
        { id: 107, name: 'API 개발', status: 'planned' }
      ]
    },
    {
      id: 2,
      name: '디자인팀',
      description: 'UI/UX 디자인 담당 팀',
      members: [
        { id: 4, name: '이지은', role: '팀장', avatar: null },
        { id: 5, name: '최민수', role: '디자이너', avatar: null }
      ],
      tasks: [
        { id: 104, name: 'UI 디자인', status: 'completed' },
        { id: 106, name: 'UX 개선', status: 'in-progress' }
      ]
    },
    {
      id: 3,
      name: 'QA팀',
      description: '품질 보증 및 테스트 담당 팀',
      members: [
        { id: 6, name: '정영희', role: '팀장', avatar: null }
      ],
      tasks: [
        { id: 105, name: '테스트 자동화', status: 'planned' },
        { id: 108, name: '통합 테스트', status: 'planned' }
      ]
    }
  ];
  
  useEffect(() => {
    // 실제 구현에서는 API 호출
    setTimeout(() => {
      setNotifications(mockNotifications);
      setMessages(mockMessages);
      setTeams(mockTeams);
      setLoading(false);
    }, 1000);
  }, []);
  
  // 알림 읽음 표시
  const markNotificationAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };
  
  // 메시지 읽음 표시
  const markMessageAsRead = (id) => {
    setMessages(prevMessages =>
      prevMessages.map(message =>
        message.id === id ? { ...message, read: true } : message
      )
    );
  };
  
  // 선택된 항목 삭제
  const deleteSelectedItems = () => {
    if (activeTab === 'notifications') {
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => !selectedItems.includes(notification.id))
      );
    } else if (activeTab === 'messages') {
      setMessages(prevMessages =>
        prevMessages.filter(message => !selectedItems.includes(message.id))
      );
    }
    
    setSelectedItems([]);
  };
  
  // 모든 항목 읽음 표시
  const markAllAsRead = () => {
    if (activeTab === 'notifications') {
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } else if (activeTab === 'messages') {
      setMessages(prevMessages =>
        prevMessages.map(message => ({ ...message, read: true }))
      );
    }
  };
  
  // 선택 항목 토글
  const toggleSelect = (id) => {
    setSelectedItems(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(itemId => itemId !== id)
        : [...prevSelected, id]
    );
  };
  
  // 모든 항목 선택/해제
  const toggleSelectAll = () => {
    if (activeTab === 'notifications') {
      if (selectedItems.length === notifications.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(notifications.map(notification => notification.id));
      }
    } else if (activeTab === 'messages') {
      if (selectedItems.length === messages.length) {
        setSelectedItems([]);
      } else {
        setSelectedItems(messages.map(message => message.id));
      }
    }
  };
  
  // 알림 설정 변경
  const handleSettingChange = (key, value) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: value
    });
  };
  
  // 알림 타입에 따른 아이콘 반환
  const getNotificationIcon = (type, importance) => {
    const color = importance === 'high' ? 'red' : 
                importance === 'medium' ? 'orange' : 'blue';
                
    switch (type) {
      case 'warning':
        return <WarningOutlined style={{ color }} />;
      case 'success':
        return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <BellOutlined style={{ color: '#1890ff' }} />;
    }
  };
  
  // 팀 선택
  const handleTeamSelect = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    setSelectedTeam(team);
  };
  
  // 필터링된 알림 가져오기
  const getFilteredNotifications = () => {
    return notifications.filter(notification =>
      searchText ? 
        notification.title.toLowerCase().includes(searchText.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchText.toLowerCase())
      : true
    );
  };
  
  // 필터링된 메시지 가져오기
  const getFilteredMessages = () => {
    return messages.filter(message =>
      searchText ? 
        message.sender.name.toLowerCase().includes(searchText.toLowerCase()) ||
        message.content.toLowerCase().includes(searchText.toLowerCase()) ||
        message.taskName.toLowerCase().includes(searchText.toLowerCase())
      : true
    );
  };
  
  const actionsMenu = (
    <Menu>
      <Menu.Item key="read" icon={<CheckOutlined />} onClick={markAllAsRead}>
        모두 읽음 표시
      </Menu.Item>
      <Menu.Item 
        key="delete" 
        icon={<DeleteOutlined />} 
        onClick={deleteSelectedItems}
        disabled={selectedItems.length === 0}
      >
        선택 항목 삭제
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item 
        key="settings" 
        icon={<SettingOutlined />}
        onClick={() => setNotificationSettingsVisible(true)}
      >
        알림 설정
      </Menu.Item>
    </Menu>
  );
  
  const renderTeamTabs = () => {
    return teams.map(team => (
      <TabPane 
        tab={
          <span>
            <TeamOutlined /> {team.name}
          </span>
        } 
        key={`team-${team.id}`}
      >
        <div className="team-content">
          {selectedTeam && selectedTeam.id === team.id && renderTeamDetails()}
        </div>
      </TabPane>
    ));
  };
  
  const renderTeamDetails = () => {
    if (!selectedTeam) return null;
    
    return (
      <div className="team-details">
        <div className="team-header">
          <div className="team-info">
            <Title level={4}>{selectedTeam.name}</Title>
            <Text type="secondary">{selectedTeam.description}</Text>
          </div>
          <div className="team-actions">
            <Button>팀 메시지 보내기</Button>
          </div>
        </div>
        
        <Divider />
        
        <Tabs defaultActiveKey="members">
          <TabPane tab="팀원" key="members">
            <div className="team-members">
              <List
                dataSource={selectedTeam.members}
                renderItem={member => (
                  <List.Item actions={[
                    <Button type="link" key="message">메시지</Button>,
                    <Button type="link" key="profile">프로필</Button>
                  ]}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={member.name}
                      description={member.role}
                    />
                  </List.Item>
                )}
              />
            </div>
          </TabPane>
          
          <TabPane tab="작업" key="tasks">
            <div className="team-tasks">
              <Table
                dataSource={selectedTeam.tasks}
                rowKey="id"
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 70
                  },
                  {
                    title: '작업명',
                    dataIndex: 'name',
                    key: 'name'
                  },
                  {
                    title: '상태',
                    dataIndex: 'status',
                    key: 'status',
                    width: 120,
                    render: status => {
                      let color = 'default';
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
                    }
                  },
                  {
                    title: '작업',
                    key: 'actions',
                    width: 120,
                    render: (_, record) => (
                      <Space>
                        <Button type="link" size="small">상세</Button>
                        <Button type="link" size="small">댓글</Button>
                      </Space>
                    )
                  }
                ]}
                pagination={false}
                size="small"
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div className="collaboration-page">
      <div className="page-header">
        <Title level={2}>협업 및 알림</Title>
        <Text type="secondary">
          팀 협업, 메시지 및 알림을 관리합니다.
        </Text>
      </div>
      
      <Card className="collaboration-card">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <BellOutlined /> 
                알림
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge 
                    count={notifications.filter(n => !n.read).length} 
                    size="small" 
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            } 
            key="notifications"
          >
            <div className="tab-header">
              <div className="tab-header-left">
                <Input
                  placeholder="알림 검색"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
              </div>
              <div className="tab-header-right">
                <Space>
                  <Button 
                    type={selectedItems.length > 0 ? 'primary' : 'default'}
                    onClick={toggleSelectAll}
                  >
                    {selectedItems.length === notifications.length ? '모두 해제' : '모두 선택'}
                  </Button>
                  <Dropdown overlay={actionsMenu} placement="bottomRight">
                    <Button icon={<SettingOutlined />}>
                      작업 <DownOutlined />
                    </Button>
                  </Dropdown>
                </Space>
              </div>
            </div>
            
            <div className="notifications-list">
              {loading ? (
                <div className="loading-container">로딩 중...</div>
              ) : getFilteredNotifications().length > 0 ? (
                <List
                  dataSource={getFilteredNotifications()}
                  renderItem={notification => (
                    <div 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="item-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(notification.id)} 
                          onChange={() => toggleSelect(notification.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="item-icon">
                        {getNotificationIcon(notification.type, notification.importance)}
                      </div>
                      <div className="item-content">
                        <div className="item-title">
                          {notification.title}
                          {!notification.read && <div className="unread-indicator" />}
                        </div>
                        <div className="item-message">{notification.message}</div>
                        <div className="item-time">
                          {moment(notification.timestamp).fromNow()}
                        </div>
                      </div>
                      <div className="item-actions">
                        <Button type="link" size="small">자세히</Button>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <Empty description="알림이 없습니다" />
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <MessageOutlined /> 
                메시지
                {messages.filter(m => !m.read).length > 0 && (
                  <Badge 
                    count={messages.filter(m => !m.read).length} 
                    size="small" 
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            } 
            key="messages"
          >
            <div className="tab-header">
              <div className="tab-header-left">
                <Input
                  placeholder="메시지 검색"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
              </div>
              <div className="tab-header-right">
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setNewMessageVisible(true)}
                  >
                    새 메시지
                  </Button>
                  <Button 
                    type={selectedItems.length > 0 ? 'primary' : 'default'}
                    onClick={toggleSelectAll}
                  >
                    {selectedItems.length === messages.length ? '모두 해제' : '모두 선택'}
                  </Button>
                  <Dropdown overlay={actionsMenu} placement="bottomRight">
                    <Button icon={<SettingOutlined />}>
                      작업 <DownOutlined />
                    </Button>
                  </Dropdown>
                </Space>
              </div>
            </div>
            
            <div className="messages-list">
              {loading ? (
                <div className="loading-container">로딩 중...</div>
              ) : getFilteredMessages().length > 0 ? (
                <List
                  dataSource={getFilteredMessages()}
                  renderItem={message => (
                    <div 
                      className={`message-item ${message.read ? 'read' : 'unread'}`}
                      onClick={() => markMessageAsRead(message.id)}
                    >
                      <div className="item-checkbox">
                        <input 
                          type="checkbox" 
                          checked={selectedItems.includes(message.id)} 
                          onChange={() => toggleSelect(message.id)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="item-avatar">
                        <Avatar icon={<UserOutlined />} />
                      </div>
                      <div className="item-content">
                        <div className="item-sender">
                          {message.sender.name}
                          {!message.read && <div className="unread-indicator" />}
                        </div>
                        <div className="item-snippet">{message.content}</div>
                        <div className="item-task">
                          <Tag color="blue">{message.taskName}</Tag>
                        </div>
                        <div className="item-time">
                          {moment(message.timestamp).fromNow()}
                        </div>
                      </div>
                      <div className="item-actions">
                        <Space>
                          <Button type="link" size="small">답장</Button>
                          <Button type="link" size="small">태스크 보기</Button>
                        </Space>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <Empty description="메시지가 없습니다" />
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <TeamOutlined /> 팀
              </span>
            } 
            key="teams"
          >
            <div className="tab-header">
              <div className="tab-header-left">
                <Input
                  placeholder="팀 검색"
                  prefix={<SearchOutlined />}
                  style={{ width: 250 }}
                  allowClear
                />
              </div>
              <div className="tab-header-right">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setNewTeamVisible(true)}
                >
                  새 팀 만들기
                </Button>
              </div>
            </div>
            
            <div className="teams-content">
              <Row gutter={16}>
                <Col span={8}>
                  <Card title="팀 목록" className="teams-list-card">
                    <List
                      dataSource={teams}
                      renderItem={team => (
                        <div 
                          className={`team-list-item ${selectedTeam && selectedTeam.id === team.id ? 'selected' : ''}`}
                          onClick={() => handleTeamSelect(team.id)}
                        >
                          <div className="team-list-icon">
                            <Avatar icon={<TeamOutlined />} />
                          </div>
                          <div className="team-list-content">
                            <div className="team-list-name">{team.name}</div>
                            <div className="team-list-meta">
                              {team.members.length} 팀원 · {team.tasks.length} 작업
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  </Card>
                </Col>
                
                <Col span={16}>
                  <Card className="team-details-card">
                    {selectedTeam ? (
                      renderTeamDetails()
                    ) : (
                      <div className="team-placeholder">
                        <Empty description="팀을 선택하세요" />
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 알림 설정 모달 */}
      <Modal
        title="알림 설정"
        visible={notificationSettingsVisible}
        onCancel={() => setNotificationSettingsVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setNotificationSettingsVisible(false)}>
            취소
          </Button>,
          <Button key="save" type="primary" onClick={() => setNotificationSettingsVisible(false)}>
            저장
          </Button>
        ]}
      >
        <div className="notification-settings">
          <div className="settings-section">
            <Title level={5}>알림 채널</Title>
            <div className="settings-option">
              <div className="option-label">
                <MailOutlined /> <Text>이메일 알림</Text>
              </div>
              <Switch
                checked={notificationSettings.email}
                onChange={value => handleSettingChange('email', value)}
              />
            </div>
            <div className="settings-option">
              <div className="option-label">
                <GlobalOutlined /> <Text>브라우저 알림</Text>
              </div>
              <Switch
                checked={notificationSettings.browser}
                onChange={value => handleSettingChange('browser', value)}
              />
            </div>
          </div>
          
          <Divider />
          
          <div className="settings-section">
            <Title level={5}>알림 유형</Title>
            <div className="settings-option">
              <div className="option-label">
                <Text>작업 할당</Text>
              </div>
              <Switch
                checked={notificationSettings.taskAssignment}
                onChange={value => handleSettingChange('taskAssignment', value)}
              />
            </div>
            <div className="settings-option">
              <div className="option-label">
                <Text>작업 완료</Text>
              </div>
              <Switch
                checked={notificationSettings.taskCompletion}
                onChange={value => handleSettingChange('taskCompletion', value)}
              />
            </div>
            <div className="settings-option">
              <div className="option-label">
                <Text>리소스 과부하</Text>
              </div>
              <Switch
                checked={notificationSettings.resourceOverload}
                onChange={value => handleSettingChange('resourceOverload', value)}
              />
            </div>
            <div className="settings-option">
              <div className="option-label">
                <Text>마감일 임박</Text>
              </div>
              <Switch
                checked={notificationSettings.deadlineApproaching}
                onChange={value => handleSettingChange('deadlineApproaching', value)}
              />
            </div>
            <div className="settings-option">
              <div className="option-label">
                <Text>최적화 완료</Text>
              </div>
              <Switch
                checked={notificationSettings.optimizationCompleted}
                onChange={value => handleSettingChange('optimizationCompleted', value)}
              />
            </div>
          </div>
        </div>
      </Modal>
      
      {/* 새 메시지 모달 */}
      <Modal
        title="새 메시지"
        visible={newMessageVisible}
        onCancel={() => setNewMessageVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setNewMessageVisible(false)}>
            취소
          </Button>,
          <Button key="send" type="primary" onClick={() => setNewMessageVisible(false)}>
            보내기
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="받는 사람" required>
            <Select
              mode="multiple"
              placeholder="받는 사람 선택"
              style={{ width: '100%' }}
            >
              {/* 모든 팀원 목록 */}
              {teams.flatMap(team => team.members).map(member => (
                <Option key={member.id} value={member.id}>
                  {member.name} ({teams.find(t => t.members.find(m => m.id === member.id))?.name})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="관련 작업">
            <Select
              placeholder="관련 작업 선택"
              style={{ width: '100%' }}
              allowClear
            >
              {/* 모든 작업 목록 */}
              {teams.flatMap(team => team.tasks).map(task => (
                <Option key={task.id} value={task.id}>
                  {task.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="메시지" required>
            <TextArea rows={4} placeholder="메시지 내용을 입력하세요" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 새 팀 모달 */}
      <Modal
        title="새 팀 만들기"
        visible={newTeamVisible}
        onCancel={() => setNewTeamVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setNewTeamVisible(false)}>
            취소
          </Button>,
          <Button key="create" type="primary" onClick={() => setNewTeamVisible(false)}>
            팀 생성
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="팀 이름" required>
            <Input placeholder="팀 이름 입력" />
          </Form.Item>
          
          <Form.Item label="설명">
            <TextArea rows={3} placeholder="팀 설명 입력" />
          </Form.Item>
          
          <Form.Item label="팀원" required>
            <Select
              mode="multiple"
              placeholder="팀원 선택"
              style={{ width: '100%' }}
            >
              {teams.flatMap(team => team.members).map(member => (
                <Option key={member.id} value={member.id}>
                  {member.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Collaboration;