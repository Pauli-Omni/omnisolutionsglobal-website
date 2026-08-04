#!/usr/bin/env node
/**
 * OSG API Keep-Alive Ping (WP-067)
 * Hits lightweight /health/ping so Render Free does not spin down (~15 min idle).
 *
 * Usage:
 *   node scripts/osg-keepalive-ping.mjs
 *   node scripts/osg-keepalive-ping.mjs --loop --interval-ms=60000
 */
'use strict';

const DEFAULT_TARGETS = [
  'https://api.omnisolutionsglobal.com/health/ping',
  'https://omnisolutionsglobal-web.onrender.com/health/ping'
];

function parseArgs(argv) {
  const out = { loop: false, intervalMs: 60_000, targets: [] };
  for (const a of argv) {
    if (a === '--loop') out.loop = true;
    else if (a.startsWith('--interval-ms=')) out.intervalMs = Math.max(15_000, Number(a.slice(14)) || 60_000);
    else if (a.startsWith('--url=')) out.targets.push(a.slice(6));
  }
  if (!out.targets.length) out.targets = DEFAULT_TARGETS.slice();
  return out;
}

async function pingOne(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'OSG-KeepAlive/1.0 (+omnisolutionsglobal.com)'
      },
      signal: AbortSignal.timeout(45_000)
    });
    const ms = Date.now() - started;
    const body = await res.text().catch(() => '');
    const ok = res.ok;
    console.log(JSON.stringify({
      ok,
      status: res.status,
      ms,
      url,
      body: body.slice(0, 160)
    }));
    return ok;
  } catch (err) {
    const ms = Date.now() - started;
    console.log(JSON.stringify({
      ok: false,
      status: 0,
      ms,
      url,
      error: String(err && err.message || err)
    }));
    return false;
  }
}

async function runOnce(targets) {
  const results = [];
  for (const url of targets) results.push(await pingOne(url));
  return results.every(Boolean);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.loop) {
    const ok = await runOnce(opts.targets);
    process.exit(ok ? 0 : 1);
  }
  console.log(JSON.stringify({
    mode: 'loop',
    intervalMs: opts.intervalMs,
    targets: opts.targets
  }));
  for (;;) {
    await runOnce(opts.targets);
    await new Promise((r) => setTimeout(r, opts.intervalMs));
  }
}

main();
