# 黄小西家族文旅智能体陪伴玩偶 · 商业落地方案

GitHub Pages 在线预览：<https://huangxiaoxi611.github.io/Huang-Xiaoxi-Hardware-Program/>

> 仓库已迁移至组织 [Huangxiaoxi611](https://github.com/Huangxiaoxi611/Huang-Xiaoxi-Hardware-Program)，请使用上方地址访问。

## 内容说明

- `index.html`：商业落地方案汇报页（含左侧目录导航、章节锚点定位）
- `comp-vote-config.js`：竞品投票云端 API 地址配置
- `server/vote-server.mjs`：竞品投票共享存储服务（所有人实时同步）
- `data/comp-votes.json`：投票数据持久化文件
- 源文件维护于本地项目：`黄小西文旅智能陪伴玩偶-商业落地方案汇报.html`

## 竞品投票（多人实时同步）

1. 安装依赖并启动投票服务：

```bash
npm install
npm run vote-server
```

2. 浏览器访问 `http://localhost:3456`，进入「竞品分析 → 5. 竞品偏好投票」。

3. 多人不同电脑投票：
   - 主持人在一台电脑运行 `npm run vote-server`
   - 终端会输出局域网地址，例如 `http://192.168.1.8:3456`
   - **其他同事在各自电脑浏览器打开该地址**，进入「竞品分析 → 5. 竞品偏好投票」
   - 服务端自动记录每台电脑的 **IP 地址**，结果区实时显示全部投票

4. `comp-vote-config.js` 中 `apiBase` 留空即可（页面自动连接当前访问地址）；GitHub Pages 线上需改为 HTTPS 投票服务地址

5. 页面每 2 秒自动拉取最新结果；同一 IP / 同一浏览器重复提交会更新原投票

## 发布

推送到 `main` 分支后，GitHub Actions 自动部署至 Pages。
