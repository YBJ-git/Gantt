import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Tag, List, Typography, Space, Tooltip } from 'antd';
import { 
  ExclamationCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import './LoadOptimizationRecommendations.scss';

const { Text, Paragraph } = Typography;

const LoadOptimizationRecommendations = ({ recommendations, onApply }) => {
  // 심각도에 따른 아이콘 반환
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      case 'medium':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'low':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };
  
  // 심각도에 따른 태그 색상 반환
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'processing';
      default: return 'default';
    }
  };
  
  // 추천 항목 적용 핸들러
  const handleApply = (recommendationId) => {
    if (onApply) {
      onApply(recommendationId);
    }
  };
  
  // 추천 작업 유형에 따른 텍스트 반환
  const getActionText = (action) => {
    switch (action) {
      case 'reassign':
        return '작업 재할당';
      case 'reschedule':
        return '일정 조정';
      case 'share':
        return '작업 분담';
      default:
        return '작업 조정';
    }
  };

  return (
    <div className="load-optimization-recommendations">
      <List
        dataSource={recommendations}
        itemLayout="vertical"
        renderItem={recommendation => (
          <List.Item key={recommendation.id}>
            <Card 
              className={`recommendation-card recommendation-${recommendation.severity}`}
              title={
                <Space>
                  {getSeverityIcon(recommendation.severity)}
                  <Text strong>{recommendation.title}</Text>
                  <Tag color={getSeverityColor(recommendation.severity)}>
                    {recommendation.severity === 'high' ? '높음' : 
                     recommendation.severity === 'medium' ? '중간' : '낮음'}
                  </Tag>
                </Space>
              }
              actions={[
                <Button 
                  type="primary" 
                  onClick={() => handleApply(recommendation.id)}
                >
                  적용하기
                </Button>
              ]}
            >
              <Paragraph>{recommendation.description}</Paragraph>
              
              <div className="recommendation-details">
                <div className="recommendation-section">
                  <Text strong>기대 효과:</Text>
                  <Paragraph>{recommendation.potentialGain}</Paragraph>
                </div>
                
                <div className="recommendation-section">
                  <Text strong>제안 작업:</Text>
                  <List
                    size="small"
                    dataSource={recommendation.suggestedActions}
                    renderItem={action => (
                      <List.Item className="suggested-action">
                        <Space align="start">
                          <ArrowRightOutlined />
                          <div>
                            <div><Text strong>{getActionText(action.action)}</Text></div>
                            {action.action === 'reassign' && (
                              <div>
                                리소스 이동: {action.fromResource} <ArrowRightOutlined /> {action.toResource}
                              </div>
                            )}
                            {action.action === 'reschedule' && (
                              <div>
                                일정 변경: {action.newStartDate} ~ {action.newEndDate}
                              </div>
                            )}
                            {action.action === 'share' && (
                              <div>
                                작업 분담: {action.fromResource}({100-action.splitPercentage}%) / {action.toResource}({action.splitPercentage}%)
                              </div>
                            )}
                          </div>
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

LoadOptimizationRecommendations.propTypes = {
  recommendations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      severity: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
      potentialGain: PropTypes.string,
      suggestedActions: PropTypes.arrayOf(PropTypes.object).isRequired
    })
  ).isRequired,
  onApply: PropTypes.func
};

export default LoadOptimizationRecommendations;