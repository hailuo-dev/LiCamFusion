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
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing': return <Info className="h-5 w-5 text-white" />;
      default: return <Info className="h-5 w-5 text-white" />;
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
        <div className="relative overflow-hidden bg-neutral-900 border border-green-500 rounded-lg">
          <div className="absolute inset-x-0 top-0 h-1 bg-green-500" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-500">合成完成!</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white mb-2 font-medium">生成文件:</p>
                <div className="space-y-3">
                  <div className="rounded-lg bg-neutral-800 p-3 border border-neutral-700">
                    <p className="font-mono text-xs text-white break-all leading-relaxed" title={outputFile}>
                      {outputFile}
                    </p>
                  </div>
                  <Button
                    onClick={openOutputFolder}
                    variant="default"
                    className="w-full font-bold"
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    打开文件夹
                  </Button>
                </div>
              </div>

              {/* 完成进度条 */}
              <div className="text-center space-y-2">
                <Progress value={100} className="h-2 bg-neutral-800 " />
                <p className="text-sm text-green-500 font-medium">处理完成！</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 其他状态的显示 */
        <div className="space-y-4">
          <div className={cn(
            "bg-neutral-900 border rounded-lg p-4 transition-all duration-300",
            status.type === 'error' && "border-red-500",
            status.type === 'success' && "border-green-500",
            status.type === 'processing' && "border-neutral-700"
          )}>
            <div className="flex items-start gap-3">
              {getStatusIcon()}
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-white">{status.message}</p>
                <Badge className={cn(
                  "text-xs",
                  status.type === 'success' && "bg-green-500 text-white",
                  status.type === 'error' && "bg-red-500 text-white",
                  status.type === 'processing' && "bg-neutral-700 text-white"
                )}>
                  {status.type === 'success' && '成功'}
                  {status.type === 'error' && '错误'}
                  {status.type === 'processing' && '处理中'}
                  {status.type === 'info' && '信息'}
                </Badge>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          {(processing || (status.type === 'success' && progress > 0)) && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-white">处理进度</p>
              <Progress value={Math.round(progress)} className="h-2 bg-neutral-800" />
              <p className="text-xs text-neutral-400 text-center">
                {processing ? '正在处理中，请耐心等待...' : '处理完成！'}
              </p>
            </div>
          )}

          {/* 处理详情 */}
          {processing && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <div className="space-y-2 text-sm text-white">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatusDisplay;
