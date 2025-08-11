import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderOpen, Download, Upload } from 'lucide-react';
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
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary text-sm">
          <FolderOpen className="h-4 w-4" />
          目录设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 源目录选择 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <Upload className="h-3 w-3" />
            源目录
          </div>
          <div className="flex gap-2">
            <Input
              value={sourceDir}
              placeholder="选择视频目录..."
              readOnly
              className="text-xs bg-background/50 border-border/50 focus:border-primary/50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={selectSourceDir}
              disabled={disabled}
              className="shrink-0 border-border/50 hover:border-primary/50"
            >
              <FolderOpen className="h-3 w-3 mr-1" />
              浏览
            </Button>
          </div>
        </div>

        {/* 输出目录选择 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-green-400">
            <Download className="h-3 w-3" />
            输出目录
          </div>
          <div className="flex gap-2">
            <Input
              value={outputDir}
              placeholder="选择输出目录..."
              readOnly
              className="text-xs bg-background/50 border-border/50 focus:border-primary/50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={selectOutputDir}
              disabled={disabled}
              className="shrink-0 border-border/50 hover:border-primary/50"
            >
              <FolderOpen className="h-3 w-3 mr-1" />
              浏览
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileSelector;
