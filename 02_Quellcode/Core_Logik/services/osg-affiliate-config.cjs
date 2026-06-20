"use strict";

const OSG_AFFILIATE_ID = String(
  process.env.INVOLVE_ASIA_AFFILIATE_ID || "1085689"
).trim();

const OSG_AFFILIATE_PUBLISHER = String(
  process.env.OSG_AFFILIATE_PUBLISHER || "Omni Solutions Global"
).trim();

const OSG_AFFILIATE_STATUS_ACTIVE = "Affiliate-API: ACTIVE";
const OSG_AFFILIATE_STATUS_INACTIVE = "Affiliate-API: INACTIVE";

const OSG_AFFILIATE_APPS = [
  {
    appId: "pauli_best_price_thailand",
    display: "Pauli BestPrice Thailand",
    affSubKey: "paoli_best_price",
  },
  {
    appId: "omniqr_ai_thailand",
    display: "OmniQR-AI for Tourist of Thailand",
    affSubKey: "omniqr_ai_thailand",
  },
  {
    appId: "omnisolutionsglobal_web",
    display: "Omni Solutions Global Website",
    affSubKey: "osg_web",
  },
];

function osgAffiliateApp(appId) {
  const id = String(appId || "").trim();
  return (
    OSG_AFFILIATE_APPS.find(function (r) {
      return r.appId === id;
    }) || OSG_AFFILIATE_APPS[2]
  );
}

function osgAffiliateAffSub(appId) {
  const override = String(process.env.INVOLVE_ASIA_AFF_SUB1 || "").trim();
  if (override) return override.slice(0, 96);
  const row = osgAffiliateApp(appId);
  return ("osg_" + row.affSubKey + "_" + OSG_AFFILIATE_ID).slice(0, 96);
}

function osgAffiliateSignHeaders(appId) {
  const row = osgAffiliateApp(appId);
  return {
    "X-OSG-Affiliate-Id": OSG_AFFILIATE_ID,
    "X-OSG-Affiliate-Publisher": OSG_AFFILIATE_PUBLISHER,
    "X-OSG-App-Id": row.appId,
  };
}

function osgAffiliateVerifyRequestHeaders(headers) {
  const h = headers || {};
  function get(k) {
    return String(h[k] || h[k.toLowerCase()] || "").trim();
  }
  const id = get("X-OSG-Affiliate-Id");
  const publisher = get("X-OSG-Affiliate-Publisher");
  const appId = get("X-OSG-App-Id");
  if (id !== OSG_AFFILIATE_ID) {
    return { ok: false, reason: "affiliate_id_mismatch", appId: appId };
  }
  if (publisher !== OSG_AFFILIATE_PUBLISHER) {
    return { ok: false, reason: "publisher_mismatch", appId: appId };
  }
  if (
    !OSG_AFFILIATE_APPS.some(function (r) {
      return r.appId === appId;
    })
  ) {
    return { ok: false, reason: "unknown_app_id", appId: appId };
  }
  return { ok: true, appId: appId, affiliateId: id, publisher: publisher };
}

function osgAffiliateStatusPayload(active, extra) {
  return Object.assign(
    {
      affiliateId: OSG_AFFILIATE_ID,
      publisher: OSG_AFFILIATE_PUBLISHER,
      label: active ? OSG_AFFILIATE_STATUS_ACTIVE : OSG_AFFILIATE_STATUS_INACTIVE,
      active: !!active,
      apps: OSG_AFFILIATE_APPS.map(function (r) {
        return {
          appId: r.appId,
          display: r.display,
          affiliateId: OSG_AFFILIATE_ID,
        };
      }),
    },
    extra && typeof extra === "object" ? extra : {}
  );
}

/** API 1085689 — nur E-Commerce / Lebensmittel / Retail */
const OSG_AFFILIATE_API_SCOPE = "ecommerce_grocery_retail";

