'use strict';

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'elevenlabs.config.env');

function readConfigValue(keyName) {
  if (!fs.existsSync(CONFIG_FILE)) return '';
  const lines = fs.readFileSync(CONFIG_FILE, 'utf8').split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const quoted = line.match(new RegExp('^' + keyName + '\\s*=\\s*"([^"]*)"$'));
    if (quoted) {
      const val = quoted[1].trim();
      if (val && !val.startsWith('HIER_')) return val;
      continue;
    }
    const plain = line.match(new RegExp('^' + keyName + '\\s*=\\s*(.+)$'));
    if (!plain) continue;
    const val = plain[1].trim().replace(/^["']|["']$/g, '');
    if (val && !val.startsWith('HIER_')) return val;
  }
  return '';
}

function getElevenLabsApiKey() {
  const fromEnv = String(process.env.ELEVENLABS_API_KEY || '').trim();
  if (fromEnv && fromEnv !== 'HIER_SCHLÜSSEL_EINFÜGEN') return fromEnv;
  return readConfigValue('ELEVENLABS_API_KEY');
}

function getElevenLabsVoiceIdFromConfig() {
  const fromEnv = String(process.env.ELEVENLABS_VOICE_ID || process.env.BRAND_VOICE_ID || '').trim();
  if (fromEnv && fromEnv !== 'HIER_VOICE_ID_EINFÜGEN') return fromEnv;
  return readConfigValue('ELEVENLABS_VOICE_ID');
}

module.exports = {
  configFile: CONFIG_FILE,
  getElevenLabsApiKey: getElevenLabsApiKey,
  getElevenLabsVoiceIdFromConfig: getElevenLabsVoiceIdFromConfig
};
