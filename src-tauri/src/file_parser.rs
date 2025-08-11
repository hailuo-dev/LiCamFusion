use std::path::{Path, PathBuf};
use regex::Regex;
use chrono::{NaiveDateTime, NaiveDate, NaiveTime, Timelike};
use anyhow::{Result, anyhow};
use walkdir::WalkDir;
use crate::error_handler::{with_error_handling, log_info};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoFile {
    pub path: PathBuf,
    pub file_type: String,
    pub date: NaiveDate,
    pub time: NaiveTime,
    pub view_angle: String,
    pub datetime: NaiveDateTime,
}

#[derive(Debug, Clone, PartialEq)]
pub enum MergeType {
    ByDate(NaiveDate),
    ByHour(NaiveDate, u32),
    ByAngle(String), // "F" 或 "A"
    ByDateAndAngle(NaiveDate, String),
    ByHourAndAngle(NaiveDate, u32, String),
}

impl VideoFile {
    /// 从文件名解析视频文件信息
    /// 文件名格式: {类型}_{日期}_{时间}_{视角}.mp4
    /// 例如: "NOR_20250629_165457_A.mp4"
    pub fn from_path(path: PathBuf) -> Result<Self> {
        let filename = path.file_stem()
            .and_then(|s| s.to_str())
            .ok_or_else(|| anyhow!("无法获取文件名"))?;

        let re = Regex::new(r"^([A-Z]+)_(\d{8})_(\d{6})_([AF])$")?;
        let caps = re.captures(filename)
            .ok_or_else(|| anyhow!("文件名格式不符合规范: {}", filename))?;

        let file_type = caps[1].to_string();
        let date_str = &caps[2];
        let time_str = &caps[3];
        let view_angle = caps[4].to_string();

        // 解析日期: YYYYMMDD
        let date = NaiveDate::parse_from_str(date_str, "%Y%m%d")
            .map_err(|_| anyhow!("无法解析日期: {}", date_str))?;

        // 解析时间: HHMMSS
        let time = NaiveTime::parse_from_str(time_str, "%H%M%S")
            .map_err(|_| anyhow!("无法解析时间: {}", time_str))?;

        let datetime = NaiveDateTime::new(date, time);

        Ok(VideoFile {
            path,
            file_type,
            date,
            time,
            view_angle,
            datetime,
        })
    }

    /// 检查视频文件是否匹配指定的合并条件
    pub fn matches_merge_type(&self, merge_type: &MergeType) -> bool {
        match merge_type {
            MergeType::ByDate(target_date) => self.date == *target_date,
            MergeType::ByHour(target_date, target_hour) => {
                self.date == *target_date && self.time.hour() == *target_hour
            }
            MergeType::ByAngle(target_angle) => {
                if target_angle == "A" {
                    true // 所有视角
                } else {
                    &self.view_angle == target_angle
                }
            }
            MergeType::ByDateAndAngle(target_date, target_angle) => {
                self.date == *target_date && self.matches_angle(target_angle)
            }
            MergeType::ByHourAndAngle(target_date, target_hour, target_angle) => {
                self.date == *target_date 
                    && self.time.hour() == *target_hour 
                    && self.matches_angle(target_angle)
            }
        }
    }

    fn matches_angle(&self, target_angle: &str) -> bool {
        if target_angle == "A" {
            true // 所有视角
        } else {
            &self.view_angle == target_angle
        }
    }
}

pub struct FileParser;

impl FileParser {
    /// 扫描指定目录下的所有视频文件
    pub fn scan_directory(dir_path: &Path) -> Result<Vec<VideoFile>, String> {
        with_error_handling(|| {
            let mut video_files = Vec::new();
            
            if !dir_path.exists() {
                return Err(anyhow!("目录不存在: {}", dir_path.display()));
            }

            for entry in WalkDir::new(dir_path)
                .into_iter()
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().is_file())
            {
                let path = entry.path();
                
                // 只处理mp4文件
                if let Some(ext) = path.extension() {
                    if ext.to_string_lossy().to_lowercase() == "mp4" {
                        match VideoFile::from_path(path.to_path_buf()) {
                            Ok(video_file) => {
                                log_info(&format!("发现视频文件: {}", path.display()), "文件扫描");
                                video_files.push(video_file);
                            }
                            Err(e) => {
                                log_info(&format!("跳过不符合格式的文件: {} ({})", path.display(), e), "文件扫描");
                            }
                        }
                    }
                }
            }

            // 按时间排序
            video_files.sort_by(|a, b| a.datetime.cmp(&b.datetime));
            
            log_info(&format!("共找到 {} 个符合格式的视频文件", video_files.len()), "文件扫描");
            Ok(video_files)
        }, "扫描视频文件")
    }

    /// 根据合并条件筛选文件
    pub fn filter_files(files: &[VideoFile], merge_type: &MergeType) -> Vec<VideoFile> {
        let filtered: Vec<VideoFile> = files
            .iter()
            .filter(|file| file.matches_merge_type(merge_type))
            .cloned()
            .collect();

        log_info(&format!("根据合并条件筛选出 {} 个文件", filtered.len()), "文件筛选");
        filtered
    }

    /// 生成输出文件名
    pub fn generate_output_filename(merge_type: &MergeType) -> String {
        match merge_type {
            MergeType::ByDate(date) => {
                format!("合成_{}.mp4", date.format("%Y%m%d"))
            }
            MergeType::ByHour(date, hour) => {
                format!("合成_{}_{:02}时.mp4", date.format("%Y%m%d"), hour)
            }
            MergeType::ByAngle(angle) => {
                let angle_name = if angle == "F" { "前视角" } else { "所有视角" };
                format!("合成_{}.mp4", angle_name)
            }
            MergeType::ByDateAndAngle(date, angle) => {
                let angle_name = if angle == "F" { "前视角" } else { "所有视角" };
                format!("合成_{}_{}.mp4", date.format("%Y%m%d"), angle_name)
            }
            MergeType::ByHourAndAngle(date, hour, angle) => {
                let angle_name = if angle == "F" { "前视角" } else { "所有视角" };
                format!("合成_{}_{}时_{}.mp4", date.format("%Y%m%d"), hour, angle_name)
            }
        }
    }
}
