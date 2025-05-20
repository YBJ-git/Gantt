import React, { useState, useEffect } from 'react';
import { Card, Progress, Table, Tag, Button, Modal, Alert, DatePicker } from 'antd';
import { validateResourceAllocation } from '../../../utils/resourceUtils';

/**
 * 리소스 할당 컴포넌트
 * 리소스 할당 현황을 표시하고 관리합니다.
 */
const ResourceAllocation = ({ resources, tasks, onResourceUpdate }) => {
  const [allocations, setAllocations] = useState([]);
  const [dateRange, setDateRange] = useState([new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningResource, setWarningResource] = useState(null);
  const [warningDetails, setWarningDetails] = useState(null);
  
  useEffect(() => {
    if (resources && tasks && dateRange) {
      const [startDate, endDate] = dateRange;
      calculateAllocations(resources, tasks, startDate, endDate);
    }
  }, [resources, tasks, dateRange]);
  
  /**
   * 리소스 할당량 계산
   */
  const calculateAllocations = (resources, tasks, startDate, endDate) => {
    const newAllocations = resources.map(resource => {
      const result = validateResourceAllocation(resource, tasks, startDate, endDate);
      
      return {
        ...resource,
        usage: result.usage,
        usagePercentage: result.usagePercentage,
        isOverloaded: !result.isValid,
        overloadDays: result.overloadDays
      };
    });
    
    setAllocations(newAllocations);
  };
  
  /**
   * 할당량 초과 경고 표시
   */
  const showOverloadWarning = (resource) => {
    const result = validateResourceAllocation(
      resource, 
      tasks, 
      dateRange[0], 
      dateRange[1]
    );
    
    setWarningResource(resource);
    setWarningDetails(result);
    setWarningVisible(true);
  };
  
  /**
   * 테이블 컬럼 설정
   */
  const columns = [
    {
      title: '리소스',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '용량',
      dataIndex: 'capacity',
      key: 'capacity',
      render: capacity => `${capacity}%`
    },
    {
      title: '현재 사용량',
      key: 'usage',
      render: (_, record) => (
        <Progress 
          percent={record.usagePercentage} 
          status={record.isOverloaded ? 'exception' : 'normal'}
        />
      )
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => (
        record.isOverloaded ? (
          <Tag color="red">과부하</Tag>
        ) : record.usagePercentage > 80 ? (
          <Tag color="orange">주의</Tag>
        ) : (
          <Tag color="green">정상</Tag>
        )
      )
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Button 
          type={record.isOverloaded ? 'danger' : 'default'} 
          size="small"
          onClick={() => showOverloadWarning(record)}
        >
          세부 정보
        </Button>
      )
    }
  ];
  
  /**
   * 날짜 범위 변경 처리
   */
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };
  
  return (
    <div className="resource-allocation">
      <Card 
        title="리소스 할당 현황" 
        extra={
          <DatePicker.RangePicker 
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        }
      >
        {allocations.some(res => res.isOverloaded) && (
          <Alert
            message="리소스 과부하 경고"
            description="일부 리소스가 할당 용량을 초과했습니다. 세부 정보를 확인하고 작업을 재분배하세요."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Table 
          dataSource={allocations} 
          columns={columns} 
          rowKey="id" 
        />
      </Card>
      
      {/* 과부하 경고 모달 */}
      <Modal
        title={`리소스 할당 세부 정보: ${warningResource?.name}`}
        open={warningVisible}
        onCancel={() => setWarningVisible(false)}
        footer={[
          <Button key="close" onClick={() => setWarningVisible(false)}>
            닫기
          </Button>,
          warningDetails?.overloadDays?.length > 0 && (
            <Button 
              key="optimize" 
              type="primary"
              onClick={() => {
                // 부하 최적화 페이지로 이동 또는 최적화 실행
                setWarningVisible(false);
              }}
            >
              최적화 실행
            </Button>
          )
        ]}
        width={700}
      >
        {warningDetails && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div>용량: {warningResource?.capacity}%</div>
              <div>현재 사용량: {warningDetails.usagePercentage}%</div>
              <Progress 
                percent={warningDetails.usagePercentage} 
                status={warningDetails.isValid ? 'normal' : 'exception'} 
              />
            </div>
            
            {warningDetails.overloadDays?.length > 0 ? (
              <>
                <Alert
                  message={`${warningDetails.overloadDays.length}일 동안 리소스가 과부하 상태입니다.`}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Table
                  dataSource={warningDetails.overloadDays}
                  columns={[
                    {
                      title: '날짜',
                      key: 'date',
                      render: (_, record) => record.date.toLocaleDateString()
                    },
                    {
                      title: '사용량',
                      dataIndex: 'usage',
                      key: 'usage',
                      render: usage => `${Math.round(usage)}%`
                    },
                    {
                      title: '초과량',
                      dataIndex: 'overload',
                      key: 'overload',
                      render: overload => `${Math.round(overload)}%`
                    }
                  ]}
                  rowKey={(record) => record.date.toISOString()}
                  size="small"
                  pagination={false}
                />
              </>
            ) : (
              <Alert
                message="리소스 할당이 정상 범위 내에 있습니다."
                type="success"
                showIcon
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default ResourceAllocation;
