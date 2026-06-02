/**
 * 竞品投票存储配置
 *
 * 方式 1 — Supabase 云表（推荐，配合 GitHub Pages，所有人打开同一链接即可同步）
 *   1. 执行 supabase/comp-votes.sql
 *   2. 填写下方 supabaseUrl、supabaseAnonKey，storage 设为 "supabase"
 *
 * 方式 2 — 局域网 vote-server
 *   npm run vote-server → 所有人打开 http://局域网IP:3456
 *
 * 方式 3 — 云托管 vote-server
 *   部署 render.yaml 后，设置 apiBase 为 https://你的服务/api
 *
 * 详见：docs/投票存储方案说明.md
 */
window.HX_VOTE_CONFIG = {
  /** 部署到 Pages 后由 CI 根据 Secrets 自动生成；本地可改为 supabase 并填写下方两项 */
  storage: "auto",
  apiBase: "",
  pollIntervalMs: 2000,
  adminToken: "hx-vote-admin",
  staticHosts: ["github.io", "githubusercontent.com"],

  /** Supabase：Project Settings → API */
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseTable: "comp_votes"
};
