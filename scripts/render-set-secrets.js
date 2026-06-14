#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ENV_FILE = path.join(__dirname, 'render.local.env');
const ELEVEN_FILE = path.join(__dirname, '..', 'server', 'elevenlabs.config.env');
const API = 'https://api.render.com/v1';
const SERVICE_NAME = 'omnisolutionsglobal-web';

function loadEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function loadKey() {
  const local = loadEnvFile(ENV_FILE);
  return (process.env.RENDER_API_KEY || local.RENDER_API_KEY || '').trim();
}

function readElevenLabsKey() {
  if (!fs.existsSync(ELEVEN_FILE)) return { key: '', voice: '' };
  const lines = fs.readFileSync(ELEVEN_FILE, 'utf8').split(/\r?\n/);
  const key = (lines[15] || '').trim();
  let voice = '';
  for (const line of lines) {
    if (line.startsWith('ELEVENLABS_VOICE_ID=')) {
      voice = line.split('=').slice(1).join('=').trim();
    }
  }
  return { key, voice };
}

async function api(method, route, body) {
  const key = loadKey();
  if (!key) {
    console.error('FEHLER: RENDER_API_KEY fehlt in scripts/render.local.env');
    process.exit(1);
  }
  const res = await fetch(API + route, {
    method,
    headers: {
      Authorization: 'Bearer ' + key,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = text; }
  if (!res.ok) {
    console.error('API', res.status, route, typeof data === 'string' ? data.slice(0, 400) : JSON.stringify(data).slice(0, 400));
    process.exit(1);
  }
  return data;
}

function token() {
  return crypto.randomBytes(24).toString('hex');
}

async function findService() {
  const existing = await api('GET', '/services?limit=50');
  const services = Array.isArray(existing) ? existing : [];
  const hit = services.find(function (row) {
    const s = row.service || row;
    return s && s.name === SERVICE_NAME;
  });
  if (!hit) {
    console.error('FEHLER: Service', SERVICE_NAME, 'nicht gefunden — zuerst render-deploy.js ausführen.');
    process.exit(1);
  }
  return hit.service || hit;
}

async function upsertEnv(serviceId, key, value) {
  await api('PUT', '/services/' + serviceId + '/env-vars/' + encodeURIComponent(key), {
    key: key,
    value: value
  });
  console.log('gesetzt:', key);
}

async function main() {
  const svc = await findService();
  const local = loadEnvFile(ENV_FILE);
  const eleven = readElevenLabsKey();

  const vars = {
    NODE_VERSION: '20',
    OMNI_DEV_MODE: '0',
    BRAND_TTS_ENGINE: 'xtts',
    BRAND_USE_CONFIGURED_VOICE: '1',
    ELEVENLABS_PREMADE_VOICE_ID: '21m00Tcm4TlvDq8ikWAM',
    ELEVENLABS_API_KEY: local.ELEVENLABS_API_KEY || eleven.key,
    ELEVENLABS_VOICE_ID: local.ELEVENLABS_VOICE_ID || eleven.voice,
    OMNI_SECRET_KEY: local.OMNI_SECRET_KEY || token(),
    OSG_OPS_CHECK_TOKEN: local.OSG_OPS_CHECK_TOKEN || token()
  };

  for (const [k, v] of Object.entries(vars)) {
    if (!v) {
      console.warn('übersprungen (leer):', k);
      continue;
    }
    await upsertEnv(svc.id, k, v);
  }
  await api('POST', '/services/' + svc.id + '/deploys', { clearCache: 'do_not_clear' });
  console.log('Redeploy gestartet.');
  console.log('Fertig.');
}

main().catch(function (err) {
  console.error(err && err.message || err);
  process.exit(1);
});
