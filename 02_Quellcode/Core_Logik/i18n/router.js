'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  SUPPORTED_LOCALES,
  FALLBACK_LOCALES,
  LOCALE_BCP47,
  normalizeLocale,
  isSupported
} = require('./locale-registry');

function deepMerge(base, overlay) {
  if (overlay == null) return base;
  if (base == null) return overlay;
  if (typeof base !== 'object' || typeof overlay !== 'object') return overlay;
  if (Array.isArray(base) || Array.isArray(overlay)) return overlay;

  const out = Object.assign({}, base);
  Object.keys(overlay).forEach(function (key) {
    out[key] = deepMerge(base[key], overlay[key]);
  });
  return out;
}

function readLocaleFile(localesDir, locale) {
  const filePath = path.join(localesDir, locale + '.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildLocalePayload(localesDir, requested) {
  const enBase = readLocaleFile(localesDir, 'en') || {};

  if (requested === 'en') {
    return { payload: enBase, servedLocale: 'en' };
  }

  const primary = readLocaleFile(localesDir, requested);
  if (primary) {
    return {
      payload: deepMerge(enBase, primary),
      servedLocale: requested
    };
  }

  return { payload: enBase, servedLocale: 'en' };
}

function createRouter(localesDir) {
  const router = express.Router();

  router.get('/locales', function (_req, res) {
    res.json({
      ok: true,
      supported: SUPPORTED_LOCALES,
      fallback: FALLBACK_LOCALES,
      speech: LOCALE_BCP47
    });
  });

  router.get('/:lng.json', function (req, res) {
    const requested = normalizeLocale(req.params.lng);

    try {
      const built = buildLocalePayload(localesDir, requested);
      if (!built.payload || Object.keys(built.payload).length === 0) {
        res.status(404).json({ error: 'locale_not_found', requested: requested });
        return;
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60');
      if (built.servedLocale !== requested) {
        res.setHeader('X-OSG-I18n-Fallback', built.servedLocale);
      }
      res.json(built.payload);
    } catch (err) {
      res.status(500).json({ error: 'locale_read_failed', locale: requested });
    }
  });

  return router;
}

module.exports = {
  createRouter,
  SUPPORTED_LOCALES,
  normalizeLocale,
  isSupported,
  deepMerge,
  buildLocalePayload
};
