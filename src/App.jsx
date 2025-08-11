import React, { useState, useEffect } from 'react';
import { Layout, Typography, ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { listen } from '@tauri-apps/api/event';
import FileSelector from './components/FileSelector';
import FilterOptions from './components/FilterOptions';
import ProcessingPanel from './components/ProcessingPanel';
import FileList from './components/FileList';
import StatusDisplay from './components/StatusDisplay';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function App() {
  const [scannedFiles, setScannedFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    byDate: false,
    byHour: false,
    byAngle: false,
    selectedDate: new Date().toISOString().split('T')[0],
    selectedHour: 16,
    selectedAngle: 'F'
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [sourceDir, setSourceDir] = useState('');
  const [outputDir, setOutputDir] = useState('');
  const [outputFile, setOutputFile] = useState('');

  // 监听后端事件
  useEffect(() => {
    let unlistenProgress, unlistenComplete, unlistenError;

    const setupEventListeners = async () => {
      try {
        console.log('开始设置事件监听器...');
        
        // 监听处理进度更新
        unlistenProgress = await listen('processing-progress', (event) => {
          console.log('收到进度更新:', event.payload);
          const { progress, message } = event.payload;
          setProgress(progress);
          setStatus({
            message: message,
            type: 'processing'
          });
        });
        console.log('进度事件监听器设置完成');

        // 监听处理完成事件
        unlistenComplete = await listen('processing-complete', (event) => {
          console.log('收到完成事件:', event.payload);
          const outputPath = event.payload;
          setProcessing(false);
          setProgress(100);
          setOutputFile(outputPath);
          setStatus({
            message: `合成完成！生成文件：${outputPath}`,
            type: 'success'
          });
        });
        console.log('完成事件监听器设置完成');

        // 监听处理错误事件
        unlistenError = await listen('processing-error', (event) => {
          console.log('收到错误事件:', event.payload);
          const error = event.payload;
          setProcessing(false);
          setProgress(0);
          setOutputFile('');
          setStatus({
            message: `处理失败：${error}`,
            type: 'error'
          });
        });
        console.log('错误事件监听器设置完成');
        console.log('所有事件监听器设置完成');
      } catch (error) {
        console.error('设置事件监听器时出错:', error);
      }
    };

    setupEventListeners();

    return () => {
      console.log('清理事件监听器...');
      if (unlistenProgress) {
        unlistenProgress();
        console.log('进度事件监听器已清理');
      }
      if (unlistenComplete) {
        unlistenComplete();
        console.log('完成事件监听器已清理');
      }
      if (unlistenError) {
        unlistenError();
        console.log('错误事件监听器已清理');
      }
    };
  }, []);

  // 实时筛选文件
  useEffect(() => {
    if (scannedFiles.length === 0) {
      setFilteredFiles([]);
      return;
    }

    let filtered = [...scannedFiles];

    // 根据筛选条件过滤
    if (filterOptions.byDate) {
      const targetDate = filterOptions.selectedDate;
      filtered = filtered.filter(file => 
        file.date === targetDate
      );
    }

    if (filterOptions.byHour) {
      filtered = filtered.filter(file => {
        const fileHour = parseInt(file.time.split(':')[0]);
        return fileHour === filterOptions.selectedHour;
      });
    }

    if (filterOptions.byAngle) {
      filtered = filtered.filter(file => 
        file.view_angle === filterOptions.selectedAngle
      );
    }

    setFilteredFiles(filtered);
  }, [scannedFiles, filterOptions]);

  const handleFilesScanned = (files) => {
    setScannedFiles(files);
    setStatus({
      message: `扫描完成，找到 ${files.length} 个视频文件`,
      type: 'success'
    });
  };

  const handleFilterChange = (newOptions) => {
    setFilterOptions(prev => ({ ...prev, ...newOptions }));
  };

  const handleScanFiles = async () => {
    if (!sourceDir) return;

    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const files = await invoke('scan_files', { sourceDir });
      handleFilesScanned(files);
    } catch (error) {
      console.error('扫描文件失败:', error);
      handleFilesScanned([]);
    }
  };

  const handleProcessingStart = () => {
    setProcessing(true);
    setProgress(0);
    setOutputFile('');
    setStatus({
      message: '开始处理视频文件...',
      type: 'processing'
    });
  };

  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00d9ff',
          colorSuccess: '#00ff88',
          colorWarning: '#ffaa00',
          colorError: '#ff3366',
          borderRadius: 8,
          colorBgContainer: '#1a1a1a',
          colorBgElevated: '#262626',
          colorBgLayout: '#0a0a0a',
          colorText: '#ffffff',
          colorTextSecondary: '#a0a0a0',
          colorBorder: '#404040',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        components: {
          Layout: {
            colorBgHeader: '#000000',
            colorBgBody: '#0a0a0a',
            colorBgTrigger: '#1a1a1a',
          },
          Card: {
            colorBgContainer: '#1a1a1a',
            colorBorderSecondary: '#404040',
          },
          Button: {
            borderRadius: 8,
            primaryShadow: '0 4px 12px rgba(0, 217, 255, 0.3)',
          }
        }
      }}
    >
      <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
        {/* Header */}
        <header className="relative h-16 bg-gradient-to-r from-black via-slate-900 to-black border-b border-primary/20 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50" />
          <div className="relative z-10 flex items-center px-8 h-full">
            <h1 className="text-2xl font-bold text-primary drop-shadow-lg">
              🎬 LiCam
            </h1>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </header>
        
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
          {/* 左侧面板 - 文件目录选择 */}
          <div className="w-80 bg-background/30 border-r border-border/30 backdrop-blur-sm">
            <div className="h-full p-3 overflow-y-auto">
              <FileSelector
                sourceDir={sourceDir}
                outputDir={outputDir}
                onSourceDirChange={setSourceDir}
                onOutputDirChange={setOutputDir}
                onFilesScanned={handleFilesScanned}
                disabled={processing}
              />
            </div>
          </div>

          {/* 中间面板 - 筛选条件和视频列表 */}
          <div className="flex-1 bg-background/20 backdrop-blur-sm">
            <div className="h-full p-4 overflow-y-auto">
              {/* 筛选选项 */}
              <FilterOptions
                options={filterOptions}
                onChange={handleFilterChange}
                scannedCount={scannedFiles.length}
                filteredCount={filteredFiles.length}
                disabled={processing}
                sourceDir={sourceDir}
                onScanFiles={handleScanFiles}
              />

              {/* 文件列表 - 栅格布局 */}
              {filteredFiles.length > 0 && (
                <div className="mt-4">
                  <FileList files={filteredFiles} />
                </div>
              )}
            </div>
          </div>

          {/* 右侧面板 - 视频处理信息 */}
          <div className="w-[340px] bg-background/30 border-l border-border/30 backdrop-blur-sm">
            <div className="h-full p-3 overflow-y-auto space-y-4">
              {/* 处理面板 */}
              <ProcessingPanel
                files={filteredFiles}
                sourceDir={sourceDir}
                outputDir={outputDir}
                filterOptions={filterOptions}
                processing={processing}
                onStart={handleProcessingStart}
              />

              {/* 状态显示 */}
              <StatusDisplay
                status={status}
                progress={progress}
                processing={processing}
                outputFile={outputFile}
              />
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;