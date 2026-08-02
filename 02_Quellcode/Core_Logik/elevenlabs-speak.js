'use strict';

const fs = require('fs');
const path = require('path');

const elevenKeyConfig = require('./elevenlabs-key');
const { SITE_ROOT } = require('./paths');
const MODEL_ID = process.env.BRAND_TTS_MODEL || 'eleven_multilingual_v2';
/** Thai is NOT on multilingual_v2 — must use v3 (or override via BRAND_TTS_MODEL_TH). */
const MODEL_ID_THAI = process.env.BRAND_TTS_MODEL_TH || 'eleven_v3';
const VOICE_CACHE = path.join(__dirname, '.brand-voice-id');
const REFERENCE_MP3 = path.join(SITE_ROOT, 'assets/audio/omni-homepage-voice.mp3');
const REFERENCE_WAV = path.join(SITE_ROOT, 'assets/audio/voice_reference_template.wav');
const USE_HARDCODED_VOICE = process.env.BRAND_USE_HARDCODED_VOICE === '1';

function getApiKey() {
  return elevenKeyConfig.getElevenLabsApiKey();
}

/** Node fetch without UA is often challenged by Cloudflare from cloud egress (Render). */
function elevenHeaders(apiKey, extra) {
  const headers = Object.assign({
    'xi-api-key': apiKey,
    'User-Agent': 'OmniSolutionsGlobal-TTS/1.0 (+https://omnisolutionsglobal.com)',
    Accept: 'application/json'
  }, extra || {});
  return headers;
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
    headers: elevenHeaders(apiKey),
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
    headers: elevenHeaders(apiKey)
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

function shouldPreferConfiguredVoice() {
  return process.env.BRAND_USE_CONFIGURED_VOICE === '1' || !localReferencePath();
}

async function ensureVoiceId() {
  if (resolvedVoiceId) return resolvedVoiceId;

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('elevenlabs_key_missing');

  const explicit = configuredVoiceId();
  const hasRef = !!localReferencePath();

  if (shouldPreferConfiguredVoice() && explicit) {
    resolvedVoiceId = explicit;
    return explicit;
  }

  const cached = readCachedVoiceId();
  if (cached && (!explicit || cached === explicit || hasRef)) {
    resolvedVoiceId = cached;
    return cached;
  }

  const preferLocalClone = process.env.BRAND_USE_CONFIGURED_VOICE !== '1';
  if (preferLocalClone && hasRef) {
    try {
      return await createVoiceCloneFromLocalReference(apiKey);
    } catch (err) {
      const msg = String(err && err.message || '');
      const explicit = configuredVoiceId();
      if (explicit) {
        console.warn('local clone unavailable — using configured ELEVENLABS_VOICE_ID');
        resolvedVoiceId = explicit;
        writeCachedVoiceId(explicit);
        return explicit;
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

  if (explicit) {
    resolvedVoiceId = explicit;
    writeCachedVoiceId(explicit);
    return explicit;
  }

  try {
    return await createVoiceCloneFromLocalReference(apiKey);
  } catch (err) {
    const msg = String(err && err.message || '');
    if (msg.indexOf('local_reference_missing') >= 0 || msg.indexOf('elevenlabs_local_clone') >= 0) {
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

function clearVoiceCache() {
  resolvedVoiceId = null;
  try { fs.unlinkSync(VOICE_CACHE); } catch (e) { /* ignore */ }
}

if (shouldPreferConfiguredVoice()) {
  clearVoiceCache();
}

function isMissingVoicesReadError(err) {
  const msg = String((err && err.message) || err || '');
  return msg.indexOf('missing_permissions') >= 0 || msg.indexOf('voices_read') >= 0;
}

async function requestTtsWithFallbacks(apiKey, text, lang, streamPreferred) {
  const candidates = [];
  const seen = new Set();

  function addCandidate(id, reason) {
    const voiceId = String(id || '').trim();
    if (!voiceId || seen.has(voiceId)) return;
    seen.add(voiceId);
    candidates.push({ voiceId: voiceId, reason: reason });
  }

  addCandidate(configuredVoiceId(), 'configured');
  addCandidate(premadeVoiceFallback(), 'premade');
  addCandidate(resolvedVoiceId, 'resolved');
  addCandidate(readCachedVoiceId(), 'cached');

  let lastErr = null;
  for (let i = 0; i < candidates.length; i += 1) {
    const pick = candidates[i];
    try {
      try {
        const buf = await requestTts(apiKey, pick.voiceId, text, lang, streamPreferred, false);
        resolvedVoiceId = pick.voiceId;
        writeCachedVoiceId(pick.voiceId);
        return buf;
      } catch (langErr) {
        if (isVoiceNotFoundError(langErr && langErr.message)) throw langErr;
        return requestTts(apiKey, pick.voiceId, text, lang, streamPreferred, true);
      }
    } catch (err) {
      lastErr = err;
      if (!isVoiceNotFoundError(err && err.message)) {
        console.error('elevenlabs tts failed:', pick.reason, String(err && err.message || err).slice(0, 160));
      } else {
        console.warn('elevenlabs voice rejected:', pick.voiceId, pick.reason);
      }
    }
  }

  if (localReferencePath()) {
    clearVoiceCache();
    try {
      const cloned = await createVoiceCloneFromLocalReference(apiKey);
      return requestTts(apiKey, cloned, text, lang, streamPreferred, true);
    } catch (cloneErr) {
      lastErr = cloneErr;
    }
  }

  try {
    const accountVoice = await resolveAccountVoiceId(apiKey);
    addCandidate(accountVoice, 'account');
    const pick = candidates[candidates.length - 1];
    const buf = await requestTts(apiKey, pick.voiceId, text, lang, streamPreferred, true);
    resolvedVoiceId = pick.voiceId;
    writeCachedVoiceId(pick.voiceId);
    return buf;
  } catch (accountErr) {
    lastErr = accountErr;
    if (isMissingVoicesReadError(accountErr)) {
      throw lastErr || new Error('elevenlabs_voice_missing');
    }
  }

  throw lastErr || new Error('elevenlabs_voice_missing');
}

const MULTILINGUAL_V2_LANGS = new Set([
  'en', 'ja', 'zh', 'de', 'hi', 'fr', 'ko', 'pt', 'it', 'es', 'id', 'nl', 'tr',
  'fil', 'pl', 'sv', 'bg', 'ro', 'ar', 'cs', 'el', 'fi', 'hr', 'ms', 'sk', 'da', 'ta', 'uk', 'ru'
  /* th / vi: NOT on multilingual_v2 — route via eleven_v3 in modelIdForLang */
]);

function langCode(lang) {
  const tag = String(lang || 'de-DE');
  if (tag.indexOf('zh') === 0) return 'zh';
  return tag.split('-')[0].toLowerCase();
}

function modelIdForLang(lang) {
  if (langCode(lang) === 'th') return MODEL_ID_THAI;
  return MODEL_ID;
}

function languagePayload(lang, forceAuto) {
  const code = langCode(lang);
  if (forceAuto) return {};
  // Thai: enforce language on eleven_v3 so output is real Thai (not mis-detected gibberish).
  if (code === 'th') return { language_code: 'th' };
  if (MULTILINGUAL_V2_LANGS.has(code)) return { language_code: code };
  return {};
}

function parseUpstreamError(status, detail) {
  if (status === 401 && detail.indexOf('quota_exceeded') >= 0) {
    throw new Error('elevenlabs_quota_exceeded');
  }
  if (status === 401 || status === 403) {
    const snippet = String(detail || '');
    // Cloudflare HTML challenge from datacenter egress ≠ invalid API key.
    if (/just a moment|cf-browser-verification|cloudflare/i.test(snippet)) {
      throw new Error('elevenlabs_cloudflare_block:' + snippet.slice(0, 120));
    }
    // Key string may be present but rejected by ElevenLabs — do not pretend it is "missing".
    throw new Error('elevenlabs_unauthorized:' + snippet.slice(0, 160));
  }
  if (status === 400 && detail.indexOf('unsupported_language') >= 0) {
    return 'unsupported_language';
  }
  throw new Error('elevenlabs_upstream:' + status + ':' + detail.slice(0, 200));
}

/** Per-language brand modulation — same clone, speech feel tuned (Paul 2026-07-26). */
function voiceSettingsForLang(lang) {
  const code = langCode(lang);
  const presets = {
    th: { stability: 0.72, similarity_boost: 0.92, style: 0.05, use_speaker_boost: true },
    zh: { stability: 0.65, similarity_boost: 0.93, style: 0.08, use_speaker_boost: true },
    ru: { stability: 0.60, similarity_boost: 0.94, style: 0.10, use_speaker_boost: true },
    pl: { stability: 0.58, similarity_boost: 0.94, style: 0.11, use_speaker_boost: true },
    de: { stability: 0.55, similarity_boost: 0.95, style: 0.12, use_speaker_boost: true },
    en: { stability: 0.52, similarity_boost: 0.95, style: 0.14, use_speaker_boost: true }
  };
  return presets[code] || {
    stability: 0.58,
    similarity_boost: 0.95,
    style: 0.12,
    use_speaker_boost: true
  };
}

async function requestTts(apiKey, voiceId, text, lang, streamPreferred, forceAutoLang) {
  const modelId = modelIdForLang(lang);
  // eleven_v3 rejects optimize_streaming_latency — never stream-optimize for Thai/v3.
  const useStream = !!streamPreferred && modelId !== MODEL_ID_THAI && modelId.indexOf('eleven_v3') !== 0;
  const endpoint = useStream
    ? 'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId) + '/stream?optimize_streaming_latency=3&output_format=mp3_44100_128'
    : 'https://api.elevenlabs.io/v1/text-to-speech/' + encodeURIComponent(voiceId) + '?output_format=mp3_44100_128';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: elevenHeaders(apiKey, {
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg'
    }),
    body: JSON.stringify(Object.assign({
      text: text,
      model_id: modelId,
      voice_settings: voiceSettingsForLang(lang)
    }, languagePayload(lang, forceAutoLang)))
  });

  if (!res.ok) {
    const detail = await res.text().catch(function () { return ''; });
    const kind = parseUpstreamError(res.status, detail);
    if (kind === 'unsupported_language' && !forceAutoLang && langCode(lang) !== 'th') {
      return requestTts(apiKey, voiceId, text, lang, streamPreferred, true);
    }
    throw new Error('elevenlabs_upstream:' + res.status + ':' + detail.slice(0, 200));
  }

  const contentType = String(res.headers.get('content-type') || '').toLowerCase();
  const buf = Buffer.from(await res.arrayBuffer());
  const looksMpeg = buf.length > 3 && (
    buf.slice(0, 3).toString('binary') === 'ID3' ||
    (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)
  );
  const head = buf.slice(0, 64).toString('utf8').toLowerCase();
  const looksHtml = head.indexOf('<!doctype html') >= 0 || head.indexOf('<html') >= 0;
  if (looksHtml || (contentType && contentType.indexOf('audio') < 0 && !looksMpeg)) {
    const snippet = buf.slice(0, 160).toString('utf8');
    if (/restrict access|sanction|just a moment|cloudflare/i.test(snippet)) {
      throw new Error('elevenlabs_geo_or_ip_block:' + snippet.slice(0, 120));
    }
    throw new Error('elevenlabs_non_audio:' + contentType + ':' + snippet.slice(0, 120));
  }
  return buf;
}

function isVoiceNotFoundError(message) {
  const msg = String(message || '');
  return msg.indexOf('voice_not_found') >= 0 ||
    msg.indexOf('invalid_uid') >= 0 ||
    msg.indexOf('invalid ID') >= 0 ||
    (msg.indexOf('elevenlabs_upstream:404') >= 0 && msg.indexOf('voice') >= 0) ||
    (msg.indexOf('elevenlabs_upstream:400') >= 0 && /voice|invalid/i.test(msg));
}

async function synthesizeMp3(text, lang, _referenceWav, streamPreferred) {
  const API_KEY = getApiKey();
  if (!API_KEY) throw new Error('elevenlabs_key_missing');

  await ensureVoiceId();
  return requestTtsWithFallbacks(API_KEY, text, lang, streamPreferred);
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
  usesHardcodedVoice: function () { return USE_HARDCODED_VOICE; },
  modelIdForLang: modelIdForLang
};
