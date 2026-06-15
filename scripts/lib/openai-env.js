'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const ENV_CANDIDATES = [
  path.join(ROOT, 'scripts', 'visual-ai.local.env'),
  path.join(ROOT, 'server', '.env'),
  path.join(ROOT, '.env'),
  path.join(ROOT, '..', 'Pauli Best Price', '.env')
];

function parseEnv(text) {
  const out = Object.create(null);
  String(text || '').split(/\r?\n/).forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx < 1) return;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  });
  return out;
}

function loadOpenAiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();

  for (let i = 0; i < ENV_CANDIDATES.length; i += 1) {
    const envPath = ENV_CANDIDATES[i];
    if (!fs.existsSync(envPath)) continue;
    const parsed = parseEnv(fs.readFileSync(envPath, 'utf8'));
    if (parsed.OPENAI_API_KEY) return parsed.OPENAI_API_KEY.trim();
  }
  return '';
}

module.exports = {
  ROOT: ROOT,
  loadOpenAiKey: loadOpenAiKey
};
