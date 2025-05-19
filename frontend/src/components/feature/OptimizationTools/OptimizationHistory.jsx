import React, { useState } from 'react';
import { 
  List, 
  Typography, 
  Card, 
  Button, 
  Divider, 
  Modal, 
  Timeline, 
  Tag, 
  Space,
  Row,
  Col,
  Collapse
} from 'antd';
import {
  HistoryOutlined,
  UserOutlined,
  RightOutlined,
  InfoCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './OptimizationHistory.scss';

// 가정: 이 컴포넌트는 OptimizationResultChart가 구현되어 있다고 가정
import OptimizationResultChart from './OptimizationResultChart';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const OptimizationHistory = ({ history, resources }) => {
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const showDetail = (item) => {
    setSelectedItem(item);
    setDetailVisible(true);
  };
  
  const renderChanges = (changes) => {
    return (
      <ul className="changes-list">
        {changes.map((change, index) => (
          <li key={index}>{change.description}</li>
        ))}
      </ul>
    );
  };
  
  return (
    <div className="optimization-history">
      <div className="history-header">
        <Title level={4}>최적화 이력</Title>
        <Text type="secondary">지금까지 수행된 모든 최적화 작업 내역입니다.</Text>
      </div>
      
      <List
        itemLayout="horizontal"
        dataSource={history}
        renderItem={item => (
          <Card className="history-item" key={item.id}>
            <div className="history-item-header">
              <div className="history-meta">
                <div className="history-icon">
                  <HistoryOutlined />
                </div>
                <div className="history-info">
                  <div className="history-date">{moment(item.timestamp).format('YYYY-MM-DD HH:mm')}</div>
                  <div className="history-user">{item.user}</div>
                </div>
              </div>
              <div className="history-score">
                <div className="score-value">{item.balancingScore}%</div>
                <div className="score-label">균형 점수</div>
              </div>
            </div>
            
            <Divider />
            
            <div className="history-content">
              <div className="changes-summary">
                <Title level={5}>변경 내역 ({item.changes.length})</Title>
                {renderChanges(item.changes)}
              </div>
            </div>
            
            <div className="history-actions">
              <Button type="link" onClick={() => showDetail(item)}>
                상세 정보 <RightOutlined />
              </Button>
            </div>
          </Card>
        )}
      />
      
      {/* 상세 정보 모달 */}
      <Modal
        title="최적화 상세 정보"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            닫기
          </Button>
        ]}
      >
        {selectedItem && (
          <div className="optimization-detail">
            <div className="detail-header">
              <div className="detail-meta">
                <Title level={4}>최적화 작업</Title>
                <div className="meta-info">
                  <span>
                    <UserOutlined /> {selectedItem.user}
                  </span>
                  <span>
                    <HistoryOutlined /> {moment(selectedItem.timestamp).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
              </div>
              <div className="detail-score">
                <div className="score-label">균형 점수</div>
                <div className="score-value">{selectedItem.balancingScore}%</div>
              </div>
            </div>
            
            <Divider />
            
            <div className="detail-chart">
              <OptimizationResultChart 
                before={selectedItem.beforeUtilization}
                after={selectedItem.afterUtilization}
                resources={resources}
              />
            </div>
            
            <div className="detail-changes">
              <Title level={5}>변경 내역</Title>
              <Timeline>
                {selectedItem.changes.map((change, index) => (
                  <Timeline.Item key={index}>
                    <div className="change-item">
                      <div className="change-task">작업 #{change.taskId}</div>
                      <div className="change-description">{change.description}</div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OptimizationHistory;