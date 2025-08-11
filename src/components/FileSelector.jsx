import React from 'react';
import { Card, Space, Input, Button, Row, Col, Statistic } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

const FileSelector = ({
  sourceDir,
  outputDir,
  onSourceDirChange,
  onOutputDirChange,
  onFilesScanned,
  disabled
}) => {
  const selectSourceDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择视频文件所在目录'
      });
      if (selected) {
        onSourceDirChange(selected);
      }
    } catch (error) {
      console.error('选择目录失败:', error);
    }
  };

  const selectOutputDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择输出目录'
      });
      if (selected) {
        onOutputDirChange(selected);
      }
    } catch (error) {
      console.error('选择目录失败:', error);
    }
  };

  const scanFiles = async () => {
    if (!sourceDir) return;

    try {
      const files = await invoke('scan_files', { sourceDir });
      onFilesScanned(files);
    } catch (error) {
      console.error('扫描文件失败:', error);
      onFilesScanned([]);
    }
  };

  return (
    <Card 
      title={<><FolderOpenOutlined /> 目录设置</>}
      className="feature-card"
      size="small"
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* 源目录选择 */}
        <div>
          <div style={{ marginBottom: 4, fontWeight: 500, fontSize: 12, color: '#00d9ff' }}>
            📥 源目录
          </div>
          <Row gutter={8} align="middle">
            <Col flex="1">
              <Input
                value={sourceDir}
                placeholder="选择视频目录..."
                readOnly
                size="small"
                style={{ fontSize: 12 }}
              />
            </Col>
            <Col flex="none">
              <Button
                icon={<FolderOpenOutlined />}
                onClick={selectSourceDir}
                disabled={disabled}
                size="small"
                type="default"
              >
                浏览
              </Button>
            </Col>
          </Row>
        </div>

        {/* 输出目录选择 */}
        <div>
          <div style={{ marginBottom: 4, fontWeight: 500, fontSize: 12, color: '#00ff88' }}>
            📤 输出目录
          </div>
          <Row gutter={8} align="middle">
            <Col flex="1">
              <Input
                value={outputDir}
                placeholder="选择输出目录..."
                readOnly
                size="small"
                style={{ fontSize: 12 }}
              />
            </Col>
            <Col flex="none">
              <Button
                icon={<FolderOpenOutlined />}
                onClick={selectOutputDir}
                disabled={disabled}
                size="small"
                type="default"
              >
                浏览
              </Button>
            </Col>
          </Row>
        </div>
      </Space>
    </Card>
  );
};

export default FileSelector;