const OSG_PAULI_AFFILIATE_MODULES = {
  retailApi: {
    moduleId: "retail_api",
    label: "Retail-API",
    active: true,
    affiliateId: OSG_AFFILIATE_ID,
    scope: OSG_AFFILIATE_API_SCOPE,
    channels: ["marketplace", "retail"],
  },
  financeModule: {
    moduleId: "finance_module",
    label: "Finanz-Modul",
    active: false,
    affiliateId: null,
    scope: "finance_insurance_bank_excluded",
    channels: ["bank", "insurance", "real_estate", "finance"],
  },
};

const FINANCE_PARTNER_SLUGS = new Set([
  "kasikorn",
  "roojai",
  "real_estate",
  "real_estate_th",
]);

const RETAIL_INVOLVE_PARTNER_KEYS = {
  lazada: "lazada_th",
  lazada_th: "lazada_th",
  shopee: "shopee_th",
  shopee_th: "shopee_th",
  bigc: "bigc_th",
  bigc_th: "bigc_th",
  lotus: "lotus_th",
  lotuss: "lotus_th",
  lotus_th: "lotus_th",
};

function getPauliAffiliateModuleConfig() {
  return {
    scope: OSG_AFFILIATE_API_SCOPE,
    retailApi: Object.assign({}, OSG_PAULI_AFFILIATE_MODULES.retailApi),
    financeModule: Object.assign({}, OSG_PAULI_AFFILIATE_MODULES.financeModule),
  };
}

function isFinanceModulePartner(partner, channel) {
  const ch = String(channel || "").trim().toLowerCase();
  if (OSG_PAULI_AFFILIATE_MODULES.financeModule.channels.indexOf(ch) >= 0) {
    return true;
  }
  const slug = String(partner || "").trim().toLowerCase();
  return FINANCE_PARTNER_SLUGS.has(slug);
}

function resolveInvolvePartnerKey(partner, channel) {
  if (isFinanceModulePartner(partner, channel)) return "";
  const slug = String(partner || "").trim().toLowerCase();
  const ch = String(channel || "").trim().toLowerCase();
  if (RETAIL_INVOLVE_PARTNER_KEYS[slug]) return RETAIL_INVOLVE_PARTNER_KEYS[slug];
  if (
    (slug === "bigc" || slug === "bigc_th") &&
    (ch === "retail" || ch === "marketplace")
  ) {
    return "bigc_th";
  }
  if (
    (slug === "lotus" || slug === "lotuss" || slug === "lotus_th") &&
    (ch === "retail" || ch === "marketplace")
  ) {
    return "lotus_th";
  }
  return "";
}

function canUseAffiliateApi1085689(partner, channel) {
  if (!OSG_PAULI_AFFILIATE_MODULES.retailApi.active) return false;
  if (isFinanceModulePartner(partner, channel)) return false;
  return Boolean(resolveInvolvePartnerKey(partner, channel));
}

function assertRetailApiScope(partner, channel) {
  if (isFinanceModulePartner(partner, channel)) {
    const err = new Error("finance_module_excluded");
    err.code = "finance_module_excluded";
    throw err;
  }
  const involveKey = resolveInvolvePartnerKey(partner, channel);
  if (!involveKey) {
    const err = new Error("retail_api_scope_required");
    err.code = "retail_api_scope_required";
    throw err;
  }
  return involveKey;
}

module.exports = {
  OSG_AFFILIATE_ID,
  OSG_AFFILIATE_PUBLISHER,
  OSG_AFFILIATE_STATUS_ACTIVE,
  OSG_AFFILIATE_STATUS_INACTIVE,
  OSG_AFFILIATE_APPS,
  OSG_AFFILIATE_API_SCOPE,
  OSG_PAULI_AFFILIATE_MODULES,
  osgAffiliateApp,
  osgAffiliateAffSub,
  osgAffiliateSignHeaders,
  osgAffiliateVerifyRequestHeaders,
  osgAffiliateStatusPayload,
  getPauliAffiliateModuleConfig,
  isFinanceModulePartner,
  resolveInvolvePartnerKey,
  canUseAffiliateApi1085689,
  assertRetailApiScope,
};
