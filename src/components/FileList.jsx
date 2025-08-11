import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Button, Modal, Descriptions, message } from 'antd';
import { 
  VideoCameraOutlined, 
  EyeOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  PlayCircleOutlined 
} from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';

const { Text } = Typography;

const FileList = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const showFileDetails = (file) => {
    setSelectedFile(file);
    setModalVisible(true);
  };

  const playVideo = async (file) => {
    try {
      await invoke('open_video_file', { filePath: file.path });
      message.success(`正在播放: ${file.filename}`);
    } catch (error) {
      console.error('播放视频失败:', error);
      message.error(`播放失败: ${error}`);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAngleTag = (angle) => {
    return angle === 'F' ? 
      <Tag 
        style={{ 
          background: 'rgba(0, 217, 255, 0.1)', 
          borderColor: '#00d9ff', 
          color: '#00d9ff' 
        }} 
        icon={<VideoCameraOutlined />}
      >
        前视角
      </Tag> : 
      <Tag 
        style={{ 
          background: 'rgba(0, 255, 136, 0.1)', 
          borderColor: '#00ff88', 
          color: '#00ff88' 
        }} 
        icon={<VideoCameraOutlined />}
      >
        所有视角
      </Tag>;
  };

  return (
    <>
      <Card 
        title={<><VideoCameraOutlined /> 待处理文件列表 ({files.length})</>}
        className="feature-card"
      >
        <div className="file-list-container">
          <div className="file-grid">
            {files.map((file, index) => (
              <div 
                key={file.path || index} 
                className="file-card"
              >
                {/* 文件序号角标 */}
                <div style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 24,
                  height: 24,
                  background: '#00d9ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: 12,
                  zIndex: 2
                }}>
                  {index + 1}
                </div>

                {/* 视频预览区域 */}
                <div className="file-card-preview">
                  <PlayCircleOutlined 
                    style={{ 
                      fontSize: 32, 
                      color: '#00d9ff',
                      filter: 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.3))'
                    }} 
                  />
                  
                  {/* 悬停时显示的播放按钮 */}
                  <div className="file-card-preview-overlay">
                    <Button
                      className="play-button"
                      icon={<PlayCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        playVideo(file);
                      }}
                      title="播放视频"
                    />
                  </div>
                </div>

                {/* 文件信息 */}
                <div className="file-card-info">
                  <div style={{ marginBottom: 8 }}>
                    <Text 
                      strong 
                      style={{ 
                        fontSize: 14, 
                        color: '#ffffff',
                        display: 'block',
                        marginBottom: 6,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }}
                      title={file.filename}
                      onClick={() => showFileDetails(file)}
                    >
                      {file.filename}
                    </Text>
                    {getAngleTag(file.view_angle)}
                  </div>

                  {/* 时间和大小信息 */}
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space size="small">
                      <CalendarOutlined style={{ color: '#00d9ff' }} />
                      <Text style={{ color: '#a0a0a0', fontSize: 12 }}>{file.date}</Text>
                    </Space>
                    <Space size="small">
                      <ClockCircleOutlined style={{ color: '#00ff88' }} />
                      <Text style={{ color: '#a0a0a0', fontSize: 12 }}>{file.time}</Text>
                    </Space>
                    {file.size && (
                      <Text style={{ color: '#a0a0a0', fontSize: 12 }}>
                        大小: {formatFileSize(file.size)}
                      </Text>
                    )}
                  </Space>
                </div>

                {/* 操作按钮 */}
                <div className="file-card-actions">
                  <Button
                    type="default"
                    icon={<PlayCircleOutlined />}
                    size="small"
                    style={{
                      background: 'rgba(0, 217, 255, 0.1)',
                      borderColor: '#00d9ff',
                      color: '#00d9ff'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playVideo(file);
                    }}
                  >
                    播放
                  </Button>
                  
                  <Button
                    type="default"
                    icon={<EyeOutlined />}
                    size="small"
                    style={{
                      background: 'rgba(0, 255, 136, 0.1)',
                      borderColor: '#00ff88',
                      color: '#00ff88'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      showFileDetails(file);
                    }}
                  >
                    详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 文件详情模态框 */}
      <Modal
        title={
          <span style={{ color: '#00d9ff' }}>
            <VideoCameraOutlined style={{ marginRight: 8 }} />
            文件详情
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setModalVisible(false)}
            style={{
              background: '#1a1a1a',
              borderColor: '#404040',
              color: '#ffffff'
            }}
          >
            关闭
          </Button>
        ]}
        width={600}
        style={{
          '& .ant-modal-content': {
            background: '#1a1a1a',
            border: '1px solid #404040'
          }
        }}
      >
        {selectedFile && (
          <Descriptions 
            column={1} 
            bordered
            style={{
              '& .ant-descriptions-item-label': {
                background: '#262626',
                color: '#a0a0a0'
              },
              '& .ant-descriptions-item-content': {
                background: '#1a1a1a',
                color: '#ffffff'
              }
            }}
          >
            <Descriptions.Item label="文件名">
              <Text code style={{ background: '#262626', color: '#00d9ff' }}>
                {selectedFile.filename}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="完整路径">
              <Text 
                copyable={{ tooltips: ['复制路径', '已复制'] }} 
                style={{ fontSize: 12, color: '#a0a0a0' }}
              >
                {selectedFile.path}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="录制日期">
              <Space>
                <CalendarOutlined style={{ color: '#00d9ff' }} />
                <span style={{ color: '#ffffff' }}>{selectedFile.date}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="录制时间">
              <Space>
                <ClockCircleOutlined style={{ color: '#00ff88' }} />
                <span style={{ color: '#ffffff' }}>{selectedFile.time}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="视角">
              {getAngleTag(selectedFile.view_angle)}
            </Descriptions.Item>
            <Descriptions.Item label="文件类型">
              <Tag 
                style={{ 
                  background: 'rgba(255, 170, 0, 0.1)', 
                  borderColor: '#ffaa00', 
                  color: '#ffaa00' 
                }}
              >
                {selectedFile.file_type || 'MP4'}
              </Tag>
            </Descriptions.Item>
            {selectedFile.size && (
              <Descriptions.Item label="文件大小">
                <span style={{ color: '#ffffff' }}>{formatFileSize(selectedFile.size)}</span>
              </Descriptions.Item>
            )}
            {selectedFile.duration && (
              <Descriptions.Item label="视频时长">
                <span style={{ color: '#ffffff' }}>{selectedFile.duration}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default FileList;
