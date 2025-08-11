import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Folder, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { cn } from '@/lib/utils';

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

  const getStatusIcon = () => {
    switch (status.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'processing': return <Info className="h-5 w-5 text-blue-400" />;
      default: return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (status.type) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'processing': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {/* 成功完成状态 - 特殊布局 */}
      {status.type === 'success' && outputFile ? (
        <Card className="relative overflow-hidden border-green-500/50 bg-gradient-to-br from-green-950/50 to-blue-950/50 shadow-lg">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 to-blue-400" />
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-green-400">合成完成!</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-blue-400 mb-2 font-medium">生成文件:</p>
                <div className="space-y-3">
                  <div className="rounded-lg bg-black/30 p-3 border border-border/50">
                    <p className="font-mono text-xs text-white break-all leading-relaxed" title={outputFile}>
                      {outputFile}
                    </p>
                  </div>
                  <Button
                    onClick={openOutputFolder}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-500 hover:to-green-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    打开文件夹
                  </Button>
                </div>
              </div>

              {/* 完成进度条 */}
              <div className="text-center space-y-2">
                <Progress value={100} className="h-2" />
                <p className="text-sm text-green-400 font-medium">处理完成！</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 其他状态的显示 */
        <div className="space-y-4">
          <Card className={cn(
            "shadow-lg transition-all duration-300",
            status.type === 'error' && "border-red-500/50 bg-red-950/20",
            status.type === 'success' && "border-green-500/50 bg-green-950/20",
            status.type === 'processing' && "border-blue-500/50 bg-blue-950/20"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon()}
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">{status.message}</p>
                  <Badge variant={getStatusBadgeVariant()} className="text-xs">
                    {status.type === 'success' && '成功'}
                    {status.type === 'error' && '错误'}
                    {status.type === 'processing' && '处理中'}
                    {status.type === 'info' && '信息'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 进度条 */}
          {(processing || (status.type === 'success' && progress > 0)) && (
            <Card className="shadow-lg">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium text-blue-400">处理进度</p>
                <Progress value={Math.round(progress)} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {processing ? '正在处理中，请耐心等待...' : '处理完成！'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 处理详情 */}
          {processing && (
            <Card className="border-blue-500/30 bg-blue-950/20 shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm text-blue-300">
                  <div className="flex items-center gap-2">
                    <span>📹</span>
                    <span>正在使用 FFmpeg 合成视频文件</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span>请保持应用程序运行状态</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>💾</span>
                    <span>处理完成后将自动保存到输出目录</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusDisplay;
