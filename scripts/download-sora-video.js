#!/usr/bin/env node
'use strict';

/**
 * Lädt ein fertiges Sora-2-Video per OpenAI-API herunter.
 * Usage:
 *   node scripts/download-sora-video.js <video_id> [output.mp4]
 * Beispiel:
 *   node scripts/download-sora-video.js video_6a2f005bbc58819392d44189329d000d0f7d5d8cd5873332 assets/video/master.mp4
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadOpenAiKey } = require('./lib/openai-env');
const { patchMovieDuration } = require('./fix-mp4-movie-duration');

async function main() {
  const videoId = process.argv[2];
  const outArg = process.argv[3] || 'assets/video/master.mp4';
  if (!videoId) {
    console.error('Usage: node scripts/download-sora-video.js <video_id> [output.mp4]');
    process.exit(1);
  }

  const apiKey = loadOpenAiKey();
  if (!apiKey) {
    console.error('OPENAI_API_KEY fehlt (server/.env oder scripts/visual-ai.local.env).');
    process.exit(1);
  }

  const outPath = path.isAbsolute(outArg) ? outArg : path.join(ROOT, outArg);

  const statusRes = await fetch('https://api.openai.com/v1/videos/' + encodeURIComponent(videoId), {
    headers: { Authorization: 'Bearer ' + apiKey }
  });
  const job = await statusRes.json();
  if (!statusRes.ok) {
    throw new Error('status ' + statusRes.status + ': ' + JSON.stringify(job).slice(0, 400));
  }
  console.log('Quelle:', videoId, '| Status:', job.status, '| Dauer:', (job.seconds || '?') + 's');

  const res = await fetch('https://api.openai.com/v1/videos/' + encodeURIComponent(videoId) + '/content', {
    headers: { Authorization: 'Bearer ' + apiKey }
  });
  if (!res.ok) {
    throw new Error('download ' + res.status + ': ' + (await res.text()).slice(0, 400));
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (fs.existsSync(outPath)) {
    fs.copyFileSync(outPath, outPath.replace(/\.mp4$/i, '.backup.mp4'));
  }
  fs.writeFileSync(outPath, buffer);
  const fixed = patchMovieDuration(outPath);
  console.log('Gespeichert:', path.relative(ROOT, outPath));
  console.log('Groesse:', buffer.length, 'Bytes | Dauer:', fixed.after.toFixed(2) + 's');
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
