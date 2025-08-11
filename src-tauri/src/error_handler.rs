use anyhow::{Result, Error};
use log::{error, warn, info};

/// 全局错误处理函数，统一处理所有错误
pub fn handle_error(error: Error, context: &str) -> String {
    error!("错误发生在 {}: {}", context, error);
    
    // 根据错误类型返回用户友好的错误信息
    let user_message = match error.to_string().as_str() {
        msg if msg.contains("No such file or directory") => "文件或目录不存在",
        msg if msg.contains("Permission denied") => "权限不足，无法访问文件",
        msg if msg.contains("Invalid format") => "文件格式不正确",
        msg if msg.contains("ffmpeg") => "视频处理失败，请检查文件是否损坏",
        _ => "发生未知错误，请查看日志获取详细信息",
    };
    
    format!("操作失败: {}", user_message)
}

/// 包装函数调用，自动处理错误
pub fn with_error_handling<F, T>(operation: F, context: &str) -> Result<T, String>
where
    F: FnOnce() -> Result<T>,
{
    match operation() {
        Ok(result) => {
            info!("操作成功: {}", context);
            Ok(result)
        }
        Err(err) => {
            let error_msg = handle_error(err, context);
            Err(error_msg)
        }
    }
}

/// 警告处理函数
pub fn handle_warning(message: &str, context: &str) {
    warn!("警告 - {}: {}", context, message);
}

/// 信息记录函数
pub fn log_info(message: &str, context: &str) {
    info!("{}: {}", context, message);
}
