'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

require('./load-env').loadProjectEnv();
try {
  const dotenvPath = path.join(__dirname, '.env');
  if (fs.existsSync(dotenvPath)) require('dotenv').config({ path: dotenvPath });
} catch (e) { /* dotenv optional */ }
const tts = require('./tts-router');
const { createRouter: createOmniQrRouter, BASE: OMNI_QR_API_BASE } = require('./omniqr-ai-for-tourist-of-thailand/router');
const { createArmorMiddleware } = require('./omniqr-ai-for-tourist-of-thailand/armor');
const { createRouter: createI18nRouter } = require('./i18n/router');
const { createRouter: createReleaseRouter } = require('./release/router');
const { createRouter: createOpsRouter } = require('./ops/router');
const { createCorsOriginResolver } = require('./cors-config');

const { SITE_ROOT } = require('./paths');
const PORT = Number(process.env.PORT || process.env.LOCAL_WEB_PORT || 8080);
const CORS_ORIGIN = createCorsOriginResolver();
const MAX_CHARS = 4500;

const app = express();
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: CORS_ORIGIN }));
app.use(createArmorMiddleware({ basePath: '/omniqr-ai-for-tourist-of-thailand' }));
app.use(express.json({ limit: '96kb' }));

app.get('/health', async function (_req, res) {
  try {
    const status = await tts.health();
    const involve = require('./services/involve-asia.cjs');
    res.json({ ok: true, dynamicTts: true, involveAsia: involve.involveAsiaStatus(), ...status });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'health_failed' });
  }
});

async function handleSpeak(req, res) {
  const text = String(req.body && req.body.text || '').trim();
  const lang = String(req.body && req.body.lang || 'de-DE').trim();

  if (!text || text.length > MAX_CHARS) {
    res.status(400).json({ error: 'invalid_text' });
    return;
  }

  try {
    const out = await tts.synthesizeChunk(text, lang);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-OSG-Voice-Engine', out.engine);
    res.setHeader('X-OSG-Voice-Mode', 'local-clone');
    res.send(out.buffer);
  } catch (err) {
    const msg = String(err && err.message || err);
    console.error('local-tts', msg);
    if (msg.indexOf('unsupported_language') >= 0 || (msg.indexOf('xtts_failed') >= 0 && /not supported|language .* is not|unsupported_language/i.test(msg))) {
      res.status(502).json({
        error: 'unsupported_language',
        hint: 'This language is not supported by the voice engine — use a supported i18n locale or another BCP-47 tag'
      });
      return;
    }
    if (msg === 'no_tts_engine' || msg.indexOf('xtts_unavailable') >= 0) {
      res.status(503).json({
        error: 'xtts_unavailable',
        hint: 'Run ./scripts/setup-xtts-local.sh then ./scripts/start-local-with-voice.sh — voice stays on this computer only'
      });
      return;
    }
    if (msg.indexOf('xtts_failed') >= 0) {
      res.status(502).json({ error: 'tts_failed' });
      return;
    }
    if (msg.indexOf('elevenlabs_key_missing') >= 0) {
      res.status(503).json({
        error: 'elevenlabs_key_missing',
        hint: 'Thai and other non-XTTS languages need ELEVENLABS_API_KEY in 02_Quellcode/Core_Logik/elevenlabs.config.env'
      });
      return;
    }
    if (msg.indexOf('elevenlabs_quota_exceeded') >= 0) {
      res.status(503).json({ error: 'elevenlabs_quota_exceeded' });
      return;
    }
    if (msg.indexOf('elevenlabs_upstream') >= 0) {
      res.status(502).json({ error: 'elevenlabs_upstream' });
      return;
    }
    if (msg.indexOf('local_reference_missing') >= 0) {
      res.status(503).json({
        error: 'local_reference_missing',
        hint: 'Place your reference audio at assets/audio/omni-homepage-voice.mp3'
      });
      return;
    }
    res.status(502).json({ error: 'tts_failed' });
  }
}

app.post('/api/speak', handleSpeak);
app.post('/api/speak/stream', handleSpeak);

app.use('/api', createReleaseRouter(SITE_ROOT));
app.use('/api/affiliate', require('./services/affiliate-api.cjs').createAffiliateRouter());
app.use('/api/ops', createOpsRouter());
app.use('/api/i18n', createI18nRouter(path.join(SITE_ROOT, 'assets', 'locales')));

app.use(OMNI_QR_API_BASE, createOmniQrRouter());

app.use(express.static(SITE_ROOT));

app.listen(PORT, function () {
  console.log('osg-local-site + local-tts (XTTS) on http://localhost:' + PORT);
  console.log('OmniQR-AI for Tourist of Thailand API on http://localhost:' + PORT + OMNI_QR_API_BASE);
  var involve = require('./services/involve-asia.cjs');
  involve.validateAffiliateApi('omnisolutionsglobal_web').then(function (aff) {
    console.log('[affiliate-check]', aff.label, { affiliateId: aff.affiliateId, reason: aff.reason });
  }).catch(function (e) {
    console.error('[affiliate-check] startup failed:', e && e.message);
  });
  tts.health().then(function (h) {
    console.log('local-tts health', JSON.stringify(h));
  }).catch(function () { /* ignore */ });
});
