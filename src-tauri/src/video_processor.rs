use std::path::Path;
use std::process::Command;
use std::fs;
use anyhow::{Result, anyhow};
use crate::file_parser::VideoFile;
use crate::error_handler::{with_error_handling, log_info};

pub struct VideoProcessor;

impl VideoProcessor {
    /// 带进度回调的合成视频文件
    pub fn merge_videos_with_progress<F>(
        files: &[VideoFile], 
        output_path: &Path, 
        progress_callback: F
    ) -> Result<(), String> 
    where
        F: Fn(f32, String) + Send + 'static,
    {
        with_error_handling(|| {
            if files.is_empty() {
                return Err(anyhow!("没有找到需要合成的视频文件"));
            }

            log_info(&format!("开始合成 {} 个视频文件", files.len()), "视频合成");
            println!("调用进度回调: 0%");
            progress_callback(0.0, "准备合成视频文件...".to_string());

            // 确保输出目录存在
            if let Some(parent) = output_path.parent() {
                fs::create_dir_all(parent)?;
            }
            println!("调用进度回调: 10%");
            progress_callback(10.0, "创建输出目录...".to_string());

            // 创建临时文件列表
            let temp_list_path = output_path.parent()
                .unwrap_or_else(|| Path::new("."))
                .join("temp_file_list.txt");

            // 生成文件列表内容
            let mut file_list_content = String::new();
            for file in files.iter() {
                file_list_content.push_str(&format!("file '{}'\n", file.path.display()));
            }

            // 写入临时文件列表
            fs::write(&temp_list_path, file_list_content)?;
            println!("调用进度回调: 20%");
            progress_callback(20.0, "生成文件列表...".to_string());

            log_info("开始执行FFmpeg合成", "视频合成");
            println!("调用进度回调: 30%");
            progress_callback(30.0, "启动FFmpeg进行视频合成...".to_string());

            // 使用FFmpeg合成视频
            let output = Command::new("ffmpeg")
                .arg("-f")
                .arg("concat")
                .arg("-safe")
                .arg("0")
                .arg("-i")
                .arg(&temp_list_path)
                .arg("-c")
                .arg("copy")
                .arg("-y") // 覆盖输出文件
                .arg(output_path)
                .output();

            println!("调用进度回调: 80%");
            progress_callback(80.0, "正在合成视频，请稍候...".to_string());

            // 清理临时文件
            let _ = fs::remove_file(&temp_list_path);

            match output {
                Ok(result) => {
                    if result.status.success() {
                        println!("调用进度回调: 100%");
                        progress_callback(100.0, "视频合成完成！".to_string());
                        log_info(&format!("视频合成成功: {}", output_path.display()), "视频合成");
                        Ok(())
                    } else {
                        let error_msg = String::from_utf8_lossy(&result.stderr);
                        Err(anyhow!("FFmpeg执行失败: {}", error_msg))
                    }
                }
                Err(e) => {
                    Err(anyhow!("无法启动FFmpeg: {}。请确保FFmpeg已正确安装并添加到PATH环境变量中", e))
                }
            }
        }, "视频合成处理")
    }

    /// 检查FFmpeg是否可用
    pub fn check_ffmpeg() -> bool {
        match Command::new("ffmpeg").arg("-version").output() {
            Ok(output) => output.status.success(),
            Err(_) => false,
        }
    }
}
