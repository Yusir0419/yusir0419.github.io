# WebIDE

一个基于 Web 的代码编辑器，使用 ACE Editor 构建，托管在 GitHub Pages。

## 访问地址

**https://www.ting1127.top**

## 功能特性

- 📁 **项目管理**：创建、重命名、删除项目
- 📝 **代码编辑**：基于 ACE Editor 的强大编辑器
- 🌲 **文件树**：可视化文件结构，支持文件/文件夹操作
- 💾 **本地存储**：数据存储在浏览器本地
- 📱 **移动优化**：支持下拉刷新、触摸操作
- 🎨 **暗色主题**：专为编码优化的界面

## 目录结构

```
/
├── index.html          # 重定向到 /webide/
├── webide/
│   ├── index.html      # 项目列表页
│   ├── editor.html     # 编辑器页
│   ├── css/
│   │   ├── app.css     # 通用样式
│   │   └── editor.css  # 编辑器样式
│   ├── js/
│   │   ├── bridge.js       # Android 桥接
│   │   ├── utils.js        # 工具函数
│   │   ├── dialog.js       # 对话框组件
│   │   ├── projectList.js  # 项目列表逻辑
│   │   ├── fileTree.js     # 文件树组件
│   │   └── editor.js       # 编辑器核心
│   └── lib/
│       └── ace/            # ACE Editor 库
├── CNAME               # 自定义域名
└── .github/workflows/  # GitHub Actions 部署配置
```

## 本地开发

```bash
# 启动本地服务器
python3 -m http.server 8080

# 访问
# http://127.0.0.1:8080/
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动部署到 Pages。

## 技术栈

- **编辑器**：ACE Editor
- **存储**：LocalStorage
- **部署**：GitHub Pages
- **UI**：原生 HTML/CSS/JS（无框架依赖）

## License

MIT
