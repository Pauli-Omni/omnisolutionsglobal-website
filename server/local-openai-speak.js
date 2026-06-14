'use strict';

const fs = require('fs');
const path = require('path');

const OPENAI_KEY = (process.env.OPENAI_API_KEY || '').trim();
const OPENAI_MODEL = process.env.LOCAL_OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const OPENAI_VOICE = process.env.LOCAL_OPENAI_TTS_VOICE || 'onyx';

function isEnabled() {
  if (process.env.LOCAL_OPENAI_FALLBACK === '0') return false;
  return !!OPENAI_KEY;
}

async function synthesizeMp3(text, lang) {
  if (!OPENAI_KEY) throw new Error('openai_key_missing');

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + OPENAI_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      voice: OPENAI_VOICE,
      input: text,
      response_format: 'mp3'
    })
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error('openai_tts_failed:' + res.status + ':' + detail.slice(0, 200));
  }

  return Buffer.from(await res.arrayBuffer());
}

function saveNarration(buffer, pageKey, view, lang, narrationDir) {
  if (!pageKey || !view || !lang) return null;
  const bcp = String(lang).replace(/[^a-zA-Z0-9-]/g, '');
  const outDir = path.join(narrationDir, pageKey, view);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, bcp + '.mp3');
  fs.writeFileSync(outFile, buffer);
  return outFile;
}

module.exports = {
  isEnabled: isEnabled,
  synthesizeMp3: synthesizeMp3,
  saveNarration: saveNarration
};
