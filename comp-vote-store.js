/**
 * 竞品投票统一存储：HTTP 投票服务 或 Supabase 云表
 * 在 comp-vote-config.js 中配置 storage / supabaseUrl / supabaseAnonKey
 */
(function (global) {
  var cfg = global.HX_VOTE_CONFIG || {};

  function tableName() {
    return cfg.supabaseTable || "comp_votes";
  }

  function supabaseConfigured() {
    return !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  }

  function wantsSupabase() {
    var mode = (cfg.storage || "auto").toLowerCase();
    if (mode === "http") return false;
    if (mode === "supabase") return supabaseConfigured();
    return supabaseConfigured();
  }

  function supabaseRest(path, options) {
    var base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
    var key = cfg.supabaseAnonKey || "";
    var headers = Object.assign(
      {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json"
      },
      (options && options.headers) || {}
    );
    return fetch(base + "/rest/v1/" + path, Object.assign({ cache: "no-store" }, options || {}, { headers: headers }));
  }

  function rowToVote(row) {
    if (!row) return null;
    return {
      id: row.id,
      voterId: row.voter_id,
      voterName: row.voter_name,
      product: row.product,
      reasons: Array.isArray(row.reasons) ? row.reasons : [],
      remark: row.remark || "",
      clientIp: row.client_ip || "",
      userAgent: row.user_agent || "",
      timestamp: Number(row.timestamp) || Date.now()
    };
  }

  function voteToRow(vote) {
    return {
      id: vote.id,
      voter_id: vote.voterId,
      voter_name: vote.voterName,
      product: vote.product,
      reasons: vote.reasons || [],
      remark: vote.remark || "",
      client_ip: vote.clientIp || "",
      user_agent: vote.userAgent || "",
      timestamp: vote.timestamp || Date.now(),
      updated_at: new Date().toISOString()
    };
  }

  function latestUpdatedAt(rows) {
    var max = 0;
    (rows || []).forEach(function (r) {
      var t = Number(r.timestamp) || 0;
      if (t > max) max = t;
      if (r.updated_at) {
        var u = new Date(r.updated_at).getTime();
        if (u > max) max = u;
      }
    });
    return max || Date.now();
  }

  var store = {
    mode: function () {
      if (wantsSupabase()) return "supabase";
      return "http";
    },

    label: function () {
      if (store.mode() === "supabase") return "Supabase 云数据库";
      return "HTTP 投票服务";
    },

    testConnection: function () {
      if (store.mode() !== "supabase") {
        return Promise.resolve(false);
      }
      return supabaseRest(tableName() + "?select=id&limit=1")
        .then(function (res) {
          if (!res.ok) throw new Error("supabase_" + res.status);
          return true;
        })
        .catch(function () {
          return false;
        });
    },

    fetchVotes: function () {
      if (store.mode() !== "supabase") {
        return Promise.reject(new Error("not_supabase"));
      }
      return supabaseRest(tableName() + "?select=*&order=timestamp.desc")
        .then(function (res) {
          if (!res.ok) throw new Error("supabase_fetch_" + res.status);
          return res.json();
        })
        .then(function (rows) {
          var votes = (rows || []).map(rowToVote).filter(Boolean);
          return { votes: votes, updatedAt: latestUpdatedAt(rows) };
        });
    },

    saveVote: function (vote) {
      if (store.mode() !== "supabase") {
        return Promise.reject(new Error("not_supabase"));
      }
      var row = voteToRow(vote);
      return supabaseRest(tableName() + "?on_conflict=voter_id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify(row)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("supabase_save_" + res.status);
          return res.json();
        })
        .then(function () {
          return store.fetchVotes();
        });
    },

    mergeVotes: function (incoming) {
      if (store.mode() !== "supabase") {
        return Promise.reject(new Error("not_supabase"));
      }
      var list = Array.isArray(incoming) ? incoming : [];
      if (!list.length) return store.fetchVotes();
      var rows = list.map(voteToRow);
      return supabaseRest(tableName() + "?on_conflict=voter_id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify(rows)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("supabase_merge_" + res.status);
          return store.fetchVotes();
        });
    },

    clearVotes: function () {
      if (store.mode() !== "supabase") {
        return Promise.reject(new Error("not_supabase"));
      }
      return supabaseRest(tableName(), { method: "DELETE" })
        .then(function (res) {
          if (!res.ok) throw new Error("supabase_clear_" + res.status);
          return { votes: [], updatedAt: Date.now() };
        });
    }
  };

  global.HX_VOTE_STORE = store;
})(window);
