/**
 * 竞品投票云端同步配置
 *
 * 多人不同电脑投票（推荐）：
 * 1. 主持人在一台电脑运行 npm run vote-server
 * 2. 其他人浏览器访问控制台输出的 http://<局域网IP>:3456
 * 3. apiBase 留空即可，页面会自动连接当前地址的 /api
 *
 * GitHub Pages 线上：将 apiBase 改为已部署的 HTTPS 投票服务地址
 */
window.HX_VOTE_CONFIG = {
  apiBase: "",
  pollIntervalMs: 2000,
  adminToken: "hx-vote-admin"
};
