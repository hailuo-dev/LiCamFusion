// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod file_parser;
mod video_processor;
mod error_handler;

use commands::*;

fn main() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            scan_files,
            start_video_processing,
            check_ffmpeg_available,
            test_progress_events,
            open_output_folder,
            open_video_file,
            get_thumbnail_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
