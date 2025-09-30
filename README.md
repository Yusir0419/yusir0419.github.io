# ting1127.top / GitHub Pages 站点

一个轻量的静态网站，使用 GitHub Actions 部署到 GitHub Pages。

## 目录结构
- `index.html`：首页（已抽离样式与脚本）
- `404.html`：未找到页
- `assets/css/style.css`：全局样式
- `assets/js/main.js`：脚本入口（占位）
- `assets/img/`：图片资源目录（占位）
- `robots.txt`：搜索引擎爬虫规则
- `sitemap.xml`：站点地图
- `CNAME`：自定义域名（www.ting1127.top）
- `.github/workflows/static.yml`：部署工作流

## 本地预览
无需构建工具，直接启动本地静态服务器：

```bash
# Python 3
python3 -m http.server 8080
# 然后浏览器访问 http://127.0.0.1:8080/
```

## 部署
推送到 `main` 分支后，GitHub Actions 会自动发布到 Pages。

## 备注
- 如需多页面/博客能力，可按需引入 Jekyll/Hugo 等 SSG；当前保持零依赖静态结构。
- 样式与脚本尽量轻量，便于移动端访问与 SEO。
