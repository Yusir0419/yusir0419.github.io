# ting1127.top / GitHub Pages 站点

一个轻量的静态网站，使用 GitHub Actions 部署到 GitHub Pages。支持深色模式、基础 PWA 离线缓存、多页面结构。

## 目录结构
- `index.html`：首页（已抽离样式与脚本）
- `404.html`：未找到页
- `about.html`：关于页面
- `contact.html`：联系页面
- `assets/css/style.css`：全局样式
- `assets/js/main.js`：脚本入口（占位）
- `assets/img/`：图片资源目录（占位）
- `assets/img/favicon.svg`：站点图标
- `robots.txt`：搜索引擎爬虫规则
- `sitemap.xml`：站点地图
- `site.webmanifest`：PWA 清单文件
- `sw.js`：Service Worker（离线缓存）
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
首次部署后刷新两次页面以确保 Service Worker 生效；如需停用离线缓存，可删除 `sw.js` 并清缓存。

## 备注
- 如需多页面/博客能力，可按需引入 Jekyll/Hugo 等 SSG；当前保持零依赖静态结构。
- 样式与脚本尽量轻量，便于移动端访问与 SEO。

## SEO 与站点统计
- Open Graph/Twitter 卡片已就绪，当前使用 `assets/img/favicon.svg` 作为占位图；建议后续提供 1200x630 PNG 的 `og-image` 并替换。
- 结构化数据：主页包含 `Person` 与 `WebSite`，子页包含 `WebPage` 与 `BreadcrumbList`。
- 可选统计：通过在页面 `<head>` 中添加以下 meta 即可启用（二选一）：

Plausible（推荐，隐私友好）：
```html
<meta name="analytics:provider" content="plausible" />
<meta name="analytics:domain" content="www.ting1127.top" />
```

Google Analytics 4：
```html
<meta name="analytics:provider" content="ga4" />
<meta name="analytics:ga4" content="G-XXXXXXXXXX" />
```
