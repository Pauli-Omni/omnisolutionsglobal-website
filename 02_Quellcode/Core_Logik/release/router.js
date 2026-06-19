'use strict';

const express = require('express');
const { readRelease } = require('./read-release');

function createRouter(siteRoot) {
  const router = express.Router();

  router.get('/release.json', function (_req, res) {
    try {
      const release = readRelease(siteRoot);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('X-OSG-Build-Id', release.buildId);
      res.json(release);
    } catch (err) {
      res.status(500).json({ error: 'release_read_failed' });
    }
  });

  return router;
}

module.exports = { createRouter };
