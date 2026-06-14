'use strict';

const fs = require('fs');
const path = require('path');

const elevenKeyConfig = require('./elevenlabs-key');
const MODEL_ID = process.env.BRAND_TTS_MODEL || 'eleven_multilingual_v2';
const VOICE_CACHE = path.join(__dirname, '.brand-voice-id');
const REFERENCE_MP3 = path.join(__dirname, '../assets/audio/omni-homepage-voice.mp3');
const REFERENCE_WAV = path.join(__dirname, '../assets/audio/voice_reference_template.wav');
const USE_HARDCODED_VOICE = process.env.BRAND_USE_HARDCODED_VOICE === '1';

function getApiKey() {
  return elevenKeyConfig.getElevenLabsApiKey();
}

function configuredVoiceId() {
  return (
    process.env.BRAND_VOICE_ID ||
    process.env.ELEVENLABS_VOICE_ID ||
    elevenKeyConfig.getElevenLabsVoiceIdFromConfig() ||
    ''
  ).trim();
}

function localReferencePath() {
  if (fs.existsSync(REFERENCE_MP3)) return REFERENCE_MP3;
  if (fs.existsSync(REFERENCE_WAV)) return REFERENCE_WAV;
  return null;
}

let resolvedVoiceId = null;

function readCachedVoiceId() {
  try {
    if (fs.existsSync(VOICE_CACHE)) {
      return fs.readFileSync(VOICE_CACHE, 'utf8').trim();
    }
  } catch (e) { /* ignore */ }
  return '';
}

function writeCachedVoiceId(voiceId) {
  try {
    fs.writeFileSync(VOICE_CACHE, String(voiceId || '').trim(), 'utf8');
  } catch (e) { /* ignore */ }
}

async function createVoiceCloneFromLocalReference(apiKey) {
  const refPath = localReferencePath();
  if (!refPath) throw new Error('local_reference_missing');

  const fileBuf = fs.readFileSync(refPath);
  const fileName = path.basename(refPath);
  const mime = refPath.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
  const cloneName = (process.env.BRAND_VOICE_CLONE_NAME || 'osg-local-brand-voice').trim();

  const form = new FormData();
  form.append('name', cloneName);
  form.append('description', 'OSG local brand reference');
  form.append('files', new Blob([fileBuf], { type: mime }), fileName);

  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form
  });

  if (!res.ok) {
    const detail = await res.text().catch(function () { return ''; });
    throw new Error('elevenlabs_local_clone:' + res.status + ':' + detail.slice(0, 240));
  }

  const data = await res.json();
  const voiceId = data && (data.voice_id || data.voiceId);
  if (!voiceId) throw new Error('elevenlabs_local_clone:no_voice_id');
  resolvedVoiceId = voiceId;
  writeCachedVoiceId(voiceId);
  console.log('elevenlabs local clone ready:', voiceId);
  return voiceId;
}

async function resolveAccountVoiceId(apiKey) {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey }
  });
  if (!res.ok) {
    const detail = await res.text().catch(function () { return ''; });
    throw new Error('elevenlabs_voices:' + res.status + ':' + detail.slice(0, 200));
  }
  const data = await res.json();
  const voices = (data && data.voices) || [];
  if (!voices.length) throw new Error('elevenlabs_no_voices');
  const pick = voices.find(function (v) {
    return v && v.voice_id && (v.category === 'premade' || v.category === 'professional');
  }) || voices[0];
  const id = pick.voice_id;
  resolvedVoiceId = id;
  writeCachedVoiceId(id);
  console.warn('elevenlabs using account voice:', pick.name || id);
  return id;
}

function premadeVoiceFallback() {
  return (
    process.env.ELEVENLABS_PREMADE_VOICE_ID ||
    process.env.BRAND_PREMADE_VOICE_ID ||
    '21m00Tcm4TlvDq8ikWAM'
  ).trim();
}

function usePremadeVoiceFallback(reason) {
  const id = premadeVoiceFallback();
  if (!id) throw new Error('elevenlabs_voice_missing');
  resolvedVoiceId = id;
  console.warn('elevenlabs premade voice fallback:', reason || 'limited-api-key');
  return id;
}

