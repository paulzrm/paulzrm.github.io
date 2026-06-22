# paulzrm 的 Hexo 博客源码

这是从 `paulzrm/paulzrm.github.io` 已发布静态页面恢复出的 Hexo 源工程。

- Node.js：24.17.0 LTS
- Hexo：8.1.2
- 主题：NexT 8.27.0（Muse）
- 源码分支：`hexo-source`
- GitHub Pages 发布分支：`main`
- 已恢复文章：23 篇

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

## 重要目录

- `source/_posts/`：Markdown 文章原稿
- `source/images/`：本地图片
- `_config.yml`：Hexo 站点配置
- `_config.next.yml`：NexT 主题配置
- `scaffolds/`：新文章模板

旧静态网站的完整备份位于 `backup/legacy-static-site-8ac87fc.zip`，该目录已被 Git 忽略。
