#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, 'render.local.env');
const ELEVEN_FILE = path.join(__dirname, '..', 'server', 'elevenlabs.config.env');
const API = 'https://api.render.com/v1';
const SERVICE_NAME = 'omnisolutionsglobal-web';

function loadKey() {
  if (process.env.RENDER_API_KEY) return process.env.RENDER_API_KEY.trim();
  if (!fs.existsSync(ENV_FILE)) return '';
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    if (line.startsWith('RENDER_API_KEY=')) return line.split('=').slice(1).join('=').trim();
  }
  return '';
}

function localElevenKey() {
  const fromEnv = String(process.env.ELEVENLABS_API_KEY || '').trim();
  if (fromEnv) return fromEnv;
  if (!fs.existsSync(ELEVEN_FILE)) return '';
  const lines = fs.readFileSync(ELEVEN_FILE, 'utf8').split(/\r?\n/);
  const line = lines[15] || '';
  const m = line.match(/ELEVENLABS_API_KEY\s*=\s*(.+)/);
  if (!m) return '';
  return m[1].trim().replace(/^["']|["']$/g, '');
}

async function api(route) {
  const key = loadKey();
  if (!key) throw new Error('RENDER_API_KEY missing');
  const res = await fetch(API + route, {
    headers: { Authorization: 'Bearer ' + key, Accept: 'application/json' }
  });
  const text = await res.text();
  if (!res.ok) throw new Error('API ' + res.status + ' ' + text.slice(0, 200));
  return JSON.parse(text);
}

async function main() {
  const localKey = localElevenKey();
  console.log('local ELEVENLABS_API_KEY length:', localKey.length, localKey ? 'present' : 'MISSING');

  const services = await api('/services?limit=50');
  const hit = services.find(function (row) {
    const s = row.service || row;
    return s && s.name === SERVICE_NAME;
  });
  if (!hit) throw new Error('service not found');
  const svc = hit.service || hit;

  const envRows = await api('/services/' + svc.id + '/env-vars?limit=50');
  const env = {};
  (Array.isArray(envRows) ? envRows : []).forEach(function (row) {
    const item = row.envVar || row;
    if (item && item.key) env[item.key] = item.value || '';
  });

  const remoteKey = String(env.ELEVENLABS_API_KEY || '');
  const remoteVoice = String(env.ELEVENLABS_VOICE_ID || '');
  console.log('render ELEVENLABS_API_KEY length:', remoteKey.length, remoteKey ? 'present' : 'MISSING');
  console.log('render ELEVENLABS_VOICE_ID length:', remoteVoice.length, remoteVoice ? 'present' : 'MISSING');
  console.log('render BRAND_USE_CONFIGURED_VOICE:', env.BRAND_USE_CONFIGURED_VOICE || '(unset)');
  console.log('keys match length:', remoteKey.length === localKey.length);
  console.log('keys match value:', remoteKey === localKey);
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
