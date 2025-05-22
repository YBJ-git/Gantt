import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Rate, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Divider,
  Card,
  Tag,
  Progress,
  Alert
} from 'antd';
import { 
  StarOutlined, 
  BugOutlined, 
  LightbulbOutlined, 
  HeartOutlined,
  SendOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import feedbackService from '../../services/feedbackService';
import './FeedbackModal.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const FeedbackModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [feedbackType, setFeedbackType] = useState('general');
  const [currentStep, setCurrentStep] = useState(1);
  const [userSatisfaction, setUserSatisfaction] = useState(0);
  
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // 피드백 타입 옵션
  const feedbackTypes = [
    {
      value: 'bug',
      label: '버그 신고',
      icon: <BugOutlined />,
      color: '#ff4d4f',
      description: '시스템 오류나 예상과 다른 동작을 신고해 주세요.'
    },
    {
      value: 'feature',
      label: '기능 제안',
      icon: <LightbulbOutlined />,
      color: '#1890ff',
      description: '새로운 기능이나 개선 사항을 제안해 주세요.'
    },
    {
      value: 'ui',
      label: 'UI/UX 개선',
      icon: <StarOutlined />,
      color: '#722ed1',
      description: '사용자 인터페이스나 사용성 개선을 제안해 주세요.'
    },
    {
      value: 'general',
      label: '일반 피드백',
      icon: <HeartOutlined />,
      color: '#52c41a',
      description: '시스템에 대한 전반적인 의견을 알려주세요.'
    }
  ];

  // 만족도 라벨
  const satisfactionLabels = {
    1: '매우 불만족',
    2: '불만족',
    3: '보통',
    4: '만족',
    5: '매우 만족'
  };

  // 우선순위 옵션
  const priorityOptions = [
    { value: 'low', label: '낮음', color: '#52c41a' },
    { value: 'medium', label: '보통', color: '#1890ff' },
    { value: 'high', label: '높음', color: '#fa8c16' },
    { value: 'urgent', label: '긴급', color: '#ff4d4f' }
  ];

  useEffect(() => {
    if (visible) {
      setCurrentStep(1);
      setUserSatisfaction(0);
      setFeedbackType('general');
      form.resetFields();
    }
  }, [visible, form]);

  // 피드백 제출
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const feedbackData = {
        ...values,
        type: feedbackType,
        satisfaction: userSatisfaction,
        userId: user.id,
        userInfo: {
          username: user.username,
          email: user.email,
          role: user.role
        },
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      await feedbackService.submitFeedback(feedbackData);
      
      addNotification({
        type: 'success',
        message: '피드백이 성공적으로 전송되었습니다.',
        description: '소중한 의견 감사합니다. 검토 후 반영하겠습니다.'
      });
      
      onClose();
    } catch (error) {
      console.error('피드백 전송 실패:', error);
      addNotification({
        type: 'error',
        message: '피드백 전송에 실패했습니다.',
        description: '잠시 후 다시 시도해 주세요.'
      });
    } finally {
      setLoading(false);
    }
  };

  // 다음 단계로 이동
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 이전 단계로 이동
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 1단계: 피드백 타입 선택
  const renderStepOne = () => (
    <div className="feedback-step-one">
      <Title level={4}>어떤 종류의 피드백을 보내시나요?</Title>
      <div className="feedback-types">
        {feedbackTypes.map(type => (
          <Card
            key={type.value}
            className={`feedback-type-card ${feedbackType === type.value ? 'selected' : ''}`}
            onClick={() => setFeedbackType(type.value)}
            hoverable
          >
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <div 
                className="feedback-type-icon"
                style={{ color: type.color, fontSize: 32 }}
              >
                {type.icon}
              </div>
              <Title level={5} style={{ margin: 0, color: type.color }}>
                {type.label}
              </Title>
              <Text type="secondary" style={{ textAlign: 'center' }}>
                {type.description}
              </Text>
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );

  // 2단계: 만족도 평가
  const renderStepTwo = () => (
    <div className="feedback-step-two">
      <Title level={4}>현재 시스템에 대한 만족도는 어떠신가요?</Title>
      <div className="satisfaction-rating">
        <Rate
          value={userSatisfaction}
          onChange={setUserSatisfaction}
          style={{ fontSize: 36 }}
          character={<StarOutlined />}
        />
        {userSatisfaction > 0 && (
          <Text strong style={{ fontSize: 16, marginTop: 16, display: 'block' }}>
            {satisfactionLabels[userSatisfaction]}
          </Text>
        )}
      </div>
      
      <Alert
        message="만족도 평가 안내"
        description="솔직한 평가는 시스템 개선에 큰 도움이 됩니다. 익명으로 처리되니 걱정하지 마세요."
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );

  // 3단계: 상세 피드백 작성
  const renderStepThree = () => (
    <div className="feedback-step-three">
      <Title level={4}>상세한 피드백을 작성해 주세요</Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="title"
          label="제목"
          rules={[{ required: true, message: '제목을 입력해 주세요.' }]}
        >
          <Input placeholder="피드백 제목을 간단히 요약해 주세요" />
        </Form.Item>

        <Form.Item
          name="description"
          label="설명"
          rules={[{ required: true, message: '설명을 입력해 주세요.' }]}
        >
          <TextArea
            rows={6}
            placeholder={
              feedbackType === 'bug'
                ? '버그가 발생한 상황과 재현 방법을 자세히 설명해 주세요.'
                : feedbackType === 'feature'
                ? '제안하는 기능과 그 이유를 설명해 주세요.'
                : feedbackType === 'ui'
                ? '개선이 필요한 UI/UX 요소와 개선 방안을 설명해 주세요.'
                : '시스템에 대한 전반적인 의견이나 제안을 자유롭게 작성해 주세요.'
            }
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="우선순위"
          initialValue="medium"
        >
          <Select>
            {priorityOptions.map(option => (
              <Option key={option.value} value={option.value}>
                <Tag color={option.color}>{option.label}</Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="reproductionSteps"
          label="재현 단계 (버그인 경우)"
          style={{ display: feedbackType === 'bug' ? 'block' : 'none' }}
        >
          <TextArea
            rows={4}
            placeholder="1. 로그인 후&#10;2. 작업 관리 페이지로 이동&#10;3. 새 작업 추가 버튼 클릭&#10;4. 오류 발생"
          />
        </Form.Item>

        <Form.Item
          name="expectedResult"
          label="기대 결과"
        >
          <Input placeholder="어떤 결과를 기대하셨나요?" />
        </Form.Item>

        <Form.Item
          name="contactEmail"
          label="연락처 이메일 (선택사항)"
          initialValue={user.email}
        >
          <Input placeholder="답변을 받고 싶은 이메일 주소" />
        </Form.Item>
      </Form>
    </div>
  );

  // 진행률 계산
  const progress = (currentStep / 3) * 100;

  return (
    <Modal
      title={
        <Space>
          <HeartOutlined style={{ color: '#ff4d4f' }} />
          <span>피드백 보내기</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      className="feedback-modal"
      footer={
        <div className="feedback-modal-footer">
          <div className="progress-section">
            <Text type="secondary">단계 {currentStep} / 3</Text>
            <Progress 
              percent={progress} 
              showInfo={false} 
              strokeColor="#1890ff"
              style={{ margin: '8px 0' }}
            />
          </div>
          <Space>
            {currentStep > 1 && (
              <Button onClick={prevStep}>
                이전
              </Button>
            )}
            {currentStep < 3 ? (
              <Button 
                type="primary" 
                onClick={nextStep}
                disabled={currentStep === 1 && !feedbackType}
              >
                다음
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                disabled={userSatisfaction === 0}
              >
                피드백 전송
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <div className="feedback-modal-content">
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}
      </div>
    </Modal>
  );
};

export default FeedbackModal;
