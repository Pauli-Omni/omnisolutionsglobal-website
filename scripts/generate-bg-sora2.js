#!/usr/bin/env node
'use strict';

/**
 * Generates homepage background loop via OpenAI Sora 2 (POST /v1/videos).
 * Output: assets/video/chameleon-bg.mp4
 *
 * Usage:
 *   node scripts/generate-bg-sora2.js
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadOpenAiKey } = require('./lib/openai-env');

const BRIEFS_PATH = path.join(ROOT, 'assets', 'config', 'visual-ai-briefs.json');
const POLL_MS = 8000;
const MAX_POLLS = 90;

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

async function createVideoJob(apiKey, brief) {
  const form = new FormData();
  form.append('model', process.env.OPENAI_SORA_MODEL || brief.model || 'sora-2');
  form.append('prompt', brief.prompt);
  form.append('size', brief.size || '1280x720');
  form.append('seconds', String(brief.seconds || '4'));

  const res = await fetch('https://api.openai.com/v1/videos', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey },
    body: form
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error('sora_create_failed:' + res.status + ':' + detail.slice(0, 400));
  }
  return res.json();
}

async function pollVideo(apiKey, videoId) {
  for (let i = 0; i < MAX_POLLS; i += 1) {
    const res = await fetch('https://api.openai.com/v1/videos/' + encodeURIComponent(videoId), {
      headers: { Authorization: 'Bearer ' + apiKey }
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error('sora_poll_failed:' + res.status + ':' + detail.slice(0, 300));
    }
    const job = await res.json();
    const status = job.status || '';
    const progress = job.progress != null ? job.progress : '';
    console.log('status:', status, progress !== '' ? '(' + progress + '%)' : '');

    if (status === 'completed') return job;
    if (status === 'failed') {
      throw new Error('sora_job_failed:' + JSON.stringify(job.error || job));
    }
    await sleep(POLL_MS);
  }
  throw new Error('sora_timeout');
}

async function downloadVideo(apiKey, videoId) {
  const res = await fetch('https://api.openai.com/v1/videos/' + encodeURIComponent(videoId) + '/content', {
    headers: { Authorization: 'Bearer ' + apiKey }
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error('sora_download_failed:' + res.status + ':' + detail.slice(0, 300));
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const apiKey = loadOpenAiKey();
  if (!apiKey) {
    console.error('OPENAI_API_KEY fehlt. Kopiere scripts/visual-ai.local.env.example → scripts/visual-ai.local.env');
    process.exit(1);
  }

  const briefs = JSON.parse(fs.readFileSync(BRIEFS_PATH, 'utf8'));
  const brief = briefs.backgroundVideo;
  if (!brief || !brief.prompt) {
    console.error('backgroundVideo prompt fehlt in visual-ai-briefs.json');
    process.exit(1);
  }

  const outPath = path.join(ROOT, brief.output || 'assets/video/chameleon-bg.mp4');
  console.log('creating Sora 2 job…');
  const job = await createVideoJob(apiKey, brief);
  const videoId = job.id;
  if (!videoId) throw new Error('sora_no_job_id');

  console.log('job id:', videoId, '— polling…');
  await pollVideo(apiKey, videoId);

  console.log('downloading MP4…');
  const buffer = await downloadVideo(apiKey, videoId);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
  console.log('saved:', brief.output, '(' + buffer.length + ' bytes)');
  console.log('Einbindung: Video liegt unter /assets/video/chameleon-bg.mp4 — chameleon-bg.js lädt es automatisch.');
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
