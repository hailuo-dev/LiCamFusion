@echo off
echo ===================================
echo  LiCam 2.0 环境设置脚本
echo ===================================

echo.
echo 正在检查 Node.js...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo.
echo 正在检查 Rust...
rustc --version
if %errorlevel% neq 0 (
    echo 错误: 未找到 Rust，请先安装 Rust
    pause
    exit /b 1
)

echo.
echo 正在检查 FFmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 未找到 FFmpeg，应用运行需要 FFmpeg
    echo 请访问 https://ffmpeg.org/download.html 下载并安装
    pause
)

echo.
echo 正在安装 npm 依赖...
npm install
if %errorlevel% neq 0 (
    echo 错误: npm 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 正在检查 Tauri 环境...
npm run tauri info

echo.
echo ===================================
echo  环境设置完成！
echo ===================================
echo.
echo 开发命令:
echo   npm run tauri dev     - 启动开发模式
echo   npm run tauri build   - 构建生产版本
echo.
pause
