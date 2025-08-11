import React from 'react';
import { Card, Progress, Alert, Space, Button } from 'antd';
import { InfoCircleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';

const StatusDisplay = ({ status, progress, processing, outputFile }) => {
  const openOutputFolder = async () => {
    try {
      if (outputFile) {
        await invoke('open_output_folder', { outputPath: outputFile });
      }
    } catch (error) {
      console.error('打开文件夹失败:', error);
    }
  };

  if (!status.message && !processing) {
    return null;
  }

  const getAlertType = () => {
    switch (status.type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'processing': return 'info';
      default: return 'info';
    }
  };

  const getProgressStatus = () => {
    if (status.type === 'error') return 'exception';
    if (status.type === 'success') return 'success';
    return 'active';
  };

  return (
    <div className="progress-container">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 成功完成状态 - 特殊布局 */}
        {status.type === 'success' && outputFile ? (
          <div className="success-completion-card">
            <div className="success-header">
              <div className="success-icon">✅</div>
              <div className="success-title">合成完成!</div>
            </div>
            
            <div className="success-content">
              <div className="success-label">生成文件:</div>
              <div className="success-file-info">
                <div className="file-path" title={outputFile}>
                  {outputFile}
                </div>
                <Button
                  type="primary"
                  icon={<FolderOpenOutlined />}
                  onClick={openOutputFolder}
                  className="open-folder-btn"
                >
                  打开文件夹
                </Button>
              </div>
            </div>

            {/* 完成进度条 */}
            <div className="completion-progress">
              <Progress
                percent={100}
                status="success"
                strokeColor="#00ff88"
                strokeWidth={6}
                showInfo={false}
              />
              <div className="completion-text">处理完成！</div>
            </div>
          </div>
        ) : (
          /* 其他状态的显示 */
          <>
            <Alert
              message={status.message}
              type={getAlertType()}
              showIcon
              icon={<InfoCircleOutlined />}
            />

            {/* 进度条 */}
            {(processing || (status.type === 'success' && progress > 0)) && (
              <div>
                <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#00d9ff' }}>
                  处理进度
                </div>
                <Progress
                  percent={Math.round(progress)}
                  status={getProgressStatus()}
                  strokeColor={{
                    '0%': '#00d9ff',
                    '100%': '#00ff88',
                  }}
                  strokeWidth={6}
                  style={{ marginBottom: 8 }}
                />
                <div style={{ fontSize: 12, color: '#a0a0a0', textAlign: 'center' }}>
                  {processing ? '正在处理中，请耐心等待...' : '处理完成！'}
                </div>
              </div>
            )}

            {/* 处理详情 */}
            {processing && (
              <div className="processing-details">
                <div>📹 正在使用 FFmpeg 合成视频文件</div>
                <div>⚡ 请保持应用程序运行状态</div>
                <div>💾 处理完成后将自动保存到输出目录</div>
              </div>
            )}
          </>
        )}
      </Space>
    </div>
  );
};

export default StatusDisplay;
