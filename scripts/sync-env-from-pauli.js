#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAULI_ENV = path.join(ROOT, '..', 'Pauli Best Price', '.env');
const SERVER_ENV = path.join(ROOT, '02_Quellcode', 'Core_Logik', '.env');

function parseEnv(text) {
  const out = Object.create(null);
  text.split(/\r?\n/).forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx < 1) return;
    out[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  });
  return out;
}

function main() {
  if (!fs.existsSync(PAULI_ENV)) {
    console.error('Pauli .env nicht gefunden:', PAULI_ENV);
    process.exit(1);
  }

  const pauli = parseEnv(fs.readFileSync(PAULI_ENV, 'utf8'));
  const elevenKey = pauli.ELEVENLABS_API_KEY || '';
  const elevenVoice = pauli.ELEVENLABS_VOICE_ID || pauli.BRAND_VOICE_ID || '';

  if (!elevenKey) {
    console.error('ELEVENLABS_API_KEY in Pauli Best Price/.env ist leer.');
    console.error('Bitte dort eintragen, dann dieses Skript erneut ausführen.');
    process.exit(1);
  }

  const lines = [
    '# Auto-sync aus Pauli Best Price/.env',
    'BRAND_TTS_API_KEY=' + elevenKey,
    'ELEVENLABS_API_KEY=' + elevenKey,
    'BRAND_VOICE_ID=' + (elevenVoice || 'R6OIrb7V5SxlTzLEZVo'),
    'ELEVENLABS_VOICE_ID=' + (elevenVoice || 'R6OIrb7V5SxlTzLEZVo'),
    'LOCAL_OPENAI_FALLBACK=0',
    'BRAND_TTS_CORS_ORIGIN=*'
  ];

  fs.writeFileSync(SERVER_ENV, lines.join('\n') + '\n', 'utf8');
  console.log('02_Quellcode/Core_Logik/.env aktualisiert (Marken-Stimme aus Pauli).');
}

main();
