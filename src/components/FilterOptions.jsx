import React from 'react';
import { Card, Space, Checkbox, DatePicker, Select, Slider, Row, Col, Statistic, Alert, Button } from 'antd';
import { FilterOutlined, CalendarOutlined, ClockCircleOutlined, VideoCameraOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const FilterOptions = ({
  options,
  onChange,
  scannedCount,
  filteredCount,
  disabled,
  sourceDir,
  onScanFiles
}) => {
  const handleDateChange = (date, dateString) => {
    onChange({ selectedDate: dateString });
  };

  const handleHourChange = (value) => {
    onChange({ selectedHour: value });
  };

  const handleAngleChange = (value) => {
    onChange({ selectedAngle: value });
  };

  const handleCheckboxChange = (field) => (e) => {
    onChange({ [field]: e.target.checked });
  };

  const getFilterSummary = () => {
    const activeFilters = [];
    if (options.byDate) activeFilters.push(`日期: ${options.selectedDate}`);
    if (options.byHour) activeFilters.push(`时间: ${options.selectedHour}时`);
    if (options.byAngle) activeFilters.push(`视角: ${options.selectedAngle === 'F' ? '前视角' : '所有视角'}`);
    
    if (activeFilters.length === 0) return '无筛选条件';
    return activeFilters.join(' + ');
  };

  return (
    <Card 
      title={<><FilterOutlined /> 筛选条件设置</>}
      className="feature-card"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 筛选选项 */}
        <Row gutter={24}>
          {/* 日期筛选 */}
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Checkbox
                checked={options.byDate}
                onChange={handleCheckboxChange('byDate')}
                disabled={disabled}
              >
                <CalendarOutlined /> 按日期筛选
              </Checkbox>
              {options.byDate && (
                <DatePicker
                  value={options.selectedDate ? dayjs(options.selectedDate) : null}
                  onChange={handleDateChange}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  placeholder="选择日期"
                />
              )}
            </Space>
          </Col>

          {/* 时间筛选 */}
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Checkbox
                checked={options.byHour}
                onChange={handleCheckboxChange('byHour')}
                disabled={disabled}
              >
                <ClockCircleOutlined /> 按小时筛选
              </Checkbox>
              {options.byHour && (
                <div>
                  <div style={{ marginBottom: 8 }}>时间: {options.selectedHour}:00</div>
                  <Slider
                    min={0}
                    max={23}
                    value={options.selectedHour}
                    onChange={handleHourChange}
                    disabled={disabled}
                    marks={{
                      0: '0时',
                      6: '6时',
                      12: '12时',
                      18: '18时',
                      23: '23时'
                    }}
                  />
                </div>
              )}
            </Space>
          </Col>

          {/* 视角筛选 */}
          <Col xs={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Checkbox
                checked={options.byAngle}
                onChange={handleCheckboxChange('byAngle')}
                disabled={disabled}
              >
                <VideoCameraOutlined /> 按视角筛选
              </Checkbox>
              {options.byAngle && (
                <Select
                  value={options.selectedAngle}
                  onChange={handleAngleChange}
                  disabled={disabled}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'F', label: '📹 前视角 (F)' },
                    { value: 'A', label: '🎥 所有视角 (A)' }
                  ]}
                />
              )}
            </Space>
          </Col>
        </Row>

        {/* 筛选结果统计 */}
        <Row gutter={16}>
          <Col xs={12} sm={8}>
            <Statistic
              title="已扫描文件"
              value={scannedCount}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="符合条件"
              value={filteredCount}
              suffix="个"
              valueStyle={{ color: filteredCount > 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>当前筛选条件</div>
              <div style={{ fontSize: 12, color: '#1890ff' }}>
                {getFilterSummary()}
              </div>
            </div>
          </Col>
        </Row>

        {/* 扫描按钮 */}
        <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={onScanFiles}
            disabled={!sourceDir || disabled}
            size="large"
            style={{ minWidth: 200 }}
          >
            <VideoCameraOutlined /> 扫描视频文件
          </Button>
        </div>

        {/* 提示信息 */}
        {scannedCount > 0 && filteredCount === 0 && (
          <Alert
            message="没有找到符合条件的文件"
            description="请调整筛选条件或检查文件命名格式"
            type="warning"
            showIcon
          />
        )}
      </Space>
    </Card>
  );
};

export default FilterOptions;
