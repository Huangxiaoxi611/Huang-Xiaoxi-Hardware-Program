# 黄小西家族文旅智能体陪伴玩偶 · 商业落地方案

GitHub Pages 在线预览：<https://huangxiaoxi611.github.io/Huang-Xiaoxi-Hardware-Program/>

> 仓库已迁移至组织 [Huangxiaoxi611](https://github.com/Huangxiaoxi611/Huang-Xiaoxi-Hardware-Program)，请使用上方地址访问。

## 内容说明

- `index.html`：商业落地方案汇报页（含左侧目录导航、章节锚点定位）
- `comp-vote-config.js`：竞品投票 API 配置
- `server/vote-server.mjs`：竞品投票**集中存储**服务（所有人数据汇总到 `data/comp-votes.json`）
- `data/comp-votes.json`：投票数据持久化文件

## 竞品投票（多人各自电脑 · 同一地址 · 全员看统计表）

> **存储方案说明**（后端 / Supabase 云表 / 为何不用 Git 当数据库）：见 [docs/投票存储方案说明.md](docs/投票存储方案说明.md)

### 推荐：Supabase 云表 + GitHub Pages（方案 A）

**按此清单操作：** [docs/方案A-操作清单.md](docs/方案A-操作清单.md)

概要：Supabase 建表 → GitHub 添加 `SUPABASE_URL` / `SUPABASE_ANON_KEY` 两个 Secrets → `git push` → 大家打开 Pages 链接投票。

## 竞品投票 · 局域网服务（备选）

### 第一步：主持人启动服务

```bash
cd Huang-Xiaoxi-Hardware-Program
npm install
npm run vote-server
```

终端会打印类似：

```text
[竞品投票服务] 本机访问: http://localhost:3456
[竞品投票服务] 局域网访问（其他电脑请用以下地址）:
  http://192.168.1.8:3456
```

### 第二步：把「局域网地址」发给所有人

**所有同事在各自电脑浏览器中打开同一个链接**，例如：

`http://192.168.1.8:3456#comp-vote`

（不要各自双击本地 HTML 文件，也不要只用 GitHub Pages 链接投票——静态页无法汇总数据。）

### 第三步：投票与查看

1. 左侧进入 **竞品分析 → 5. 竞品偏好投票**
2. 填写昵称、选产品、勾选原因 → **提交投票**
3. 右侧自动刷新（约每 2 秒）：
   - **产品得票统计表**（排名、得票率）
   - **原因热度统计表**
   - **投票明细记录**（所有人记录在同一表格）

同步状态应显示：**已连接 · 全员实时同步**。

### 若必须从 GitHub Pages 打开页面

在地址后加上主持人电脑的投票服务，例如：

`https://huangxiaoxi611.github.io/Huang-Xiaoxi-Hardware-Program/?voteApi=http://192.168.1.8:3456#comp-vote`

或在页面「连接投票服务」输入框填写 `http://192.168.1.8:3456` 后点击连接。

### 常见问题

| 现象 | 处理 |
|------|------|
| 只能看到自己的票 | 未连上同一投票服务；改用主持人提供的 `http://局域网IP:3456` |
| 同步状态「未连接投票服务」 | 运行 `npm run vote-server`，或填写服务地址 |
| 同事电脑打不开链接 | 检查同一 WiFi、防火墙放行 3456 端口 |

## 发布

推送到 `main` 分支后，GitHub Actions 自动部署至 Pages。
