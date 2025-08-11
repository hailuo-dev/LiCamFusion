import React, { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Video, Activity, FileVideo } from 'lucide-react';
import FileSelector from './components/FileSelector';
import FilterOptions from './components/FilterOptions';
import ProcessingPanel from './components/ProcessingPanel';
import FileList from './components/FileList';
import StatusDisplay from './components/StatusDisplay';

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
    
    // 计算符合条件的文件数量（基于当前筛选条件）
    let filteredCount = files.length;
    if (filterOptions.byDate || filterOptions.byHour || filterOptions.byAngle) {
      let filtered = [...files];
      
      if (filterOptions.byDate) {
        const targetDate = filterOptions.selectedDate;
        filtered = filtered.filter(file => file.date === targetDate);
      }
      
      if (filterOptions.byHour) {
        filtered = filtered.filter(file => {
          const fileHour = parseInt(file.time.split(':')[0]);
          return fileHour === filterOptions.selectedHour;
        });
      }
      
      if (filterOptions.byAngle) {
        filtered = filtered.filter(file => file.view_angle === filterOptions.selectedAngle);
      }
      
      filteredCount = filtered.length;
    }
    
    setStatus({
      message: `扫描完成，找到 ${files.length} 个视频文件，其中 ${filteredCount} 个符合当前筛选条件`,
      type: 'success'
    });
  };

  const handleFilterChange = (newOptions) => {
    setFilterOptions(prev => ({ ...prev, ...newOptions }));
    
    // 更新状态提示，显示符合条件的文件数量
    if (scannedFiles.length > 0) {
      const updatedOptions = { ...filterOptions, ...newOptions };
      let filtered = [...scannedFiles];
      
      if (updatedOptions.byDate) {
        const targetDate = updatedOptions.selectedDate;
        filtered = filtered.filter(file => file.date === targetDate);
      }
      
      if (updatedOptions.byHour) {
        filtered = filtered.filter(file => {
          const fileHour = parseInt(file.time.split(':')[0]);
          return fileHour === updatedOptions.selectedHour;
        });
      }
      
      if (updatedOptions.byAngle) {
        filtered = filtered.filter(file => file.view_angle === updatedOptions.selectedAngle);
      }
      
      const filteredCount = filtered.length;
      const hasFilters = updatedOptions.byDate || updatedOptions.byHour || updatedOptions.byAngle;
      
      if (hasFilters) {
        setStatus({
          message: `筛选条件已更新，${filteredCount} 个文件符合条件`,
          type: filteredCount > 0 ? 'success' : 'info'
        });
      } else {
        setStatus({
          message: `已清除所有筛选条件，显示全部 ${scannedFiles.length} 个文件`,
          type: 'info'
        });
      }
    }
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
    <div className="h-screen bg-black overflow-hidden">
      {/* 纯黑色顶部导航栏 */}
      <header className="h-16 bg-black border-b border-neutral-800">
        <div className="flex items-center justify-between px-8 h-full">
          <div className="flex items-center gap-3">
            {/* <div className="p-2 bg-white rounded-lg">
              <Video className="h-5 w-5 text-black" />
            </div> */}
            <div>
              <h1 className="text-xl font-bold text-white">
                LiCamFusion
              </h1>
              <p className="text-xs text-neutral-400">智能视频合成工具</p>
            </div>
          </div>
          
          {/* 状态指示器 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${processing ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-neutral-300">
                {processing ? '处理中' : '就绪'}
              </span>
            </div>
            <div className="h-4 w-px bg-neutral-700" />
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <FileVideo className="h-4 w-4" />
              <span>{filteredFiles.length} 个文件</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* 左侧面板 - 文件目录选择 */}
        <div className="w-80 bg-neutral-900 border-r border-neutral-800">
          <div className="h-full overflow-y-auto">
            <div className="space-y-6">
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
        </div>

        {/* 中间面板 - 主工作区 */}
        <div className="flex-1 bg-neutral-950">
          <div className="h-full overflow-y-auto">
            <div className="space-y-6">
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

              {/* 文件列表 */}
              {filteredFiles.length > 0 && (
                <div className="space-y-4 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all duration-300">
                  <div className="flex items-center justify-between ml-6 mt-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <div className="p-1 bg-white rounded">
                        <FileVideo className="h-4 w-4 text-black" />
                      </div>
                      待处理视频
                    </h3>
                    <div className="text-sm text-neutral-400 pr-6">
                      {filteredFiles.length} 个文件准备合成
                    </div>
                  </div>
                  <FileList files={filteredFiles} />
                </div>
              )}
              
              {filteredFiles.length === 0 && scannedFiles.length > 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 bg-neutral-800 rounded-lg mb-4">
                    <FileVideo className="h-12 w-12 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    没有符合条件的文件
                  </h3>
                  <p className="text-neutral-400 max-w-md">
                    请调整筛选条件以查看可处理的视频文件
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧面板 - 视频处理信息 */}
        <div className="w-80 bg-neutral-900 border-l border-neutral-800">
          <div className="h-full overflow-y-auto">
            <div className="space-y-6">
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
    </div>
  );
}

export default App;