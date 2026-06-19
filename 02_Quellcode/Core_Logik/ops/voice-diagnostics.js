'use strict';

const fs = require('fs');
const path = require('path');
const tts = require('../tts-router');
const elevenlabs = require('../elevenlabs-speak');
const openaiTts = require('../local-openai-speak');
const { getElevenLabsApiKey, getElevenLabsVoiceIdFromConfig, configFile } = require('../elevenlabs-key');
const { readRelease } = require('../release/read-release');
const xtts = require('../xtts-bridge');

const { SITE_ROOT } = require('../paths');
const DEV_SECRET = 'OMNI_DEV_SECRET_CHANGE_IN_PRODUCTION';

function statusFromBool(ok, warnIfFalse) {
  if (ok) return 'ok';
  return warnIfFalse ? 'warn' : 'fail';
}

function check(id, labelKey, status, detailKey, detailVars) {
  return { id: id, labelKey: labelKey, status: status, detailKey: detailKey || '', detailVars: detailVars || {} };
}

function omniSecretStatus() {
  const key = process.env.OMNI_SECRET_KEY || process.env.OMNI_QR_PAY_HMAC_SECRET || '';
  const devMode = process.env.OMNI_DEV_MODE !== '0';
  if (!key) {
    return check('omni_secret_key', 'opsVoiceCheck.checks.omniSecretKey', devMode ? 'warn' : 'fail', 'opsVoiceCheck.detail.omniSecretMissing');
  }
  if (!devMode && key === DEV_SECRET) {
    return check('omni_secret_key', 'opsVoiceCheck.checks.omniSecretKey', 'fail', 'opsVoiceCheck.detail.omniSecretDevDefault');
  }
  return check('omni_secret_key', 'opsVoiceCheck.checks.omniSecretKey', 'ok', 'opsVoiceCheck.detail.omniSecretPresent');
}

function smtpSupportStatus() {
  const host = (process.env.OMNI_SMTP_HOST || '').trim();
  const from = (process.env.OMNI_SMTP_FROM || '').trim();
  if (host && from) {
    return check('smtp_support', 'opsVoiceCheck.checks.smtpSupport', 'ok', 'opsVoiceCheck.detail.smtpConfigured');
  }
  return check('smtp_support', 'opsVoiceCheck.checks.smtpSupport', 'warn', 'opsVoiceCheck.detail.smtpOutboxOnly');
}

