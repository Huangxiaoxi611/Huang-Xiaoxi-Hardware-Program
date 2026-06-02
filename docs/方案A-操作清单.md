# 方案 A：Supabase + GitHub Pages — 操作清单

按顺序打勾，全部完成即可开会投票。

---

## 第 1 步：创建 Supabase 项目（约 10 分钟）

1. 打开 https://supabase.com ，用 GitHub 或邮箱注册并登录  
2. 点击 **New project**  
   - Name：随意，如 `hx-comp-vote`  
   - Database Password：自己记住（仅数据库管理用）  
   - Region：选 **Singapore** 或离国内最近的  
3. 等待项目创建完成（1～2 分钟）

---

## 第 2 步：建投票表

1. 左侧 **SQL Editor** → **New query**  
2. 打开本仓库文件 `supabase/comp-votes.sql`，**全选复制**到编辑器  
3. 点击 **Run**（或 Ctrl+Enter）  
4. 应显示 Success；左侧 **Table Editor** 能看到表 `comp_votes`

---

## 第 3 步：复制 API 密钥

1. 左侧 **Project Settings**（齿轮）→ **API**  
2. 复制这两项（先粘到记事本备用）：  
   - **Project URL** → 形如 `https://abcdefgh.supabase.co`  
   - **Project API keys** 里的 **anon** `public`（一长串 `eyJ...`）

> 不要用 `service_role` key，只用在服务端；前端只用 **anon**。

---

## 第 4 步：写入 GitHub Secrets（推荐，密钥不进仓库）

1. 打开 GitHub 仓库：  
   https://github.com/Huangxiaoxi611/Huang-Xiaoxi-Hardware-Program  
2. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**  
3. 新增两条：

| Name | Value |
|------|--------|
| `SUPABASE_URL` | 第 3 步的 Project URL |
| `SUPABASE_ANON_KEY` | 第 3 步的 anon key |

---

## 第 5 步：推送代码并等待部署

在本机项目目录执行：

```bash
cd "/Users/Shared/工作/00项目/07贵州文旅二期/04 硬件管理/Huang-Xiaoxi-Hardware-Program"
git add .
git commit -m "启用方案A：Supabase 投票云同步"
git push origin main
```

1. GitHub 仓库 **Actions** 页查看 **Deploy static content to Pages** 是否绿色成功  
2. 约 2～5 分钟后访问：  
   https://huangxiaoxi611.github.io/Huang-Xiaoxi-Hardware-Program/#comp-vote

---

## 第 6 步：自测（必做）

1. 打开上链接 → 左侧 **竞品分析** → **5. 竞品偏好投票**  
2. 右上角 **同步状态** 应为：**已连接 · 云数据库全员同步**（绿色）  
3. 填昵称、选产品、勾选至少 1 个原因 → **提交投票**  
4. 用手机或无痕窗口再打开同一链接 → 应能看到你的票和统计表  
5. Supabase **Table Editor → comp_votes** 应出现 1 行

若显示「云数据库连接失败」：

- 检查 Secrets 名称是否完全一致（区分大小写）  
- 是否重新 push 触发部署  
- SQL 是否执行成功、RLS 策略是否创建  

---

## 第 7 步：发给同事

只发这一个链接：

**https://huangxiaoxi611.github.io/Huang-Xiaoxi-Hardware-Program/#comp-vote**

说明：每人填昵称投票；右侧表格约 2 秒刷新，全员可见。

---

## 本地预览（可选）

已配置 Secrets 时，也可在本地生成配置后打开页面：

```bash
export SUPABASE_URL="https://你的项目.supabase.co"
export SUPABASE_ANON_KEY="你的anon密钥"
node scripts/generate-vote-config.mjs
npm run vote-server   # 或任意静态服务器打开 index.html
```

---

## 会后

- **导出投票 JSON**：页面底部按钮  
- **清空投票**：「清空全部投票」（会清空 Supabase 整张表，需二次确认）
