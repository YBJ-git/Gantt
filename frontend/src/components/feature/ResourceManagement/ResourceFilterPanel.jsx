import React from 'react';
import { Row, Col, Select, Slider, Tag, Space, Button } from 'antd';
import { TeamOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import './ResourceFilterPanel.scss';

const { Option } = Select;

const ResourceFilterPanel = ({ departments, resourceTypes, filters, setFilters }) => {
  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      department: [],
      type: [],
      availability: [],
      loadRange: [0, 100]
    });
  };
  
  return (
    <div className="resource-filter-panel">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <div className="filter-item">
            <div className="filter-label">
              <TeamOutlined /> <span>부서</span>
            </div>
            <Select
              mode="multiple"
              placeholder="부서 선택"
              value={filters.department}
              onChange={value => setFilters({ ...filters, department: value })}
              style={{ width: '100%' }}
              allowClear
            >
              {departments.map(dept => (
                <Option key={dept.id} value={dept.id}>{dept.name}</Option>
              ))}
            </Select>
          </div>
        </Col>
        
        <Col xs={24} md={6}>
          <div className="filter-item">
            <div className="filter-label">
              <UserOutlined /> <span>리소스 유형</span>
            </div>
            <Select
              mode="multiple"
              placeholder="유형 선택"
              value={filters.type}
              onChange={value => setFilters({ ...filters, type: value })}
              style={{ width: '100%' }}
              allowClear
            >
              {resourceTypes.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))}
            </Select>
          </div>
        </Col>
        
        <Col xs={24} md={6}>
          <div className="filter-item">
            <div className="filter-label">
              <BarChartOutlined /> <span>부하율 범위</span>
            </div>
            <Slider
              range
              value={filters.loadRange}
              onChange={value => setFilters({ ...filters, loadRange: value })}
              tipFormatter={value => `${value}%`}
            />
            <div className="range-values">
              <span>{filters.loadRange[0]}%</span>
              <span>{filters.loadRange[1]}%</span>
            </div>
          </div>
        </Col>
        
        <Col xs={24} md={6}>
          <div className="filter-item">
            <div className="filter-label">
              <span>가용성</span>
            </div>
            <Select
              mode="multiple"
              placeholder="가용성 선택"
              value={filters.availability}
              onChange={value => setFilters({ ...filters, availability: value })}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="available">현재 가용</Option>
              <Option value="unavailable">미가용</Option>
            </Select>
          </div>
        </Col>
      </Row>
      
      <div className="filter-actions">
        <Space>
          <Button size="small" onClick={handleResetFilters}>
            필터 초기화
          </Button>
          
          {Object.values(filters).some(val => 
            Array.isArray(val) ? val.length > 0 : val !== null
          ) && (
            <div className="active-filters">
              <span>활성 필터:</span>
              {filters.department.length > 0 && (
                <Tag closable onClose={() => setFilters({ ...filters, department: [] })}>
                  부서 ({filters.department.length})
                </Tag>
              )}
              {filters.type.length > 0 && (
                <Tag closable onClose={() => setFilters({ ...filters, type: [] })}>
                  유형 ({filters.type.length})
                </Tag>
              )}
              {filters.availability.length > 0 && (
                <Tag closable onClose={() => setFilters({ ...filters, availability: [] })}>
                  가용성 ({filters.availability.length})
                </Tag>
              )}
              {(filters.loadRange[0] > 0 || filters.loadRange[1] < 100) && (
                <Tag closable onClose={() => setFilters({ ...filters, loadRange: [0, 100] })}>
                  부하율 ({filters.loadRange[0]}% - {filters.loadRange[1]}%)
                </Tag>
              )}
            </div>
          )}
        </Space>
      </div>
    </div>
  );
};

export default ResourceFilterPanel;