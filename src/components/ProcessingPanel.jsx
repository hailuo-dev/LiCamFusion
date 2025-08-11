import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Video, FileText, Settings, AlertCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

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
    
    switch (mergeType.type) {
      case 'ByDate':
        return `合成_${mergeType.date.replace(/-/g, '')}.mp4`;
      case 'ByHour':
        return `合成_${mergeType.date.replace(/-/g, '')}_${mergeType.hour.toString().padStart(2, '0')}时.mp4`;
      case 'ByAngle':
        const angleName = mergeType.angle === 'F' ? '前视角' : '所有视角';
        return `合成_${angleName}.mp4`;
      case 'ByDateAndAngle':
        const angleName2 = mergeType.angle === 'F' ? '前视角' : '所有视角';
        return `合成_${mergeType.date.replace(/-/g, '')}_${angleName2}.mp4`;
      case 'ByHourAndAngle':
        const angleName3 = mergeType.angle === 'F' ? '前视角' : '所有视角';
        return `合成_${mergeType.date.replace(/-/g, '')}_${mergeType.hour.toString().padStart(2, '0')}时_${angleName3}.mp4`;
      default:
        return `合成_所有文件.mp4`;
    }
  };

  return (
    <div className="bg-neutral-900 p-6 hover:border-neutral-700 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg">
          <Video className="h-4 w-4 text-black" />
        </div>
        <h3 className="text-lg font-semibold text-white">视频处理</h3>
      </div>
      <div className="space-y-4">
        {/* 处理信息 */}
        <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">文件数量:</span>
            <Badge className="text-xs bg-white text-black">
              {files.length}个
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-neutral-300">输出文件:</div>
            <div 
              className="text-xs text-white font-mono bg-neutral-700 p-2 rounded border border-neutral-600 break-all"
              title={getOutputFileName()}
            >
              {getOutputFileName()}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-300">处理模式:</span>
            <Badge className="text-xs bg-neutral-700 text-white border-neutral-600">
              {getMergeTypeDescription()}
            </Badge>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <Button
            onClick={startProcessing}
            disabled={!canProcess() || processing}
            variant={processing ? "warning" : "success"}
            className="w-full font-bold transform hover:scale-[1.02]"
          >
            {processing ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                处理中...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                开始合成
              </>
            )}
          </Button>
          
          {processing && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // TODO: 实现停止功能
                console.log('停止处理');
              }}
              className="w-full"
            >
              <Square className="mr-2 h-3 w-3" />
              停止
            </Button>
          )}
        </div>

        {/* 处理要求提示 */}
        {!canProcess() && (
          <div className="flex items-start gap-3 p-3 bg-neutral-800 border border-neutral-700 rounded-lg">
            <div className="p-1 bg-orange-500 rounded">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <div className="text-sm text-white">
              请确保已选择目录、扫描文件、设置筛选条件
            </div>
          </div>
        )}
      </div>
    </div>
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
