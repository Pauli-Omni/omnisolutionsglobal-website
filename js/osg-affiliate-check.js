(function (global) {
  "use strict";

  var OSG_AFFILIATE_ID = "1085689";
  var OSG_AFFILIATE_PUBLISHER = "Omni Solutions Global";

  function osgAffiliateAppIdFromPage() {
    var body = document.body;
    if (!body) return "omnisolutionsglobal_web";
    var page = body.getAttribute("data-page") || "";
    var path = String(global.location && global.location.pathname) || "";
    if (path.indexOf("omniqr-ai-for-tourist-of-thailand") >= 0) {
      return "omniqr_ai_thailand";
    }
    if (page === "home" || path === "/" || path.indexOf("index.html") >= 0) {
      return "omnisolutionsglobal_web";
    }
    return "omnisolutionsglobal_web";
  }

  function osgAffiliateSignHeaders(appId) {
    return {
      "X-OSG-Affiliate-Id": OSG_AFFILIATE_ID,
      "X-OSG-Affiliate-Publisher": OSG_AFFILIATE_PUBLISHER,
      "X-OSG-App-Id": appId || osgAffiliateAppIdFromPage(),
    };
  }

  function osgAffiliateCheckOnce(opts) {
    opts = opts || {};
    if (global.__OSG_AFFILIATE_CHECK_DONE__) {
      return Promise.resolve(global.__OSG_AFFILIATE_API_STATUS__ || null);
    }
    global.__OSG_AFFILIATE_CHECK_DONE__ = true;
    var appId = opts.appId || osgAffiliateAppIdFromPage();
    var headers = osgAffiliateSignHeaders(appId);
    return fetch(
      "/api/affiliate/check?appId=" + encodeURIComponent(appId),
      { cache: "no-store", headers: headers }
    )
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        global.__OSG_AFFILIATE_API_STATUS__ = j;
        if (j && j.active) {
          console.log("[affiliate]", j.label || "Affiliate-API: ACTIVE", appId);
        } else if (j) {
          console.warn("[affiliate]", j.label, j.reason || "");
        }
        return j;
      })
      .catch(function () {
        return null;
      });
  }

  global.OSG_AFFILIATE_ID = OSG_AFFILIATE_ID;
  global.OSG_AFFILIATE_PUBLISHER = OSG_AFFILIATE_PUBLISHER;
  global.osgAffiliateAppIdFromPage = osgAffiliateAppIdFromPage;
  global.osgAffiliateSignHeaders = osgAffiliateSignHeaders;
  global.osgAffiliateCheckOnce = osgAffiliateCheckOnce;
})(typeof window !== "undefined" ? window : globalThis);
