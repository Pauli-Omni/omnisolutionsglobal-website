'use strict';

const fs = require('fs');
const path = require('path');
const xtts = require('./xtts-bridge');
const elevenlabs = require('./elevenlabs-speak');
const openaiTts = require('./local-openai-speak');

const REFERENCE_MP3 = path.join(__dirname, '../assets/audio/omni-homepage-voice.mp3');
const REFERENCE_WAV = path.join(__dirname, '../assets/audio/voice_reference_template.wav');

const XTTS_LANGS = new Set([
  'en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar',
  'zh-cn', 'hu', 'ko', 'ja', 'hi'
]);

function localReferencePresent() {
  return fs.existsSync(REFERENCE_MP3) || fs.existsSync(REFERENCE_WAV);
}

function splitChunks(text, maxLen) {
  const full = String(text || '').trim();
  if (!full) return [];
  if (full.length <= maxLen) return [full];
  const parts = full.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [full];
  const chunks = [];
  let buf = '';
  parts.forEach(function (p) {
    const piece = p.trim();
    if (!piece) return;
    if ((buf + ' ' + piece).trim().length > maxLen) {
      if (buf) chunks.push(buf.trim());
      buf = piece;
    } else {
      buf = buf ? buf + ' ' + piece : piece;
    }
  });
  if (buf) chunks.push(buf.trim());
  return chunks.length ? chunks : [full];
}

function langCode(raw) {
  const tag = String(raw || 'de-DE').trim().toLowerCase();
  if (tag.startsWith('zh')) return 'zh-cn';
  return tag.split('-')[0] || 'de';
}

function isXttsLang(lang) {
  return XTTS_LANGS.has(langCode(lang));
}

function isUnsupportedLangError(err) {
  const msg = String((err && err.message) || err || '');
  return msg === 'unsupported_language' || /unsupported_language|not supported/i.test(msg);
}

function isXttsBypassToCloud(err) {
  const msg = String((err && err.message) || err || '');
  return msg === 'xtts_unavailable'
    || msg === 'no_tts_engine'
    || msg === 'local_reference_missing'
    || msg.indexOf('xtts_failed') >= 0;
}

async function health() {
  const xttsHealth = await xtts.health();
  return {
    engine: 'xtts+elevenlabs-fallback',
    localOnly: false,
    localReferencePresent: localReferencePresent(),
    localReferencePath: fs.existsSync(REFERENCE_MP3) ? REFERENCE_MP3 : null,
    referenceWavRequired: true,
    referenceWavPresent: fs.existsSync(REFERENCE_WAV),
    elevenlabsKeyPresent: elevenlabs.hasApiKey(),
    xtts: xttsHealth
  };
}

async function pickEngine() {
  const x = await xtts.health();
  if (x && x.ok) return 'xtts';
  if (!localReferencePresent()) throw new Error('local_reference_missing');
  throw new Error('xtts_unavailable');
}

async function synthesizeViaXtts(text, lang) {
  const engine = await pickEngine();
  if (engine !== 'xtts') throw new Error('no_tts_engine');
  const buf = await xtts.synthesizeMp3(text, lang);
  return { buffer: buf, engine: 'xtts-local-clone' };
}

async function synthesizeViaElevenlabs(text, lang) {
  if (!elevenlabs.hasApiKey()) throw new Error('elevenlabs_key_missing');
  const buf = await elevenlabs.synthesizeMp3(text, lang, null, true);
  return { buffer: buf, engine: 'elevenlabs-clone' };
}

async function synthesizeViaOpenai(text, lang) {
  if (!openaiTts.isEnabled()) throw new Error('openai_key_missing');
  const buf = await openaiTts.synthesizeMp3(text, lang);
  return { buffer: buf, engine: 'openai-tts' };
}

async function synthesizeChunk(text, lang) {
  if (isXttsLang(lang)) {
    try {
      return await synthesizeViaXtts(text, lang);
    } catch (err) {
      if (!isUnsupportedLangError(err) && !isXttsBypassToCloud(err)) throw err;
    }
  }

  if (elevenlabs.hasApiKey()) {
    try {
      return await synthesizeViaElevenlabs(text, lang);
    } catch (err) {
      if (!isUnsupportedLangError(err) && openaiTts.isEnabled()) {
        try {
          return await synthesizeViaOpenai(text, lang);
        } catch (openErr) {
          if (isUnsupportedLangError(openErr)) throw new Error('unsupported_language');
          throw openErr;
        }
      }
      if (isUnsupportedLangError(err)) throw new Error('unsupported_language');
      throw err;
    }
  }

  if (openaiTts.isEnabled()) {
    try {
      return await synthesizeViaOpenai(text, lang);
    } catch (err) {
      if (isUnsupportedLangError(err)) throw new Error('unsupported_language');
      throw err;
    }
  }

  throw new Error('unsupported_language');
}

async function synthesizeFull(text, lang) {
  const chunks = splitChunks(text, 480);
  const parts = [];
  for (let i = 0; i < chunks.length; i += 1) {
    const out = await synthesizeChunk(chunks[i], lang);
    parts.push(out.buffer);
  }
  return { buffer: Buffer.concat(parts), engine: 'xtts-local-clone' };
}

module.exports = {
  health: health,
  synthesizeFull: synthesizeFull,
  synthesizeChunk: synthesizeChunk,
  splitChunks: splitChunks,
  referenceWav: REFERENCE_WAV,
  referenceMp3: REFERENCE_MP3
};
