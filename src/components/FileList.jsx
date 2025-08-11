import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Video, 
  Eye, 
  Calendar, 
  Clock,
  Play,
  Copy,
  FileVideo
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

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
      // 可以在这里添加成功通知
      console.log(`正在播放: ${file.filename}`);
    } catch (error) {
      console.error('播放视频失败:', error);
      // 可以在这里添加错误通知
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
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
        <Video className="w-3 h-3 mr-1" />
        前视角
      </Badge> : 
      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
        <Video className="w-3 h-3 mr-1" />
        所有视角
      </Badge>;
  };

  return (
    <>
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Video className="h-5 w-5" />
            待处理文件列表 ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <div 
                  key={file.path || index} 
                  className="relative bg-background/30 border border-border/50 rounded-lg p-4 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
                >
                  {/* 文件序号角标 */}
                  <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold z-10">
                    {index + 1}
                  </div>

                  {/* 视频预览区域 */}
                  <div className="relative h-20 mb-3 bg-background/50 rounded-lg flex items-center justify-center overflow-hidden">
                    <Play className="h-8 w-8 text-primary drop-shadow-lg" />
                    
                    {/* 悬停时显示的播放按钮 */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-primary/90 hover:bg-primary text-primary-foreground rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVideo(file);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 文件信息 */}
                  <div className="space-y-2">
                    <div>
                      <div 
                        className="font-medium text-sm text-foreground cursor-pointer hover:text-primary transition-colors duration-200 line-clamp-1"
                        title={file.filename}
                        onClick={() => showFileDetails(file)}
                      >
                        {file.filename}
                      </div>
                      <div className="mt-1">
                        {getAngleTag(file.view_angle)}
                      </div>
                    </div>

                    {/* 时间和大小信息 */}
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-blue-400" />
                        <span>{file.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-green-400" />
                        <span>{file.time}</span>
                      </div>
                      {file.size && (
                        <div className="text-xs text-muted-foreground">
                          大小: {formatFileSize(file.size)}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          playVideo(file);
                        }}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        播放
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          showFileDetails(file);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        详情
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 文件详情对话框 */}
      <Dialog open={modalVisible} onOpenChange={setModalVisible}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <FileVideo className="h-5 w-5" />
              文件详情
            </DialogTitle>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">文件名</label>
                  <div className="p-2 bg-background/50 rounded border font-mono text-sm text-primary">
                    {selectedFile.filename}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">完整路径</label>
                  <div className="p-2 bg-background/50 rounded border text-xs text-muted-foreground break-all flex items-center justify-between">
                    <span className="flex-1">{selectedFile.path}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(selectedFile.path)}
                      className="ml-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">录制日期</label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span>{selectedFile.date}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">录制时间</label>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-green-400" />
                      <span>{selectedFile.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">视角</label>
                    <div>{getAngleTag(selectedFile.view_angle)}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">文件类型</label>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                      {selectedFile.file_type || 'MP4'}
                    </Badge>
                  </div>
                </div>
                
                {(selectedFile.size || selectedFile.duration) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedFile.size && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">文件大小</label>
                        <div className="text-sm">{formatFileSize(selectedFile.size)}</div>
                      </div>
                    )}
                    {selectedFile.duration && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">视频时长</label>
                        <div className="text-sm">{selectedFile.duration}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalVisible(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileList;
