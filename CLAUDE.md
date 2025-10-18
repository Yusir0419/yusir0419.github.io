# WebIDE 项目说明

## 项目概述
本项目是一个基于 ACE Editor 的 Web IDE，托管在 GitHub Pages。

## 技术架构
- **前端框架**：原生 HTML/CSS/JavaScript（零依赖）
- **编辑器核心**：ACE Editor
- **数据存储**：浏览器 LocalStorage
- **部署方式**：GitHub Actions → GitHub Pages

## 主要模块

### 1. 项目管理 (index.html + projectList.js)
- 项目列表展示（网格布局）
- 新建/重命名/删除项目
- 下拉刷新
- 长按右键菜单

### 2. 代码编辑器 (editor.html + editor.js)
- ACE Editor 集成
- 多文件支持
- 实时保存
- 语法高亮
- 状态栏显示（文件名、行列号、语言）

### 3. 文件树 (fileTree.js)
- 树形展示项目文件结构
- 新建/重命名/删除文件/文件夹
- 可折叠侧边栏
- 右键菜单操作

### 4. 通用组件
- **dialog.js**：通用对话框（输入、确认）
- **utils.js**：工具函数（存储读写、路径处理等）
- **bridge.js**：Android WebView 桥接接口

## 开发注意事项

### 路径规范
- 所有资源使用相对路径（css/、js/、lib/）
- 确保在 /webide/ 子目录下能独立运行

### 存储结构
```js
// LocalStorage 键名规范
projects          // 项目列表数组 [{ name, createdAt }]
project_{name}    // 单个项目的文件树 JSON
```

### Android 桥接
```js
// 调用 Android 原生功能（如果在 WebView 中）
window.AndroidBridge?.showToast(message)
window.AndroidBridge?.saveFile(path, content)
```

## 未来优化方向
- [ ] 添加代码搜索功能
- [ ] 支持 Git 集成
- [ ] 多标签编辑
- [ ] 代码格式化
- [ ] 主题切换
- [ ] 快捷键自定义

## 维护说明
修改代码时务必保持：
1. 代码风格一致（缩进、命名）
2. 移动端体验优先
3. 避免引入第三方依赖
4. 确保离线可用
