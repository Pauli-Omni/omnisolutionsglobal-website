'use strict';

const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath, overwrite) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx < 1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (overwrite || !process.env[key]) process.env[key] = val;
  });
}

function loadProjectEnv() {
  const root = require('./paths').SITE_ROOT;
  parseEnvFile(path.join(__dirname, '.env'), false);
  parseEnvFile(path.join(root, '.env'), false);
  parseEnvFile(path.join(__dirname, 'elevenlabs.config.env'), false);
  if (!process.env.BRAND_TTS_ENGINE) process.env.BRAND_TTS_ENGINE = 'xtts';
}

module.exports = { loadProjectEnv };