async function ensureVoiceId() {
  if (resolvedVoiceId) return resolvedVoiceId;

  const explicit = configuredVoiceId();
  if (explicit) {
    resolvedVoiceId = explicit;
    writeCachedVoiceId(explicit);
    return explicit;
  }

  const cached = readCachedVoiceId();
  if (cached) {
    resolvedVoiceId = cached;
    return cached;
  }

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('elevenlabs_key_missing');

  try {
    return await createVoiceCloneFromLocalReference(apiKey);
  } catch (err) {
    const msg = String(err && err.message || '');
    const fallback = configuredVoiceId();
    if (fallback) {
      console.warn('local clone unavailable — using configured ELEVENLABS_VOICE_ID');
      resolvedVoiceId = fallback;
      writeCachedVoiceId(fallback);
      return fallback;
    }
    if (msg.indexOf('elevenlabs_local_clone') >= 0) {
      console.warn('voice clone unavailable — trying existing ElevenLabs account voice');
      try {
        return await resolveAccountVoiceId(apiKey);
      } catch (listErr) {
        return usePremadeVoiceFallback(String(listErr && listErr.message || 'voices-unavailable'));
      }
    }
    throw err;
  }
}

const MULTILINGUAL_V2_LANGS = new Set([
  'en', 'ja', 'zh', 'de', 'hi', 'fr', 'ko', 'pt', 'it', 'es', 'id', 'nl', 'tr',
  'fil', 'pl', 'sv', 'bg', 'ro', 'ar', 'cs', 'el', 'fi', 'hr', 'ms', 'sk', 'da', 'ta', 'uk', 'ru'
]);

function langCode(lang) {
  const tag = String(lang || 'de-DE');
  if (tag.indexOf('zh') === 0) return 'zh';
  return tag.split('-')[0].toLowerCase();
}

function languagePayload(lang, forceAuto) {
  if (forceAuto) return {};
  const code = langCode(lang);
  if (code === 'th') return {};
  if (MULTILINGUAL_V2_LANGS.has(code)) return { language_code: code };
  return {};
}

function parseUpstreamError(status, detail) {
  if (status === 401 && detail.indexOf('quota_exceeded') >= 0) {
    throw new Error('elevenlabs_quota_exceeded');
  }
  if (status === 400 && detail.indexOf('unsupported_language') >= 0) {
    return 'unsupported_language';
  }
  throw new Error('elevenlabs_upstream:' + status + ':' + detail.slice(0, 200));
}

async function requestTts(apiKey, voiceId, text, lang, streamPreferred, forceAutoLang) {
  const endpoint = streamPreferred
    ? 'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId) + '/stream?optimize_streaming_latency=3&output_format=mp3_44100_128'
    : 'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    },
    body: JSON.stringify(Object.assign({
      text: text,
      model_id: MODEL_ID,
      voice_settings: {
        stability: 0.58,
        similarity_boost: 0.95,
        style: 0.12,
        use_speaker_boost: true
      }
    }, languagePayload(lang, forceAutoLang)))
  });

  if (!res.ok) {
    const detail = await res.text().catch(function () { return ''; });
    const kind = parseUpstreamError(res.status, detail);
    if (kind === 'unsupported_language' && !forceAutoLang) {
      return requestTts(apiKey, voiceId, text, lang, streamPreferred, true);
    }
    throw new Error('elevenlabs_upstream:' + res.status + ':' + detail.slice(0, 200));
  }

  return Buffer.from(await res.arrayBuffer());
}

function isVoiceNotFoundError(message) {
  const msg = String(message || '');
  return msg.indexOf('voice_not_found') >= 0 ||
    (msg.indexOf('elevenlabs_upstream:404') >= 0 && msg.indexOf('voice') >= 0);
}

async function synthesizeMp3(text, lang, _referenceWav, streamPreferred) {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('elevenlabs_key_missing');

  let voiceId = await ensureVoiceId();
  if (!voiceId) throw new Error('elevenlabs_voice_missing');

  const autoLang = langCode(lang) === 'th';

  try {
    return await requestTts(API_KEY, voiceId, text, lang, streamPreferred, autoLang);
  } catch (err) {
    if (!isVoiceNotFoundError(err && err.message)) throw err;
    if (configuredVoiceId()) throw err;

    console.warn('cached elevenlabs voice invalid, re-cloning from local reference');
    resolvedVoiceId = null;
    try { fs.unlinkSync(VOICE_CACHE); } catch (e) { /* ignore */ }
    voiceId = await createVoiceCloneFromLocalReference(API_KEY);
    return requestTts(API_KEY, voiceId, text, lang, streamPreferred, autoLang);
  }
}

function hasApiKey() {
  return !!getApiKey();
}

function hasLocalReference() {
  return !!localReferencePath();
}

module.exports = {
  ensureVoiceId: ensureVoiceId,
  synthesizeMp3: synthesizeMp3,
  hasApiKey: hasApiKey,
  hasLocalReference: hasLocalReference,
  getLocalReferencePath: localReferencePath,
  getVoiceId: function () { return resolvedVoiceId; },
  usesHardcodedVoice: function () { return USE_HARDCODED_VOICE; }
};
