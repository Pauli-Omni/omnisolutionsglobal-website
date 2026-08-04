#!/usr/bin/env node
/**
 * WP-067 — Register UptimeRobot HTTP(s) monitors for API keep-alive.
 *
 * Free UptimeRobot interval = 5 minutes (enough vs Render 15 min sleep).
 * Optional: paid UptimeRobot for 1-minute.
 *
 * Requires: UPTIMEROBOT_API_KEY in env or scripts/uptimerobot.local.env
 *
 *   node scripts/setup-uptimerobot-keepalive.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, 'uptimerobot.local.env');
const TARGETS = [
  {
    friendly_name: 'OSG API keep-alive (api.omnisolutionsglobal.com)',
    url: 'https://api.omnisolutionsglobal.com/health/ping'
  },
  {
    friendly_name: 'OSG API keep-alive (render origin)',
    url: 'https://omnisolutionsglobal-web.onrender.com/health/ping'
  }
];

function loadKey() {
  if (process.env.UPTIMEROBOT_API_KEY) return process.env.UPTIMEROBOT_API_KEY.trim();
  if (!fs.existsSync(ENV_FILE)) return '';
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    if (line.startsWith('UPTIMEROBOT_API_KEY=')) {
      return line.split('=').slice(1).join('=').trim();
    }
  }
  return '';
}

async function api(endpoint, form) {
  const key = loadKey();
  if (!key) {
    console.error('FEHLER: UPTIMEROBOT_API_KEY fehlt (env oder scripts/uptimerobot.local.env).');
    console.error('Kostenlos: https://uptimerobot.com → My Settings → API Settings → Main API Key');
    process.exit(1);
  }
  const body = new URLSearchParams({ api_key: key, format: 'json', ...form });
  const res = await fetch('https://api.uptimerobot.com/v2/' + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await res.json();
  if (data.stat !== 'ok') {
    console.error('UptimeRobot API Fehler:', JSON.stringify(data));
    process.exit(1);
  }
  return data;
}

async function main() {
  const list = await api('getMonitors', { limit: '50' });
  const existing = (list.monitors || []).map((m) => m.url);

  for (const t of TARGETS) {
    if (existing.includes(t.url)) {
      console.log('bereits vorhanden:', t.url);
      continue;
    }
    // type 1 = HTTP(s), interval 300 = 5 min (free max)
    const created = await api('newMonitor', {
      friendly_name: t.friendly_name,
      url: t.url,
      type: '1',
      interval: '300'
    });
    console.log('angelegt:', t.url, 'id=', created.monitor && created.monitor.id);
  }
  console.log('Fertig. Monitor-Intervall 5 Min hält Render Free wach (Sleep nach ~15 Min Idle).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
