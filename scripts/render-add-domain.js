#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, 'render.local.env');
const API = 'https://api.render.com/v1';
const SERVICE_NAME = 'omnisolutionsglobal-web';
const DOMAINS = ['omnisolutionsglobal.com', 'www.omnisolutionsglobal.com'];

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
    console.error('API', res.status, route, typeof data === 'string' ? data.slice(0, 600) : JSON.stringify(data).slice(0, 600));
    process.exit(1);
  }
  return data;
}

async function findService() {
  const existing = await api('GET', '/services?limit=50');
  const services = Array.isArray(existing) ? existing : [];
  const hit = services.find(function (row) {
    const s = row.service || row;
    return s && s.name === SERVICE_NAME;
  });
  if (!hit) {
    console.error('FEHLER: Service', SERVICE_NAME, 'nicht gefunden.');
    process.exit(1);
  }
  return hit.service || hit;
}

async function main() {
  const svc = await findService();
  console.log('Service:', svc.name, svc.id);
  console.log('Render-URL:', (svc.serviceDetails && svc.serviceDetails.url) || '');

  const listed = await api('GET', '/services/' + svc.id + '/custom-domains?limit=20');
  const rows = Array.isArray(listed) ? listed : [];
  const names = rows.map(function (row) {
    const d = row.customDomain || row;
    return d && d.name;
  }).filter(Boolean);
  console.log('Bereits verbunden:', names.length ? names.join(', ') : '(keine)');

  for (const domain of DOMAINS) {
    if (names.indexOf(domain) >= 0) {
      console.log('OK (existiert):', domain);
      continue;
    }
    const created = await api('POST', '/services/' + svc.id + '/custom-domains', { name: domain });
    const d = created.customDomain || created;
    console.log('Hinzugefügt:', d.name, d.verificationStatus || d.verification_status || '');
  }

  const finalList = await api('GET', '/services/' + svc.id + '/custom-domains?limit=20');
  console.log('\n--- DNS in Cloudflare eintragen ---');
  console.log('Hauptdomain (omnisolutionsglobal.com):');
  console.log('  Typ: A');
  console.log('  Name: @');
  console.log('  Wert: 216.24.57.1');
  console.log('  Proxy: AUS (graue Wolke)');
  console.log('');
  console.log('www (www.omnisolutionsglobal.com):');
  console.log('  Typ: CNAME');
  console.log('  Name: www');
  console.log('  Wert: omnisolutionsglobal-web.onrender.com');
  console.log('  Proxy: AUS (graue Wolke)');
  console.log('');
  console.log('Details von Render:');
  console.log(JSON.stringify(finalList, null, 2).slice(0, 2000));
}

main().catch(function (err) {
  console.error(err && err.message || err);
  process.exit(1);
});
