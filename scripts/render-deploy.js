#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(__dirname, 'render.local.env');
const API = 'https://api.render.com/v1';

const REPO = 'https://github.com/Pauli-Omni/omnisolutionsglobal-website';
const SERVICE_NAME = 'omnisolutionsglobal-web';

function loadKey() {
  if (process.env.RENDER_API_KEY) return process.env.RENDER_API_KEY.trim();
  if (!fs.existsSync(ENV_FILE)) return '';
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    if (line.startsWith('RENDER_API_KEY=')) {
      return line.split('=').slice(1).join('=').trim();
    }
  }
  return '';
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

async function main() {
  const owners = await api('GET', '/owners?limit=20');
  const list = Array.isArray(owners) ? owners : [];
  const owner = list[0] && list[0].owner ? list[0].owner : list[0];
  const ownerId = owner && (owner.id || owner.ownerId);
  if (!ownerId) {
    console.error('FEHLER: Kein Render-Workspace gefunden.');
    process.exit(1);
  }
  console.log('Workspace:', owner.name || ownerId);

  const existing = await api('GET', '/services?limit=50');
  const services = Array.isArray(existing) ? existing : [];
  const hit = services.find(function (row) {
    const s = row.service || row;
    return s && s.name === SERVICE_NAME;
  });
  if (hit) {
    const s = hit.service || hit;
    console.log('Service existiert bereits:', s.name, s.serviceDetails && s.serviceDetails.url || '');
    process.exit(0);
  }

  const created = await api('POST', '/services', {
    type: 'web_service',
    name: SERVICE_NAME,
    ownerId: ownerId,
    repo: REPO,
    branch: 'main',
    rootDir: 'server',
    serviceDetails: {
      env: 'node',
      envSpecificDetails: {
        buildCommand: 'npm install',
        startCommand: 'npm start'
      },
      healthCheckPath: '/health',
      plan: 'free',
      region: 'frankfurt'
    }
  });

  const svc = created.service || created;
  console.log('Service erstellt:', svc.name);
  console.log('URL:', (svc.serviceDetails && svc.serviceDetails.url) || 'im Render-Dashboard unter Events');
}

main().catch(function (err) {
  console.error(err && err.message || err);
  process.exit(1);
});