async function buildVoiceDiagnostics(options) {
  const opts = options || {};
  const checks = [];
  const ttsHealth = await tts.health().catch(function () { return null; });
  const xttsHealth = ttsHealth && ttsHealth.xtts ? ttsHealth.xtts : await xtts.health().catch(function () { return null; });

  const elevenKey = !!getElevenLabsApiKey();
  const elevenVoice = !!getElevenLabsVoiceIdFromConfig();
  const openaiKey = openaiTts.isEnabled();
  const cors = process.env.BRAND_TTS_CORS_ORIGIN || '*';
  const devMode = process.env.OMNI_DEV_MODE !== '0';

  checks.push(check(
    'elevenlabs_config_file',
    'opsVoiceCheck.checks.elevenlabsConfigFile',
    fs.existsSync(configFile) ? 'ok' : 'fail',
    fs.existsSync(configFile) ? 'opsVoiceCheck.detail.configFileFound' : 'opsVoiceCheck.detail.configFileMissing',
    { path: '02_Quellcode/Core_Logik/elevenlabs.config.env' }
  ));

  checks.push(check(
    'elevenlabs_api_key',
    'opsVoiceCheck.checks.elevenlabsApiKey',
    statusFromBool(elevenKey, !devMode),
    elevenKey ? 'opsVoiceCheck.detail.keyPresent' : 'opsVoiceCheck.detail.keyMissing'
  ));

  checks.push(check(
    'elevenlabs_voice_id',
    'opsVoiceCheck.checks.elevenlabsVoiceId',
    statusFromBool(elevenVoice, true),
    elevenVoice ? 'opsVoiceCheck.detail.voiceIdPresent' : 'opsVoiceCheck.detail.voiceIdMissing'
  ));

  checks.push(check(
    'openai_api_key',
    'opsVoiceCheck.checks.openaiApiKey',
    openaiKey ? 'ok' : 'warn',
    openaiKey ? 'opsVoiceCheck.detail.openaiPresent' : 'opsVoiceCheck.detail.openaiOptional'
  ));

  checks.push(check(
    'local_reference',
    'opsVoiceCheck.checks.localReference',
    ttsHealth && ttsHealth.localReferencePresent ? 'ok' : 'warn',
    ttsHealth && ttsHealth.localReferencePresent
      ? 'opsVoiceCheck.detail.referencePresent'
      : 'opsVoiceCheck.detail.referenceMissing'
  ));

  checks.push(check(
    'xtts_daemon',
    'opsVoiceCheck.checks.xttsDaemon',
    xttsHealth && xttsHealth.ok ? 'ok' : 'warn',
    xttsHealth && xttsHealth.ok ? 'opsVoiceCheck.detail.xttsOk' : 'opsVoiceCheck.detail.xttsOffline'
  ));

  checks.push(check(
    'speak_endpoint',
    'opsVoiceCheck.checks.speakEndpoint',
    'ok',
    'opsVoiceCheck.detail.speakEndpoint',
    { path: '/api/speak' }
  ));

  checks.push(check(
    'cors_origin',
    'opsVoiceCheck.checks.corsOrigin',
    cors === '*' ? 'warn' : 'ok',
    cors === '*' ? 'opsVoiceCheck.detail.corsWildcard' : 'opsVoiceCheck.detail.corsSet',
    { origin: cors === '*' ? '*' : cors }
  ));

  checks.push(omniSecretStatus());
  checks.push(smtpSupportStatus());

  checks.push(check(
    'omni_dev_mode',
    'opsVoiceCheck.checks.omniDevMode',
    devMode ? 'warn' : 'ok',
    devMode ? 'opsVoiceCheck.detail.devModeOn' : 'opsVoiceCheck.detail.devModeOff'
  ));

  let releaseOk = false;
  try {
    const rel = readRelease(SITE_ROOT);
    releaseOk = !!(rel && rel.buildId);
  } catch (e) { /* ignore */ }
  checks.push(check(
    'release_api',
    'opsVoiceCheck.checks.releaseApi',
    releaseOk ? 'ok' : 'warn',
    releaseOk ? 'opsVoiceCheck.detail.releaseOk' : 'opsVoiceCheck.detail.releaseMissing'
  ));

  const speakReady = elevenKey || (xttsHealth && xttsHealth.ok) || openaiKey;
  const summary = { pass: 0, warn: 0, fail: 0 };
  checks.forEach(function (c) {
    if (c.status === 'ok') summary.pass += 1;
    else if (c.status === 'warn') summary.warn += 1;
    else summary.fail += 1;
  });

  const payload = {
    ok: summary.fail === 0 && speakReady,
    speakReady: speakReady,
    summary: summary,
    checks: checks,
    engines: {
      elevenlabs: elevenKey && elevenVoice,
      xtts: !!(xttsHealth && xttsHealth.ok),
      openai: openaiKey
    },
    endpoints: {
      speak: '/api/speak',
      speakStream: '/api/speak/stream',
      health: '/health',
      release: '/api/release.json',
      omniqrHealth: '/omniqr-ai-for-tourist-of-thailand/api/health'
    },
    ttsHealth: ttsHealth
      ? {
        engine: ttsHealth.engine,
        localReferencePresent: ttsHealth.localReferencePresent,
        elevenlabsKeyPresent: ttsHealth.elevenlabsKeyPresent
      }
      : null
  };

  if (opts.probe) {
    try {
      const probe = await tts.synthesizeChunk('Test.', 'de-DE');
      payload.probe = {
        ok: true,
        engine: probe.engine,
        bytes: probe.buffer ? probe.buffer.length : 0
      };
    } catch (err) {
      payload.probe = {
        ok: false,
        error: String(err && err.message || err)
      };
      payload.ok = false;
    }
  }

  return payload;
}

async function buildPublicVoiceStatus() {
  const ttsHealth = await tts.health().catch(function () { return null; });
  const xttsHealth = ttsHealth && ttsHealth.xtts ? ttsHealth.xtts : await xtts.health().catch(function () { return null; });
  const elevenKey = elevenlabs.hasApiKey();
  const openaiKey = openaiTts.isEnabled();
  const speakReady = elevenKey || (xttsHealth && xttsHealth.ok) || openaiKey;
  let reason = '';
  if (!speakReady) {
    if (!elevenKey && !(xttsHealth && xttsHealth.ok)) reason = 'no_tts_engine';
    else if (!elevenKey) reason = 'elevenlabs_key_missing';
  }
  return {
    speakReady: speakReady,
    reason: reason || null,
    engines: {
      elevenlabs: elevenKey,
      xtts: !!(xttsHealth && xttsHealth.ok),
      openai: openaiKey
    }
  };
}

module.exports = {
  buildVoiceDiagnostics: buildVoiceDiagnostics,
  buildPublicVoiceStatus: buildPublicVoiceStatus
};
