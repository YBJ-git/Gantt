import React from 'react';
import { Row, Col, Card, Typography, Slider, DatePicker, Radio, Switch, Divider, Tooltip, Space } from 'antd';
import { 
  BarChartOutlined, // BalanceOutlined 대신 BarChartOutlined로 변경
  ClockCircleOutlined, 
  AimOutlined,
  DollarCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './OptimizationParameters.scss';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const OptimizationParameters = ({ parameters, onChange }) => {
  return (
    <div className="optimization-parameters">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="균형화 가중치" className="parameter-card">
            <div className="parameter-item">
              <div className="parameter-label">
                <BarChartOutlined /> {/* BalanceOutlined -> BarChartOutlined */}
                <span>부하 균형</span>
                <Tooltip title="리소스 간의 작업 부하 균형을 맞추는 중요도">
                  <InfoCircleOutlined className="info-icon" />
                </Tooltip>
              </div>
              <Slider
                value={parameters.balancingWeight}
                onChange={value => onChange('balancingWeight', value)}
                marks={{ 0: '낮음', 50: '중간', 100: '높음' }}
              />
            </div>
            
            <div className="parameter-item">
              <div className="parameter-label">
                <ClockCircleOutlined /> <span>기한 준수</span>
                <Tooltip title="작업 기한 준수의 중요도">
                  <InfoCircleOutlined className="info-icon" />
                </Tooltip>
              </div>
              <Slider
                value={parameters.deadlineWeight}
                onChange={value => onChange('deadlineWeight', value)}
                marks={{ 0: '낮음', 50: '중간', 100: '높음' }}
              />
            </div>
            
            <div className="parameter-item">
              <div className="parameter-label">
                <AimOutlined /> <span>기술 매칭</span>
                <Tooltip title="작업에 가장 적합한 기술을 가진 리소스 매칭의 중요도">
                  <InfoCircleOutlined className="info-icon" />
                </Tooltip>
              </div>
              <Slider
                value={parameters.skillMatchWeight}
                onChange={value => onChange('skillMatchWeight', value)}
                marks={{ 0: '낮음', 50: '중간', 100: '높음' }}
              />
            </div>
            
            <div className="parameter-item">
              <div className="parameter-label">
                <DollarCircleOutlined /> <span>비용 최적화</span>
                <Tooltip title="비용 최소화의 중요도">
                  <InfoCircleOutlined className="info-icon" />
                </Tooltip>
              </div>
              <Slider
                value={parameters.costWeight}
                onChange={value => onChange('costWeight', value)}
                marks={{ 0: '낮음', 50: '중간', 100: '높음' }}
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="최적화 범위 설정" className="parameter-card">
            <div className="parameter-item">
              <div className="parameter-label">
                <span>최적화 기간</span>
              </div>
              <Radio.Group
                value={parameters.optimizationPeriod}
                onChange={e => onChange('optimizationPeriod', e.target.value)}
              >
                <Radio.Button value="week">1주</Radio.Button>
                <Radio.Button value="month">1개월</Radio.Button>
                <Radio.Button value="quarter">분기</Radio.Button>
                <Radio.Button value="custom">사용자 지정</Radio.Button>
              </Radio.Group>
            </div>
            
            {parameters.optimizationPeriod === 'custom' && (
              <div className="parameter-item">
                <div className="parameter-label">
                  <span>기간 범위</span>
                </div>
                <RangePicker
                  value={[parameters.startDate, parameters.endDate]}
                  onChange={dates => {
                    if (dates) {
                      onChange('startDate', dates[0]);
                      onChange('endDate', dates[1]);
                    }
                  }}
                />
              </div>
            )}
            
            <Divider />
            
            <div className="parameter-item">
              <div className="parameter-label">
                <WarningOutlined /> <span>최대 과할당 허용 (%)</span>
                <Tooltip title="각 리소스에 대해 허용되는 최대 과할당 백분율">
                  <InfoCircleOutlined className="info-icon" />
                </Tooltip>
              </div>
              <Slider
                min={100}
                max={150}
                value={parameters.maxOverallocation}
                onChange={value => onChange('maxOverallocation', value)}
                marks={{ 100: '100%', 120: '120%', 150: '150%' }}
              />
            </div>
            
            <div className="parameter-item">
              <Space size="large">
                <div className="switch-item">
                  <Switch
                    checked={parameters.forceRedistribution}
                    onChange={value => onChange('forceRedistribution', value)}
                  />
                  <div className="switch-label">
                    <Text>강제 재분배</Text>
                    <Tooltip title="활성화하면 이미 균형이 맞아있는 경우에도 작업을 재분배합니다">
                      <InfoCircleOutlined className="info-icon" />
                    </Tooltip>
                  </div>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OptimizationParameters;