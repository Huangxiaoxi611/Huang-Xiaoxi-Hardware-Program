import express from "express";
import cors from "cors";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "comp-votes.json");
const PORT = Number(process.env.PORT || 3456);
const ADMIN_TOKEN = process.env.VOTE_ADMIN_TOKEN || "hx-vote-admin";

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "256kb" }));

function getLanAddresses() {
  try {
    const addrs = [];
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === "IPv4" && !net.internal) addrs.push(net.address);
      }
    }
    return addrs;
  } catch {
    return [];
  }
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  const raw = req.socket?.remoteAddress || req.ip || "";
  return raw.replace(/^::ffff:/, "") || "unknown";
}

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw);
    return {
      votes: Array.isArray(data.votes) ? data.votes : [],
      updatedAt: data.updatedAt || 0,
    };
  } catch {
    return { votes: [], updatedAt: 0 };
  }
}

async function writeData(data) {
  const payload = {
    votes: data.votes || [],
    updatedAt: Date.now(),
  };
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

function upsertVote(votes, vote) {
  if (!vote || !vote.voterName || !vote.product) return votes;
  if (!vote.voterId) return votes;
  const idx = votes.findIndex((v) => v.voterId === vote.voterId);
  if (idx >= 0) votes[idx] = vote;
  else votes.push(vote);
  return votes;
}

function mergeVotes(existing, incoming) {
  const merged = existing.slice();
  incoming.forEach((v) => upsertVote(merged, v));
  return merged;
}

function enrichVote(vote, req) {
  const clientIp = getClientIp(req);
  return {
    ...vote,
    clientIp,
    userAgent: String(req.headers["user-agent"] || "").slice(0, 200),
    timestamp: vote.timestamp || Date.now(),
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "hx-comp-vote", time: Date.now() });
});

app.get("/api/info", (req, res) => {
  const hostHeader = req.get("host") || `localhost:${PORT}`;
  const proto = req.secure ? "https" : "http";
  const pageOrigin = `${proto}://${hostHeader}`;
  const localUrl = `http://localhost:${PORT}`;
  const lanUrls = getLanAddresses().map((ip) => `http://${ip}:${PORT}`);
  res.json({
    ok: true,
    port: PORT,
    pageOrigin,
    localUrl,
    lanUrls,
    shareUrls: [...new Set([localUrl, ...lanUrls])],
    apiBase: `${pageOrigin}/api`,
  });
});

app.get("/api/client-info", (req, res) => {
  res.json({ clientIp: getClientIp(req) });
});

app.get("/api/votes", async (_req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "read_failed", message: String(err.message || err) });
  }
});

app.post("/api/votes", async (req, res) => {
  try {
    const vote = enrichVote(req.body, req);
    if (!vote.voterName || !vote.product) {
      return res.status(400).json({ error: "invalid_vote" });
    }
    if (!Array.isArray(vote.reasons) || !vote.reasons.length) {
      return res.status(400).json({ error: "reasons_required" });
    }
    const data = await readData();
    upsertVote(data.votes, vote);
    const saved = await writeData(data);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: "save_failed", message: String(err.message || err) });
  }
});

app.post("/api/votes/merge", async (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.votes) ? req.body.votes : [];
    const clientIp = getClientIp(req);
    const normalized = incoming.map((v) => ({
      ...v,
      clientIp: v.clientIp || clientIp,
      timestamp: v.timestamp || Date.now(),
    }));
    const data = await readData();
    data.votes = mergeVotes(data.votes, normalized);
    const saved = await writeData(data);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: "merge_failed", message: String(err.message || err) });
  }
});

app.delete("/api/votes", async (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "forbidden" });
  }
  try {
    const saved = await writeData({ votes: [] });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: "clear_failed", message: String(err.message || err) });
  }
});

app.use(express.static(ROOT));

app.listen(PORT, "0.0.0.0", () => {
  const lanIps = getLanAddresses();
  console.log(`[竞品投票服务] 本机访问: http://localhost:${PORT}`);
  if (lanIps.length) {
    console.log("[竞品投票服务] 局域网访问（其他电脑请用以下地址）:");
    lanIps.forEach((ip) => console.log(`  http://${ip}:${PORT}`));
  } else {
    console.log("[竞品投票服务] 未检测到局域网 IP，请确认网络连接");
  }
  console.log(`[竞品投票服务] API: /api/votes`);
  console.log(`[竞品投票服务] 数据文件: ${DATA_FILE}`);
});
