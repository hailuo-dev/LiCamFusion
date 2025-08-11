import React from 'react';
import { Card, Button, Space, Row, Col, Typography, Descriptions } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';

const { Text } = Typography;

const ProcessingPanel = ({
  files,
  sourceDir,
  outputDir,
  filterOptions,
  processing,
  onStart
}) => {
  const canProcess = () => {
    return !processing && 
           sourceDir && 
           outputDir && 
           files.length > 0 &&
           (filterOptions.byDate || filterOptions.byHour || filterOptions.byAngle);
  };

  const startProcessing = async () => {
    if (!canProcess()) return;

    onStart();

    try {
      // 构建合成类型参数
      const mergeType = getMergeType();
      
      await invoke('start_video_processing', {
        files: files,
        outputDir: outputDir,
        mergeType: mergeType
      });

      // 进度和完成状态通过事件处理，这里不需要调用回调
    } catch (error) {
      console.error('处理失败:', error);
      // 错误也通过事件处理
    }
  };

  const getMergeType = () => {
    const { byDate, byHour, byAngle, selectedDate, selectedHour, selectedAngle } = filterOptions;
    
    if (byDate && byHour && byAngle) {
      return {
        type: 'ByHourAndAngle',
        date: selectedDate,
        hour: selectedHour,
        angle: selectedAngle
      };
    } else if (byDate && byAngle) {
      return {
        type: 'ByDateAndAngle',
        date: selectedDate,
        angle: selectedAngle
      };
    } else if (byHour && byAngle) {
      return {
        type: 'ByHourAndAngle',
        date: selectedDate,
        hour: selectedHour,
        angle: selectedAngle
      };
    } else if (byDate && byHour) {
      return {
        type: 'ByHour',
        date: selectedDate,
        hour: selectedHour
      };
    } else if (byDate) {
      return {
        type: 'ByDate',
        date: selectedDate
      };
    } else if (byHour) {
      return {
        type: 'ByHour',
        date: selectedDate,
        hour: selectedHour
      };
    } else if (byAngle) {
      return {
        type: 'ByAngle',
        angle: selectedAngle
      };
    }
    
    return { type: 'All' };
  };

  const getOutputFileName = () => {
    const mergeType = getMergeType();
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
    
    switch (mergeType.type) {
      case 'ByDate':
        return `LiCam_${mergeType.date.replace(/-/g, '')}_merged.mp4`;
      case 'ByHour':
        return `LiCam_${mergeType.date.replace(/-/g, '')}_${mergeType.hour.toString().padStart(2, '0')}h_merged.mp4`;
      case 'ByAngle':
        return `LiCam_${mergeType.angle}_${timestamp}_merged.mp4`;
      case 'ByDateAndAngle':
        return `LiCam_${mergeType.date.replace(/-/g, '')}_${mergeType.angle}_merged.mp4`;
      case 'ByHourAndAngle':
        return `LiCam_${mergeType.date.replace(/-/g, '')}_${mergeType.hour.toString().padStart(2, '0')}h_${mergeType.angle}_merged.mp4`;
      default:
        return `LiCam_${timestamp}_merged.mp4`;
    }
  };

  return (
    <Card 
      title={<><PlayCircleOutlined /> 视频处理</>}
      className="feature-card"
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* 处理信息 */}
        <div style={{ 
          background: '#262626', 
          padding: '8px 12px', 
          borderRadius: 6, 
          border: '1px solid #404040' 
        }}>
          <div style={{ marginBottom: 6, fontSize: 12 }}>
            <Text style={{ color: '#00d9ff' }}>文件数量：</Text>
            <Text strong style={{ color: '#ffffff' }}>{files.length}个</Text>
          </div>
          <div style={{ marginBottom: 6, fontSize: 12 }}>
            <Text style={{ color: '#00d9ff' }}>输出：</Text>
            <Text 
              style={{ 
                color: '#ffffff', 
                fontSize: 11,
                wordBreak: 'break-all'
              }}
              title={getOutputFileName()}
            >
              {getOutputFileName()}
            </Text>
          </div>
          <div style={{ fontSize: 12 }}>
            <Text style={{ color: '#00d9ff' }}>模式：</Text>
            <Text style={{ color: '#00ff88', fontSize: 11 }}>
              {getMergeTypeDescription()}
            </Text>
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="middle"
              icon={processing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={startProcessing}
              disabled={!canProcess()}
              loading={processing}
              style={{ width: '100%' }}
            >
              {processing ? '处理中...' : '开始合成'}
            </Button>
            
            {processing && (
              <Button
                size="small"
                icon={<StopOutlined />}
                onClick={() => {
                  // TODO: 实现停止功能
                  console.log('停止处理');
                }}
                style={{ width: '100%' }}
              >
                停止
              </Button>
            )}
          </Space>
        </div>

        {/* 处理要求提示 */}
        {!canProcess() && (
          <div style={{ 
            padding: 8, 
            background: 'rgba(255, 170, 0, 0.1)', 
            borderRadius: 6, 
            border: '1px solid #ffaa00' 
          }}>
            <Text style={{ color: '#ffaa00', fontSize: 11 }}>
              请确保已选择目录、扫描文件、设置筛选条件
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );

  function getMergeTypeDescription() {
    const mergeType = getMergeType();
    const descriptions = {
      'ByDate': `日期 ${filterOptions.selectedDate}`,
      'ByHour': `${filterOptions.selectedDate} ${filterOptions.selectedHour}时`,
      'ByAngle': `${filterOptions.selectedAngle === 'F' ? '前视角' : '所有视角'}`,
      'ByDateAndAngle': `${filterOptions.selectedDate} ${filterOptions.selectedAngle}`,
      'ByHourAndAngle': `${filterOptions.selectedDate} ${filterOptions.selectedHour}时 ${filterOptions.selectedAngle}`,
      'All': '全部文件'
    };
    
    return descriptions[mergeType.type] || '未知';
  }
};

export default ProcessingPanel;
