# 恢复报告

## 已完成

- 从旧静态站点恢复 23 篇 Markdown 文章。
- 恢复标题、发布日期、标签、数学公式、链接及 42 个代码块。
- 保持原有 `年/月/日/标题/` URL 结构。
- 使用 Hexo 8.1.2 和 NexT 8.27.0 从零建立源码工程。
- 旧 Gitalk 配置中的公开 `client_secret` 未迁移。
- 评论功能已完全关闭。
- 11 个唯一外部图片地址中，5 个已下载到 `source/images/posts/`。

## 已失效的外部图片

以下地址在恢复时返回 404、502 或 TLS 错误，相关图片元素和链接已从文章中删除：

- `https://xn--9zr.tk/hanx`
- `http://啧.tk/tuu`
- `http://啧.tk/cy`
- `https://啧.tk/qd`
- `http://啧.tk/yun`
- `https://cdn.luogu.com.cn/upload/image_hosting/rjzlc4aq.png`

如果以后找到这些图片的本地副本，可将文件放入 `source/images/posts/`，再手动补回对应 Markdown。

## 需要登录 GitHub 处理

旧静态站点和 Git 历史曾公开包含 Gitalk OAuth App 的 `client_secret`。新源码中已经移除该值，但历史泄露不能通过删除新文件解决。请登录 GitHub，找到对应的 OAuth App，撤销或轮换旧凭据。
