# paulzrm 的 Hexo 博客源码

这是从 `paulzrm/paulzrm.github.io` 已发布静态页面恢复出的 Hexo 源工程。

- Node.js：24.17.0 LTS
- Hexo：8.1.2
- 主题：NexT 8.27.0（Muse）
- 源码分支：`hexo-source`
- GitHub Pages 发布分支：`main`
- 当前文章：63 篇（其中 52 篇从洛谷推荐题解迁移）

## 首次安装

```powershell
npm install
```

## 本地预览

```powershell
npm run clean
npm run dev
```

浏览器打开 <http://localhost:4000>。

网站首页 `/` 是内容导航与检索页；原来的文章流位于 `/articles/`。首页支持按
“题解 / 游记 / 杂项”、关键词和年份组合筛选。

## 新建文章

```powershell
npx hexo new post "文章标题"
```

文章会创建在 `source/_posts/`。

## 保存源码

```powershell
git add -A
git commit -m "更新博客源码"
git push -u origin hexo-source
```

## 发布网站

```powershell
npm run clean
npm run build
npm run deploy
```

`npm run deploy` 会把 `public/` 中的生成结果推送到远端 `main` 分支。执行推送时需要登录 GitHub。

## 洛谷题解同步

```powershell
python tools/import_luogu_solutions.py
```

导入工具会读取已登记的洛谷文章，统一题解标题，并保留原文链接。

## 重要目录

- `source/_posts/`：Markdown 文章原稿
- `source/images/`：本地图片
- `_config.yml`：Hexo 站点配置
- `_config.next.yml`：NexT 主题配置
- `scaffolds/`：新文章模板
- `tools/`：洛谷导入和 PDF 手册生成工具
- `Hexo博客使用手册.pdf`：完整使用手册

旧静态网站的完整备份位于 `backup/legacy-static-site-8ac87fc.zip`，该目录已被 Git 忽略。
