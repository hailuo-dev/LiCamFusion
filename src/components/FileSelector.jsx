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
    <div className="bg-neutral-900 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg">
          <FolderOpen className="h-5 w-5 text-black" />
        </div>
        <h3 className="text-lg font-semibold text-white">目录设置</h3>
      </div>
      <div className="space-y-4">
        {/* 源目录选择 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Upload className="h-4 w-4 text-neutral-400" />
            源目录
          </div>
          <div className="flex gap-2">
            <Input
              value={sourceDir}
              placeholder="选择视频目录..."
              readOnly
              className="text-sm bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={selectSourceDir}
              disabled={disabled}
              className="shrink-0 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:border-none hover:text-white cursor-pointer font-semibold transition-all duration-300"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              浏览
            </Button>
          </div>
        </div>

        {/* 输出目录选择 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Download className="h-4 w-4 text-neutral-400" />
            输出目录
          </div>
          <div className="flex gap-2">
            <Input
              value={outputDir}
              placeholder="选择输出目录..."
              readOnly
              className="text-sm bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-white"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={selectOutputDir}
              disabled={disabled}
              className="shrink-0 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-green-600 hover:border-none hover:text-white cursor-pointer font-semibold transition-all duration-300"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              浏览
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSelector;
