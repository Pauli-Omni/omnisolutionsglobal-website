'use strict';

const fs = require('fs');
const path = require('path');
const { readRelease } = require('../release/read-release');
const { getElevenLabsApiKey, getElevenLabsVoiceIdFromConfig } = require('../elevenlabs-key');

const SITE_ROOT = path.join(__dirname, '..', '..');
const PDF = path.join(
  SITE_ROOT,
  'omniqr-ai-for-tourist-of-thailand',
  'legal',
  'AGB_OmniQR_AI_Th_2026.pdf'
);

function line(ok, label, detail) {
  console.log((ok ? '✔' : '✘') + ' ' + label + (detail ? ' — ' + detail : ''));
}

require('../load-env').loadProjectEnv();

var release = readRelease(SITE_ROOT);
line(!!release.buildId, 'release.json buildId', release.buildId);
line(fs.existsSync(PDF), 'AGB PDF vorhanden', PDF.replace(SITE_ROOT, '.'));
line(!!getElevenLabsApiKey(), 'ElevenLabs API-Key', getElevenLabsApiKey() ? 'gesetzt' : 'fehlt');
line(!!getElevenLabsVoiceIdFromConfig(), 'ElevenLabs Voice-ID', getElevenLabsVoiceIdFromConfig() ? 'gesetzt' : 'fehlt');
line(!!process.env.OMNI_SECRET_KEY, 'OMNI_SECRET_KEY', process.env.OMNI_SECRET_KEY ? 'gesetzt' : 'lokal fehlt (Render setzen)');
line(!!process.env.OSG_OPS_CHECK_TOKEN, 'OSG_OPS_CHECK_TOKEN', process.env.OSG_OPS_CHECK_TOKEN ? 'gesetzt' : 'lokal fehlt (Render setzen)');
line(fs.existsSync(path.join(SITE_ROOT, 'render.yaml')), 'render.yaml', 'vorhanden');
line(fs.existsSync(path.join(SITE_ROOT, 'ops', 'voice-check.html')), 'Ops-Prüfseite', '/ops/voice-check.html');

console.log('\nHinweis: Domain + E-Mail (MX) nur im Domain-Registrar — nicht im Code.');
