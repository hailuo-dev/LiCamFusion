use std::path::PathBuf;
use tauri::{command, AppHandle, Emitter};
use crate::file_parser::{FileParser, VideoFile, MergeType};
use crate::video_processor::VideoProcessor;
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VideoFileDto {
    pub path: String,
    pub filename: String,
    pub file_type: String,
    pub date: String,
    pub time: String,
    pub view_angle: String,
    pub size: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MergeTypeDto {
    #[serde(rename = "type")]
    pub merge_type: String,
    pub date: Option<String>,
    pub hour: Option<u32>,
    pub angle: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProgressUpdate {
    pub progress: f32,
    pub message: String,
}

impl From<VideoFile> for VideoFileDto {
    fn from(video_file: VideoFile) -> Self {
        let filename = video_file.path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();
            
        let size = std::fs::metadata(&video_file.path)
            .ok()
            .map(|m| m.len());

        VideoFileDto {
            path: video_file.path.display().to_string(),
            filename,
            file_type: video_file.file_type,
            date: video_file.date.format("%Y-%m-%d").to_string(),
            time: video_file.time.format("%H:%M:%S").to_string(),
            view_angle: video_file.view_angle,
            size,
        }
    }
}

impl TryFrom<MergeTypeDto> for MergeType {
    type Error = String;
    
    fn try_from(dto: MergeTypeDto) -> Result<Self, Self::Error> {
        match dto.merge_type.as_str() {
            "ByDate" => {
                let date_str = dto.date.ok_or("ByDate需要date参数")?;
                let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
                    .map_err(|_| "无效的日期格式")?;
                Ok(MergeType::ByDate(date))
            }
            "ByHour" => {
                let date_str = dto.date.ok_or("ByHour需要date参数")?;
                let hour = dto.hour.ok_or("ByHour需要hour参数")?;
                let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
                    .map_err(|_| "无效的日期格式")?;
                Ok(MergeType::ByHour(date, hour))
            }
            "ByAngle" => {
                let angle = dto.angle.ok_or("ByAngle需要angle参数")?;
                Ok(MergeType::ByAngle(angle))
            }
            "ByDateAndAngle" => {
                let date_str = dto.date.ok_or("ByDateAndAngle需要date参数")?;
                let angle = dto.angle.ok_or("ByDateAndAngle需要angle参数")?;
                let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
                    .map_err(|_| "无效的日期格式")?;
                Ok(MergeType::ByDateAndAngle(date, angle))
            }
            "ByHourAndAngle" => {
                let date_str = dto.date.ok_or("ByHourAndAngle需要date参数")?;
                let hour = dto.hour.ok_or("ByHourAndAngle需要hour参数")?;
                let angle = dto.angle.ok_or("ByHourAndAngle需要angle参数")?;
                let date = NaiveDate::parse_from_str(&date_str, "%Y-%m-%d")
                    .map_err(|_| "无效的日期格式")?;
                Ok(MergeType::ByHourAndAngle(date, hour, angle))
            }
            _ => Err(format!("未知的合并类型: {}", dto.merge_type))
        }
    }
}

#[command]
pub async fn scan_files(source_dir: String) -> Result<Vec<VideoFileDto>, String> {
    let source_path = PathBuf::from(&source_dir);
    
    match FileParser::scan_directory(&source_path) {
        Ok(files) => {
            let dto_files: Vec<VideoFileDto> = files
                .into_iter()
                .map(VideoFileDto::from)
                .collect();
            Ok(dto_files)
        }
        Err(err) => Err(err)
    }
}

#[command]
pub async fn start_video_processing(
    app_handle: AppHandle,
    files: Vec<VideoFileDto>,
    output_dir: String,
    merge_type: MergeTypeDto
) -> Result<String, String> {
    // 转换DTO为VideoFile
    let video_files: Result<Vec<VideoFile>, String> = files
        .into_iter()
        .map(|dto| {
            VideoFile::from_path(PathBuf::from(&dto.path))
                .map_err(|e| e.to_string())
        })
        .collect();
    
    let video_files = video_files?;
    
    // 转换合并类型
    let merge_type = MergeType::try_from(merge_type)?;
    
    // 生成输出文件名
    let output_filename = FileParser::generate_output_filename(&merge_type);
    let output_path = PathBuf::from(&output_dir).join(&output_filename);
    
    // 执行视频合成，带进度回调
    let app_handle_clone = app_handle.clone();
    let progress_callback = move |progress: f32, message: String| {
        println!("发射进度事件: progress={}, message={}", progress, &message);
        let update = ProgressUpdate { progress, message };
        if let Err(e) = app_handle_clone.emit("processing-progress", &update) {
            println!("发射进度事件失败: {:?}", e);
        }
    };
    
    match VideoProcessor::merge_videos_with_progress(&video_files, &output_path, progress_callback) {
        Ok(_) => {
            // 发射完成事件
            println!("发射完成事件: {}", output_path.display());
            if let Err(e) = app_handle.emit("processing-complete", &output_path.display().to_string()) {
                println!("发射完成事件失败: {:?}", e);
            }
            Ok(output_path.display().to_string())
        },
        Err(err) => {
            // 发射错误事件
            println!("发射错误事件: {}", err);
            if let Err(e) = app_handle.emit("processing-error", &err) {
                println!("发射错误事件失败: {:?}", e);
            }
            Err(err)
        }
    }
}

#[command]
pub async fn check_ffmpeg_available() -> bool {
    VideoProcessor::check_ffmpeg()
}

#[command]
pub async fn test_progress_events(app_handle: AppHandle) -> Result<(), String> {
    println!("测试进度事件发射");
    
    for i in 0..=10 {
        let progress = i as f32 * 10.0;
        let message = format!("测试进度: {}%", progress);
        let update = ProgressUpdate { progress, message: message.clone() };
        
        println!("发射测试进度事件: progress={}, message={}", progress, &message);
        if let Err(e) = app_handle.emit("processing-progress", &update) {
            println!("发射测试进度事件失败: {:?}", e);
            return Err(format!("发射事件失败: {:?}", e));
        }
        
        // 添加小延迟以便观察
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    
    println!("发射测试完成事件");
    if let Err(e) = app_handle.emit("processing-complete", "test_output.mp4") {
        println!("发射完成事件失败: {:?}", e);
        return Err(format!("发射完成事件失败: {:?}", e));
    }
    
    Ok(())
}

#[command]
pub async fn open_output_folder(output_path: String) -> Result<(), String> {
    let path = PathBuf::from(&output_path);
    let folder_path = if path.is_file() {
        path.parent().unwrap_or(&path)
    } else {
        &path
    };

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(folder_path)
            .spawn()
            .map_err(|e| format!("无法打开文件夹: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(folder_path)
            .spawn()
            .map_err(|e| format!("无法打开文件夹: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(folder_path)
            .spawn()
            .map_err(|e| format!("无法打开文件夹: {}", e))?;
    }

    Ok(())
}

#[command]
pub async fn open_video_file(file_path: String) -> Result<(), String> {
    let path = PathBuf::from(&file_path);
    
    // 检查文件是否存在
    if !path.exists() {
        return Err(format!("文件不存在: {}", file_path));
    }
    
    // 检查文件是否为视频文件
    let extension = path.extension()
        .and_then(|s| s.to_str())
        .unwrap_or("")
        .to_lowercase();
    
    match extension.as_str() {
        "mp4" | "avi" | "mov" | "mkv" | "wmv" | "flv" | "webm" => {
            // 使用系统默认播放器打开视频文件
            #[cfg(target_os = "windows")]
            {
                std::process::Command::new("cmd")
                    .args(["/C", "start", "", &file_path])
                    .spawn()
                    .map_err(|e| format!("无法打开视频文件: {}", e))?;
            }
            
            #[cfg(target_os = "macos")]
            {
                std::process::Command::new("open")
                    .arg(&file_path)
                    .spawn()
                    .map_err(|e| format!("无法打开视频文件: {}", e))?;
            }
            
            #[cfg(target_os = "linux")]
            {
                std::process::Command::new("xdg-open")
                    .arg(&file_path)
                    .spawn()
                    .map_err(|e| format!("无法打开视频文件: {}", e))?;
            }
            
            Ok(())
        }
        _ => Err(format!("不支持的文件格式: {}", extension))
    }
}