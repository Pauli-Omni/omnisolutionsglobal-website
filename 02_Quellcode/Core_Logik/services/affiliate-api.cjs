"use strict";

const express = require("express");
const involve = require("./involve-asia.cjs");
const cfg = require("./osg-affiliate-config.cjs");

function createAffiliateRouter() {
  const router = express.Router();

  router.get("/check", function (req, res) {
    const appId = String(req.query.appId || req.get("X-OSG-App-Id") || "")
      .trim()
      .slice(0, 96);
    involve
      .validateAffiliateApi(appId || "omnisolutionsglobal_web")
      .then(function (payload) {
        res.type("json").json({ ok: true, ...payload });
      })
      .catch(function (e) {
        console.error("[affiliate/check]", e);
        res.status(500).type("json").json({
          ok: false,
          label: cfg.OSG_AFFILIATE_STATUS_INACTIVE,
          active: false,
          error: "affiliate_check_failed",
        });
      });
  });

  return router;
}

module.exports = { createAffiliateRouter };
