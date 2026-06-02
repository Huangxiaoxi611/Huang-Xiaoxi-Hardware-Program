/**
 * 根据环境变量生成 comp-vote-config.js（用于 GitHub Actions 或本地）
 *
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_ANON_KEY=eyJ...
 *   node scripts/generate-vote-config.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "comp-vote-config.js");

const url = (process.env.SUPABASE_URL || "").trim();
const key = (process.env.SUPABASE_ANON_KEY || "").trim();

if (!url || !key) {
  console.log("[vote-config] 未设置 SUPABASE_URL / SUPABASE_ANON_KEY，保留现有 comp-vote-config.js");
  process.exit(0);
}

const content = `/**
 * 由 scripts/generate-vote-config.mjs 自动生成，请勿手改（改密钥请改 GitHub Secrets 后重新部署）
 */
window.HX_VOTE_CONFIG = {
  storage: "supabase",
  apiBase: "",
  pollIntervalMs: 2000,
  adminToken: "hx-vote-admin",
  staticHosts: ["github.io", "githubusercontent.com"],
  supabaseUrl: ${JSON.stringify(url)},
  supabaseAnonKey: ${JSON.stringify(key)},
  supabaseTable: "comp_votes"
};
`;

fs.writeFileSync(OUT, content, "utf8");
console.log("[vote-config] 已写入 comp-vote-config.js（storage: supabase）");
