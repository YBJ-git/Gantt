import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Card, 
  Button, 
  Form, 
  Select, 
  Slider, 
  Switch, 
  Space, 
  Checkbox, 
  Divider,
  Table,
  Tag,
  Typography
} from 'antd';
import { ThunderboltOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import './AutoTaskDistribution.scss';

const { Title, Text } = Typography;
const { Option } = Select;

const AutoTaskDistribution = ({ tasks, resources, onDistribute }) => {
  const [optimizationMethod, setOptimizationMethod] = useState('balance');
  const [constraints, setConstraints] = useState({
    maxWorkloadPerDay: 8,
    prioritizeTasks: true,
    considerSkills: true,
    allowPartialAssignment: false
  });
  
  // 테이블 데이터 준비
  const tableData = tasks.map(task => ({
    key: task.id,
    taskName: task.name,
    resourceName: resources.find(r => r.id === task.resourceId)?.name || '미할당',
    startDate: task.startDate,
    endDate: task.endDate,
    workload: task.workload,
    status: getTaskStatus(task.startDate, task.endDate)
  }));
  
  // 작업 상태 계산
  function getTaskStatus(startDate, endDate) {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (today < start) return 'pending';
    if (today > end) return 'completed';
    return 'progress';
  }
  
  // 제약 조건 변경 핸들러
  const handleConstraintChange = (key, value) => {
    setConstraints({ ...constraints, [key]: value });
  };
  
  // 최적화 실행 핸들러
  const handleOptimize = () => {
    if (onDistribute) {
      onDistribute({
        method: optimizationMethod,
        constraints: constraints
      });
    }
  };
  
  // 테이블 컬럼 정의
  const columns = [
    {
      title: '작업명',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '담당자',
      dataIndex: 'resourceName',
      key: 'resourceName',
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: '종료일',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: '부하',
      dataIndex: 'workload',
      key: 'workload',
      render: (workload) => `${workload}h`
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        let text = '알 수 없음';
        
        if (status === 'pending') {
          color = 'blue';
          text = '예정됨';
        } else if (status === 'progress') {
          color = 'green';
          text = '진행 중';
        } else if (status === 'completed') {
          color = 'gray';
          text = '완료됨';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  return (
    <div className="auto-task-distribution">
      <Card className="distribution-card">
        <Title level={4}>
          <ThunderboltOutlined /> 자동 작업 분배
        </Title>
        <Text type="secondary">
          작업 부하 최적화 알고리즘을 통해 리소스에 작업을 자동으로 분배합니다.
        </Text>
        
        <Divider />
        
        <Form layout="vertical">
          <Form.Item label="최적화 방법 선택">
            <Select
              value={optimizationMethod}
              onChange={(value) => setOptimizationMethod(value)}
              style={{ width: '100%' }}
            >
              <Option value="balance">부하 균등화 (전체 리소스의 부하 균형)</Option>
              <Option value="minimize-duration">일정 단축 (전체 프로젝트 기간 최소화)</Option>
              <Option value="maximize-efficiency">효율성 최대화 (리소스 활용도 최대화)</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="하루 최대 작업 부하">
            <Slider
              min={4}
              max={12}
              step={0.5}
              value={constraints.maxWorkloadPerDay}
              onChange={(value) => handleConstraintChange('maxWorkloadPerDay', value)}
              marks={{ 4: '4h', 8: '8h', 12: '12h' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Space direction="vertical">
              <Checkbox
                checked={constraints.prioritizeTasks}
                onChange={(e) => handleConstraintChange('prioritizeTasks', e.target.checked)}
              >
                작업 우선순위 고려
              </Checkbox>
              
              <Checkbox
                checked={constraints.considerSkills}
                onChange={(e) => handleConstraintChange('considerSkills', e.target.checked)}
              >
                리소스 스킬 및 역량 고려
              </Checkbox>
              
              <Checkbox
                checked={constraints.allowPartialAssignment}
                onChange={(e) => handleConstraintChange('allowPartialAssignment', e.target.checked)}
              >
                작업 분할 허용 (한 작업을 여러 리소스에 할당)
              </Checkbox>
            </Space>
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Button 
              type="primary" 
              icon={<SettingOutlined />} 
              size="large"
              onClick={handleOptimize}
            >
              최적화 실행
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Card className="tasks-card" title="현재 작업 목록">
        <Table 
          columns={columns} 
          dataSource={tableData} 
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

AutoTaskDistribution.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      resourceId: PropTypes.number,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      workload: PropTypes.number.isRequired,
    })
  ).isRequired,
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      capacity: PropTypes.number.isRequired,
      utilization: PropTypes.number.isRequired,
    })
  ).isRequired,
  onDistribute: PropTypes.func
};

export default AutoTaskDistribution;