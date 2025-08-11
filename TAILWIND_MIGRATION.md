# Tailwind CSS 和 shadcn/ui 迁移指南

## 已完成的工作

### 1. 安装和配置

- ✅ 安装了 Tailwind CSS 及其依赖包
- ✅ 安装了 `@tailwindcss/postcss` 插件（新版本要求）
- ✅ 创建了 `tailwind.config.js` 和 `postcss.config.js` 配置文件
- ✅ 配置了 CSS 变量系统以支持深色主题
- ✅ 更新了 Vite 配置以支持路径别名 `@/*`

### 2. shadcn/ui 组件

已创建的组件：

- ✅ `Button` - 替代 Ant Design Button
- ✅ `Card` - 替代 Ant Design Card
- ✅ `Input` - 替代 Ant Design Input
- ✅ `Progress` - 替代 Ant Design Progress
- ✅ `Badge` - 用于状态显示
- ✅ `Checkbox` - 替代 Ant Design Checkbox
- ✅ `Select` - 替代 Ant Design Select
- ✅ `Slider` - 替代 Ant Design Slider
- ✅ `Dialog` - 替代 Ant Design Modal
- ✅ `Calendar` & `DatePicker` - 替代 Ant Design DatePicker
- ✅ `Popover` - 弹出层组件

### 3. 组件迁移

- ✅ `StatusDisplay.jsx` - 完全迁移到 shadcn/ui 和 Tailwind CSS
- ✅ `FileSelector.jsx` - 完全迁移到 shadcn/ui 和 Tailwind CSS
- ✅ `FilterOptions.jsx` - 完全迁移到 shadcn/ui 和 Tailwind CSS
- ✅ `ProcessingPanel.jsx` - 完全迁移到 shadcn/ui 和 Tailwind CSS
- ✅ `FileList.jsx` - 完全迁移到 shadcn/ui 和 Tailwind CSS
- ✅ `App.jsx` - 主布局使用 Tailwind CSS

### 4. 样式系统

- ✅ 使用 CSS 变量支持主题切换
- ✅ 保持原有的深色科技感主题
- ✅ 改进的渐变背景和玻璃态效果
- ✅ 响应式设计支持

## 使用方法

### 导入组件

```jsx
import { Button, Card, Input } from "@/components/ui";
// 或者
import { Button } from "@/components/ui/button";
```

### 样式类名

项目现在使用 Tailwind CSS 的实用工具类：

```jsx
<div className="flex items-center gap-2 p-4 bg-background/50 border border-border rounded-lg">
  // 内容
</div>
```

### 主题变量

在 `src/index.css` 中定义了 CSS 变量，支持深色主题：

- `--primary` - 主要颜色（蓝色）
- `--background` - 背景颜色
- `--foreground` - 前景文字颜色
- `--border` - 边框颜色
- 等等...

## 迁移成果

🎉 **全部组件迁移完成！**

所有组件已成功从 Ant Design 迁移到 shadcn/ui + Tailwind CSS：

- 保持了原有的功能和交互逻辑
- 提升了视觉设计的现代感
- 改善了性能和可维护性
- 统一了设计系统和组件 API

## 故障排除

### Tailwind CSS v4.x 配置

项目使用 Tailwind CSS v4.x，配置方式与 v3.x 有重大变化：

**主要变化：**

1. **不再使用 `tailwind.config.js`** - 配置直接写在 CSS 文件中
2. **使用 `@theme` 指令** - 在 CSS 中定义主题变量
3. **PostCSS 插件** - 使用 `@tailwindcss/postcss`

**配置文件：**

1. `postcss.config.js`：

   ```js
   export default {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   };
   ```

2. `src/index.css`：

   ```css
   @import "tailwindcss";

   @theme {
     --color-background: #0a0a0a;
     --color-foreground: #ffffff;
     --color-primary: #00d9ff;
     /* ... 其他颜色变量 */
   }
   ```

**故障排除：**

如果遇到 `border-border` 未知工具类错误，确保：

- 使用正确的 v4.x 语法
- CSS 变量定义正确
- PostCSS 配置使用 `@tailwindcss/postcss`

## 优势

1. **更好的性能** - Tailwind CSS 的 JIT 编译只包含用到的样式
2. **一致的设计系统** - shadcn/ui 提供了一致的组件 API
3. **更好的可维护性** - 组件化的设计系统
4. **类型安全** - shadcn/ui 组件有完整的 TypeScript 支持
5. **更灵活的定制** - 可以轻松修改主题和样式
