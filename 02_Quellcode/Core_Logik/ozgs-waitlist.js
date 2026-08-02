'use strict';

const fs = require('fs');
const path = require('path');

function createOzgsWaitlistRouter(options) {
  const express = require('express');
  const router = express.Router();
  const outDir = (options && options.outDir) || path.join(__dirname, 'data');
  const outFile = path.join(outDir, 'ozgs-waitlist.jsonl');

  function ensureDir() {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  router.post('/waitlist', function (req, res) {
    const email = String(req.body && req.body.email || '').trim().toLowerCase();
    const name = String(req.body && req.body.name || '').trim().slice(0, 120);
    const organisation = String(req.body && req.body.organisation || '').trim().slice(0, 180);
    const locale = String(req.body && req.body.locale || '').trim().slice(0, 16);
    const source = String(req.body && req.body.source || 'homepage-ozgs').trim().slice(0, 64);

    if (!isEmail(email)) {
      res.status(400).json({ ok: false, error: 'invalid_email' });
      return;
    }

    const entry = {
      ts: new Date().toISOString(),
      email: email,
      name: name,
      organisation: organisation,
      locale: locale,
      source: source
    };

    try {
      ensureDir();
      fs.appendFileSync(outFile, JSON.stringify(entry) + '\n', 'utf8');
      res.json({ ok: true });
    } catch (err) {
      console.error('ozgs-waitlist', err && err.message);
      res.status(500).json({ ok: false, error: 'waitlist_write_failed' });
    }
  });

  return router;
}

module.exports = { createOzgsWaitlistRouter };
