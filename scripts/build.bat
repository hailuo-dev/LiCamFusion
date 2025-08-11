@echo off
echo ===================================
echo  构建 LiCam 2.0 生产版本
echo ===================================

echo.
echo 正在构建应用...
npm run tauri build

echo.
echo 构建完成！生成的文件位置:
echo   - EXE: src-tauri\target\release\licam-tauri.exe
echo   - MSI: src-tauri\target\release\bundle\msi\
echo.
pause
