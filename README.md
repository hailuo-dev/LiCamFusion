# LiCam 2.0 - 现代化行车记录仪视频合成工具

基于 Tauri + React + Ant Design 的现代化桌面应用程序。

## ✨ 新特性

- 🎨 现代化 UI 设计，基于 Ant Design 组件库
- 🚀 使用 Tauri 框架，结合了 Rust 性能和 Web 前端的灵活性
- 📱 响应式设计，支持不同屏幕尺寸
- 🔧 实时进度显示和状态反馈
- 🎯 更直观的文件筛选和管理
- 💡 更好的用户体验和交互设计

## 🔧 技术栈

### 前端

- **React 18** - 现代化的 UI 库
- **Ant Design 5** - 企业级 UI 组件库
- **Vite** - 快速构建工具
- **TypeScript/JavaScript** - 类型安全的开发体验

### 后端

- **Rust** - 高性能系统编程语言
- **Tauri** - 安全的桌面应用框架
- **FFmpeg** - 视频处理核心

## 🚀 开发环境设置

### 前置要求

1. **Node.js** (推荐 18.x 或更高版本)
2. **Rust** (最新稳定版)
3. **FFmpeg** (需要添加到系统 PATH)

### 安装依赖

```bash
# 安装前端依赖
npm install

# 检查Tauri环境
npm run tauri info
```

### 开发模式

```bash
# 启动开发服务器
npm run tauri dev
```

### 构建生产版本

```bash
# 构建应用
npm run tauri build
```

## 📁 项目结构

```
licam-tauri/
├── src/                    # React前端源码
│   ├── components/         # UI组件
│   │   ├── FileSelector.jsx
│   │   ├── FilterOptions.jsx
│   │   ├── ProcessingPanel.jsx
│   │   ├── StatusDisplay.jsx
│   │   └── FileList.jsx
│   ├── App.jsx            # 主应用组件
│   ├── App.css            # 样式文件
│   └── main.jsx           # 入口文件
├── src-tauri/             # Rust后端源码
│   ├── src/
│   │   ├── main.rs        # 主程序
│   │   ├── commands.rs    # Tauri命令接口
│   │   ├── file_parser.rs # 文件解析模块
│   │   ├── video_processor.rs # 视频处理模块
│   │   └── error_handler.rs # 错误处理模块
│   ├── Cargo.toml         # Rust依赖配置
│   └── tauri.conf.json    # Tauri配置
├── package.json           # 前端依赖配置
├── vite.config.js         # Vite构建配置
└── index.html             # HTML模板
```

## 🎯 核心功能

1. **文件扫描** - 智能扫描并识别行车记录仪文件
2. **多重筛选** - 支持按日期、时间、视角的组合筛选
3. **视频合成** - 使用 FFmpeg 进行高效视频合成
4. **进度监控** - 实时显示处理进度和状态
5. **文件管理** - 直观的文件列表和详情查看

## 📋 使用说明

1. **选择目录**

   - 选择包含行车记录仪文件的源目录
   - 选择合成文件的输出目录

2. **扫描文件**

   - 点击"扫描视频文件"按钮
   - 系统将自动识别符合格式的 MP4 文件

3. **设置筛选条件**

   - 按日期：合成指定日期的文件
   - 按小时：合成指定小时段的文件
   - 按视角：选择前视角(F)或全部视角(A)
   - 支持多条件组合

4. **开始合成**
   - 确认筛选结果
   - 点击"开始合成"按钮
   - 等待处理完成

## 🔍 文件格式要求

支持的文件命名格式：`{类型}_{日期}_{时间}_{视角}.mp4`

示例：

- `NOR_20250629_165457_F.mp4` (前视角)
- `NOR_20250629_165457_A.mp4` (全视角)

## ⚙️ 系统要求

- **操作系统**: Windows 10/11 (64 位)
- **内存**: 建议 4GB 以上
- **存储**: 根据视频文件大小而定
- **FFmpeg**: 必须安装并配置环境变量

## 🛠️ 开发者信息

- **应用名称**: LiCam 2.0
- **版本**: 2.0.0
- **作者**: hailuodev
- **邮箱**: hi@hailuo.dev
- **许可证**: MIT

## 📄 更新日志

### v2.0.0 (2025)

- 🎨 全新的现代化 UI 设计
- 🚀 使用 Tauri 替代 egui 框架
- 📱 响应式设计支持
- 💡 改善的用户体验
- 🔧 更好的错误处理和状态显示
- ⚡ 优化的性能和启动速度

### v1.0.0

- 基础的视频合成功能
- egui 界面
- 基本的筛选选项

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。
