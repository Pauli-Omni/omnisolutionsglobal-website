'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { buildVoiceDiagnostics, buildPublicVoiceStatus } = require('./voice-diagnostics');

function getOpsToken() {
  return String(process.env.OSG_OPS_CHECK_TOKEN || '').trim();
}

function requireOpsToken(req, res, next) {
  const expected = getOpsToken();
  if (!expected) {
    res.status(503).json({
      error: 'ops_check_disabled',
      detailKey: 'opsVoiceCheck.detail.opsTokenNotConfigured'
    });
    return;
  }
  const header = String(req.headers.authorization || '');
  const bearer = header.replace(/^Bearer\s+/i, '').trim();
  const token = bearer || String(req.query.token || '').trim();
  if (!token || token !== expected) {
    res.status(401).json({ error: 'unauthorized', detailKey: 'opsVoiceCheck.detail.unauthorized' });
    return;
  }
  next();
}

function createRouter() {
  const router = express.Router();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.OSG_OPS_RATE_MAX || 30),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited' }
  });

  router.get('/voice/status', async function (_req, res) {
    try {
      const status = await buildPublicVoiceStatus();
      res.setHeader('Cache-Control', 'no-store');
      res.json(status);
    } catch (err) {
      res.status(500).json({ speakReady: false, reason: 'status_failed' });
    }
  });

  router.use(limiter);

  router.get('/voice-check', requireOpsToken, async function (req, res) {
    try {
      const probe = req.query.probe === '1' || req.query.probe === 'true';
      const report = await buildVoiceDiagnostics({ probe: probe });
      res.setHeader('Cache-Control', 'no-store');
      res.json(report);
    } catch (err) {
      res.status(500).json({ ok: false, error: 'diagnostics_failed' });
    }
  });

  return router;
}

module.exports = { createRouter, requireOpsToken, getOpsToken };
