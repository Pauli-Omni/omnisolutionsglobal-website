"use strict";

const cfg = require("./osg-affiliate-config.cjs");

const INVOLVE_API_BASE = (
  process.env.INVOLVE_ASIA_API_BASE || "https://api.involve.asia/api"
).replace(/\/$/, "");

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
const tokenCache = { token: null, expiresAt: 0, validatedAt: "" };
let affiliateRuntimeStatus = {
  active: false,
  label: cfg.OSG_AFFILIATE_STATUS_INACTIVE,
  checkedAt: "",
  reason: "not_checked",
};

function involveConfigured() {
  return Boolean(
    process.env.INVOLVE_ASIA_API_KEY && process.env.INVOLVE_ASIA_API_SECRET
  );
}

function makeErr(code, message) {
  const err = new Error(message || code);
  err.code = code;
  return err;
}

function involveSignHeaders(appId) {
  return Object.assign({}, cfg.osgAffiliateSignHeaders(appId), {
    "X-OSG-Affiliate-Channel": "involve_asia",
  });
}

function involveApiPost(path, opts) {
  opts = opts || {};
  const headers = Object.assign(
    { Accept: "application/json" },
    involveSignHeaders(opts.appId || "omnisolutionsglobal_web")
  );
  if (opts.token) headers.Authorization = "Bearer " + opts.token;
  const body =
    opts.form instanceof URLSearchParams ? opts.form.toString() : undefined;
  if (body) headers["Content-Type"] = "application/x-www-form-urlencoded";

  return fetch(INVOLVE_API_BASE + path, {
    method: "POST",
    headers: headers,
    body: body,
  }).then(function (resp) {
    return resp.json().then(function (json) {
      if (!resp.ok || json.status !== "success") {
        throw makeErr("upstream", json.message || "HTTP " + resp.status);
      }
      return json;
    });
  });
}

function getInvolveToken(forceRefresh) {
  if (!involveConfigured()) {
    return Promise.reject(
      makeErr("not_configured", "Involve Asia API credentials missing")
    );
  }
  const now = Date.now();
  if (
    !forceRefresh &&
    tokenCache.token &&
    now < tokenCache.expiresAt - TOKEN_REFRESH_BUFFER_MS
  ) {
    return Promise.resolve(tokenCache.token);
  }
  const form = new URLSearchParams();
  form.set("key", String(process.env.INVOLVE_ASIA_API_KEY).trim());
  form.set("secret", String(process.env.INVOLVE_ASIA_API_SECRET).trim());
  return involveApiPost("/authenticate", { form: form }).then(function (json) {
    const token = json && json.data && json.data.token;
    if (!token) throw makeErr("upstream", "No token in authenticate response");
    tokenCache.token = token;
    tokenCache.expiresAt = now + TOKEN_TTL_MS;
    tokenCache.validatedAt = new Date().toISOString();
    return token;
  });
}

function validateAffiliateApi(appId) {
  const checkedAt = new Date().toISOString();
  const app = String(appId || "").trim();
  const pauliModules =
    app === "pauli_best_price_thailand" || !app
      ? cfg.getPauliAffiliateModuleConfig()
      : undefined;
  if (!involveConfigured()) {
    affiliateRuntimeStatus = {
      active: false,
      label: cfg.OSG_AFFILIATE_STATUS_INACTIVE,
      checkedAt: checkedAt,
      reason: "credentials_missing",
    };
    return Promise.resolve(
      cfg.osgAffiliateStatusPayload(false, {
        ok: false,
        checkedAt: checkedAt,
        reason: "credentials_missing",
        appId: appId || null,
        scope: cfg.OSG_AFFILIATE_API_SCOPE,
        pauliModules: pauliModules,
      })
    );
  }
  return getInvolveToken(false)
    .then(function () {
      const idOk = String(cfg.OSG_AFFILIATE_ID) === "1085689";
      affiliateRuntimeStatus = {
        active: idOk,
        label: idOk
          ? cfg.OSG_AFFILIATE_STATUS_ACTIVE
          : cfg.OSG_AFFILIATE_STATUS_INACTIVE,
        checkedAt: checkedAt,
        reason: idOk ? "involve_authenticate_ok" : "affiliate_id_mismatch",
      };
      return cfg.osgAffiliateStatusPayload(idOk, {
        ok: idOk,
        checkedAt: checkedAt,
        reason: affiliateRuntimeStatus.reason,
        handshake: "involve_authenticate_ok",
        tokenValidatedAt: tokenCache.validatedAt,
        appId: appId || null,
        scope: cfg.OSG_AFFILIATE_API_SCOPE,
        pauliModules: pauliModules,
      });
    })
    .catch(function (err) {
      affiliateRuntimeStatus = {
        active: false,
        label: cfg.OSG_AFFILIATE_STATUS_INACTIVE,
        checkedAt: checkedAt,
        reason: String((err && err.code) || "auth_failed"),
      };
      return cfg.osgAffiliateStatusPayload(false, {
        ok: false,
        checkedAt: checkedAt,
        reason: String((err && err.code) || "auth_failed"),
        message: String((err && err.message) || "").slice(0, 240),
        appId: appId || null,
        scope: cfg.OSG_AFFILIATE_API_SCOPE,
        pauliModules: pauliModules,
      });
    });
}

function involveAsiaStatus() {
  return {
    credentials: involveConfigured(),
    affiliateId: cfg.OSG_AFFILIATE_ID,
    publisher: cfg.OSG_AFFILIATE_PUBLISHER,
    label: affiliateRuntimeStatus.label,
    active: affiliateRuntimeStatus.active,
    lastCheckedAt: affiliateRuntimeStatus.checkedAt,
    lastReason: affiliateRuntimeStatus.reason,
    scope: cfg.OSG_AFFILIATE_API_SCOPE,
    pauliModules: cfg.getPauliAffiliateModuleConfig(),
    retailApiOnly: true,
  };
}

function getAffiliateRuntimeStatus() {
  return Object.assign({}, affiliateRuntimeStatus, {
    affiliateId: cfg.OSG_AFFILIATE_ID,
  });
}

module.exports = {
  validateAffiliateApi: validateAffiliateApi,
  involveAsiaStatus: involveAsiaStatus,
  getAffiliateRuntimeStatus: getAffiliateRuntimeStatus,
  verifyAffiliateRequestHeaders: cfg.osgAffiliateVerifyRequestHeaders,
};
