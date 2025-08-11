import React, { useState, useEffect } from 'react';
import { Video, ImageIcon } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

const VideoThumbnail = ({ file, className = "", onImageLoad = null }) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (file.thumbnail_path) {
        setLoading(true);
        try {
          // 获取图片的二进制数据
          const imageData = await invoke('get_thumbnail_data', { 
            thumbnailPath: file.thumbnail_path 
          });
          
          // 根据文件扩展名确定MIME类型
          const extension = file.thumbnail_path.toLowerCase().split('.').pop();
          let mimeType = 'image/jpeg'; // 默认
          switch (extension) {
            case 'png':
              mimeType = 'image/png';
              break;
            case 'jpg':
            case 'jpeg':
              mimeType = 'image/jpeg';
              break;
            case 'bmp':
              mimeType = 'image/bmp';
              break;
            case 'webp':
              mimeType = 'image/webp';
              break;
          }
          
          // 将二进制数据转换为Blob URL
          const blob = new Blob([new Uint8Array(imageData)], { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          setThumbnailUrl(url);
          setImageError(false);
        } catch (error) {
          console.warn('无法加载缩略图:', error);
          setImageError(true);
        } finally {
          setLoading(false);
        }
      }
    };

    loadThumbnail();
    
    // 清理函数，避免内存泄漏
    return () => {
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [file.thumbnail_path]);

  const handleImageError = () => {
    setImageError(true);
    if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailUrl);
    }
    setThumbnailUrl(null);
  };

  const handleImageLoad = () => {
    setImageError(false);
    if (onImageLoad) {
      onImageLoad();
    }
  };

  // 如果有缩略图且没有错误，显示图片
  if (thumbnailUrl && !imageError) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img
          src={thumbnailUrl}
          alt={`${file.filename} 缩略图`}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {loading && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-neutral-400" />
          </div>
        )}
      </div>
    );
  }

  // 如果没有缩略图或者加载失败，显示默认的视频图标
  return (
    <div className={`bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center ${className}`}>
      <Video className="h-12 w-12 text-neutral-400" />
    </div>
  );
};

export default VideoThumbnail;
