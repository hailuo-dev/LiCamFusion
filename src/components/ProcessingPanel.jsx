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
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-sm">
          <Video className="h-4 w-4" />
          视频处理
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 处理信息 */}
        <div className="p-3 bg-background/50 border border-border/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400">文件数量:</span>
            <Badge variant="secondary" className="text-xs">
              {files.length}个
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-blue-400">输出文件:</div>
            <div 
              className="text-xs text-white font-mono bg-black/30 p-2 rounded border break-all"
              title={getOutputFileName()}
            >
              {getOutputFileName()}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400">处理模式:</span>
            <Badge variant="outline" className="text-xs text-green-400 border-green-400/50">
              {getMergeTypeDescription()}
            </Badge>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-2">
          <Button
            onClick={startProcessing}
            disabled={!canProcess() || processing}
            className={`w-full ${
              processing 
                ? 'bg-yellow-600 hover:bg-yellow-500' 
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500'
            } text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300`}
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
          <div className="flex items-start gap-2 p-3 bg-orange-950/20 border border-orange-500/30 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
            <div className="text-xs text-orange-300">
              请确保已选择目录、扫描文件、设置筛选条件
            </div>
          </div>
        )}
      </CardContent>
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
