#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, 'cloudflare.local.env');
const ZONE_NAME = 'omnisolutionsglobal.com';
const TARGET = 'omnisolutionsglobal-web.onrender.com';
const API = 'https://api.cloudflare.com/client/v4';

function loadToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN.trim();
  if (!fs.existsSync(ENV_FILE)) return '';
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    if (line.startsWith('CLOUDFLARE_API_TOKEN=')) {
      return line.split('=').slice(1).join('=').trim();
    }
  }
  return '';
}

async function cf(method, route, body) {
  const token = loadToken();
  if (!token) {
    console.error('FEHLER: CLOUDFLARE_API_TOKEN fehlt in scripts/cloudflare.local.env');
    process.exit(1);
  }
  const res = await fetch(API + route, {
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!data.success) {
    console.error('Cloudflare', res.status, route, JSON.stringify(data.errors || data).slice(0, 500));
    process.exit(1);
  }
  return data.result;
}

async function getZoneId() {
  const zones = await cf('GET', '/zones?name=' + encodeURIComponent(ZONE_NAME));
  if (!zones || !zones.length) {
    console.error('FEHLER: Zone', ZONE_NAME, 'nicht gefunden. Token-Zugriff prüfen.');
    process.exit(1);
  }
  return zones[0].id;
}

async function upsertCname(zoneId, name, content) {
  const records = await cf('GET', '/zones/' + zoneId + '/dns_records?type=CNAME&name=' + encodeURIComponent(name));
  const hit = records.find(function (r) { return r.name === name; });
  const payload = {
    type: 'CNAME',
    name: name,
    content: content,
    proxied: true,
    ttl: 1
  };
  if (hit) {
    await cf('PUT', '/zones/' + zoneId + '/dns_records/' + hit.id, payload);
    console.log('Aktualisiert:', name, '→', content);
  } else {
    await cf('POST', '/zones/' + zoneId + '/dns_records', payload);
    console.log('Erstellt:', name, '→', content);
  }
}

async function main() {
  const zoneId = await getZoneId();
  console.log('Zone:', ZONE_NAME, zoneId);
  await upsertCname(zoneId, ZONE_NAME, TARGET);
  await upsertCname(zoneId, 'www.' + ZONE_NAME, TARGET);
  console.log('Fertig. DNS kann 2–15 Minuten brauchen.');
}

main().catch(function (err) {
  console.error(err && err.message || err);
  process.exit(1);
});
