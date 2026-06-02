/**
 * 复制为 comp-vote-config.js 并填入真实密钥（勿将含密钥的文件提交到公开仓库）
 */
window.HX_VOTE_CONFIG = {
  storage: "supabase",
  supabaseUrl: "https://xxxxxxxx.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  supabaseTable: "comp_votes",
  pollIntervalMs: 2000,
  adminToken: "hx-vote-admin",
  apiBase: "",
  staticHosts: ["github.io", "githubusercontent.com"]
};
