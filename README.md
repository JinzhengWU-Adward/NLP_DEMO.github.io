# NLP Demo 视频展示页

这是一个用于 GitHub Pages（用户/组织站点）的纯静态页面仓库：**视频还没准备好也可以先上线**，之后只需要改一个配置项就能切换为真实视频嵌入。

## 本地预览

- 直接用浏览器打开 `index.html`（占位状态也能正常显示）。
- 注意：部分浏览器在 `file://` 下可能会限制 `fetch` 读取本地 JSON。若你遇到标题/描述加载失败，建议用一个最简单的静态服务器预览，例如：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## 上线到 GitHub Pages

1. 把文件提交到 `main` 分支（仓库名一般为 `你的用户名.github.io`）。
2. 在 GitHub 仓库 Settings → Pages：
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main` / `(root)`
3. 等待 Pages 构建完成后访问站点根路径即可。

## 以后只改一个地方：`site.json`

编辑 `site.json`：

- `video.embedUrl`: 填入“可嵌入（iframe）”的视频 URL
  - 为空：页面显示“即将上线”占位
  - 非空：页面自动显示 iframe
- `video.title` / `video.note`: 页面上展示的标题与说明
- `links.primaryCtaLabel`/`links.primaryCtaHref`: 可选主按钮（例如更新说明、项目主页等）

示例：

```json
{
  "video": {
    "embedUrl": "https://example.com/embed/xxxxx"
  }
}
```

## 文件结构

- `index.html`: 页面入口
- `assets/style.css`: 样式
- `assets/app.js`: 读取 `site.json` 并渲染“占位/嵌入”
- `site.json`: 唯一需要长期维护的配置
- `assets/cover.svg`: 分享卡片占位图（OpenGraph/Twitter）
- `.nojekyll`: 禁用 Jekyll，避免 GitHub Pages 对目录/文件名做额外处理

