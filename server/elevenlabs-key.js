'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'elevenlabs.config.env');
const KEY_LINE_INDEX = 15;
const VOICE_LINE_INDEX = 16;

function readConfigLine(index) {
  if (!fs.existsSync(CONFIG_FILE)) return '';
  const lines = fs.readFileSync(CONFIG_FILE, 'utf8').split(/\r?\n/);
  return lines[index] || '';
}

function readLine16() {
  return readConfigLine(KEY_LINE_INDEX);
}

function getElevenLabsApiKey() {
  const fromEnv = String(process.env.ELEVENLABS_API_KEY || '').trim();
  if (fromEnv && fromEnv !== 'HIER_SCHLÜSSEL_EINFÜGEN') return fromEnv;

  const line = readLine16();
  const quoted = line.match(/ELEVENLABS_API_KEY\s*=\s*"([^"]*)"/);
  if (quoted) {
    const val = quoted[1].trim();
    if (val && val !== 'HIER_SCHLÜSSEL_EINFÜGEN') return val;
    return '';
  }
  const plain = line.match(/ELEVENLABS_API_KEY\s*=\s*(.+)/);
  if (!plain) return '';
  const val = plain[1].trim().replace(/^["']|["']$/g, '');
  if (!val || val === 'HIER_SCHLÜSSEL_EINFÜGEN') return '';
  return val;
}

function getElevenLabsVoiceIdFromConfig() {
  const fromEnv = String(process.env.ELEVENLABS_VOICE_ID || process.env.BRAND_VOICE_ID || '').trim();
  if (fromEnv && fromEnv !== 'HIER_VOICE_ID_EINFÜGEN') return fromEnv;

  if (!fs.existsSync(CONFIG_FILE)) return '';
  const lines = fs.readFileSync(CONFIG_FILE, 'utf8').split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    const quoted = line.match(/ELEVENLABS_VOICE_ID\s*=\s*"([^"]*)"/);
    if (quoted) {
      const val = quoted[1].trim();
      if (val && val !== 'HIER_VOICE_ID_EINFÜGEN') return val;
      return '';
    }
    const plain = line.match(/ELEVENLABS_VOICE_ID\s*=\s*(.+)/);
    if (plain) {
      const val = plain[1].trim().replace(/^["']|["']$/g, '');
      if (!val || val === 'HIER_VOICE_ID_EINFÜGEN') return '';
      return val;
    }
  }
  return '';
}

module.exports = {
  configFile: CONFIG_FILE,
  keyLineNumber: KEY_LINE_INDEX + 1,
  voiceLineNumber: VOICE_LINE_INDEX + 1,
  getElevenLabsApiKey: getElevenLabsApiKey,
  getElevenLabsVoiceIdFromConfig: getElevenLabsVoiceIdFromConfig
};
