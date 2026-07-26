'use strict';

const fs = require('fs');
const path = require('path');

const OPENAI_KEY = (process.env.OPENAI_API_KEY || '').trim();
const OPENAI_MODEL = process.env.LOCAL_OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
/* Brand priority is ElevenLabs; OpenAI fallback uses male onyx (not female nova). */
const OPENAI_VOICE = process.env.LOCAL_OPENAI_TTS_VOICE || 'onyx';

function isEnabled() {
  if (process.env.LOCAL_OPENAI_FALLBACK === '0') return false;
  return !!OPENAI_KEY;
}

function speechInstruction(lang) {
  const code = String(lang || 'de-DE').split('-')[0].toLowerCase();
  // CRITICAL: force correct spoken language — never Arabic/English when Thai/German text is given.
  if (code === 'th') {
    return 'Speak exclusively in standard Central Thai (ภาษาไทยมาตรฐาน / ภาษาไทยกลาง). Every syllable must be native Thai. Never use Lao, Khmer, Vietnamese, English, German, or Arabic pronunciation.';
  }
  if (code === 'de') {
    return 'Speak only in natural German (Hochdeutsch), warm and clear, like a professional German presenter. Do not use English.';
  }
  if (code === 'en') return 'Speak in English with natural native fluency.';
  if (code === 'pl') return 'Speak only in Polish with natural native fluency.';
  if (code === 'ru') return 'Speak only in Russian with natural native fluency.';
  if (code === 'zh') return 'Speak only in Mandarin Chinese with natural native fluency.';
  return 'Speak in the language of the input text with natural native fluency.';
}

async function synthesizeMp3(text, lang) {
  if (!OPENAI_KEY) throw new Error('openai_key_missing');

  const body = {
    model: OPENAI_MODEL,
    voice: OPENAI_VOICE,
    input: text,
    response_format: 'mp3'
  };
  if (OPENAI_MODEL.indexOf('gpt-4o') >= 0) {
    body.instructions = speechInstruction(lang);
  }

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + OPENAI_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
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
