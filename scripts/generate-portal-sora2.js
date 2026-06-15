#!/usr/bin/env node
'use strict';

/**
 * Portal intro — ONE Sora 2 take → assets/video/portal-loop.mp4
 * Hard limit: maxSeconds from brief (default 45). No auto-extension.
 * Usage: node scripts/generate-portal-sora2.js
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadOpenAiKey } = require('./lib/openai-env');
const { patchMovieDuration, readTrackMaxDuration } = require('./fix-mp4-movie-duration');

const BRIEFS_PATH = path.join(ROOT, 'assets', 'config', 'visual-ai-briefs.json');
const POLL_MS = 8000;
const MAX_POLLS = 180;
const ALLOWED_SECONDS = ['4', '8', '12', '16', '20'];

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function fixMp4Metadata(filePath) {
  const result = patchMovieDuration(filePath);
  console.log(
    'metadata fix:',
    path.basename(filePath),
    result.before.toFixed(2) + 's → ' + result.after.toFixed(2) + 's'
  );
  return result.after;
}

function mp4DurationSec(filePath) {
  return readTrackMaxDuration(fs.readFileSync(filePath));
}

function clampSeconds(raw, maxSeconds) {
  var s = String(raw || '12');
  if (ALLOWED_SECONDS.indexOf(s) < 0) s = '12';
  if (parseInt(s, 10) > maxSeconds) {
    var best = '12';
    ALLOWED_SECONDS.forEach(function (v) {
      if (parseInt(v, 10) <= maxSeconds) best = v;
    });
    s = best;
  }
  return s;
}

async function createVideoJob(apiKey, brief, seconds) {
  const form = new FormData();
  form.append('model', process.env.OPENAI_SORA_MODEL || brief.model || 'sora-2');
  form.append('prompt', brief.prompt);
  form.append('size', brief.size || '1280x720');
  form.append('seconds', seconds);

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
    let res = null;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      res = await fetch('https://api.openai.com/v1/videos/' + encodeURIComponent(videoId), {
        headers: { Authorization: 'Bearer ' + apiKey }
      });
      if (res.status !== 503) break;
      console.log('poll 503 — retry', attempt + 1);
      await sleep(5000);
    }
    if (!res || !res.ok) {
      const detail = res ? await res.text() : 'no response';
      throw new Error('sora_poll_failed:' + (res ? res.status : 0) + ':' + detail.slice(0, 300));
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

async function downloadVideo(apiKey, videoId, outPath) {
  const res = await fetch('https://api.openai.com/v1/videos/' + encodeURIComponent(videoId) + '/content', {
    headers: { Authorization: 'Bearer ' + apiKey }
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error('sora_download_failed:' + res.status + ':' + detail.slice(0, 300));
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
  return buffer.length;
}

async function main() {
  const apiKey = loadOpenAiKey();
  if (!apiKey) {
    console.error('OPENAI_API_KEY fehlt.');
    process.exit(1);
  }

  const briefs = JSON.parse(fs.readFileSync(BRIEFS_PATH, 'utf8'));
  const brief = briefs.portalVideo;
  if (!brief || !brief.prompt) {
    console.error('portalVideo prompt fehlt in visual-ai-briefs.json');
    process.exit(1);
  }

  const maxSeconds = brief.maxSeconds || 45;
  const targetSeconds = clampSeconds(brief.seconds, maxSeconds);
  const outPath = path.join(ROOT, brief.output || 'assets/video/portal-loop.mp4');

  if (fs.existsSync(outPath)) {
    const backup = outPath.replace(/\.mp4$/i, '.old.mp4');
    fs.copyFileSync(outPath, backup);
    console.log('backup:', path.relative(ROOT, backup));
  }

  console.log('Sora 2 Portal — ONE take, max', maxSeconds + 's, generating', targetSeconds + 's');
  console.log('Prompt:\n', brief.prompt, '\n');

  const job = await createVideoJob(apiKey, brief, targetSeconds);
  const videoId = job.id;
  if (!videoId) throw new Error('sora_no_job_id');

  console.log('job id:', videoId, '— polling…');
  await pollVideo(apiKey, videoId);

  console.log('downloading MP4…');
  const bytes = await downloadVideo(apiKey, videoId, outPath);
  const duration = fixMp4Metadata(outPath);

  if (duration > maxSeconds + 0.5) {
    console.error('FEHLER: Video laenger als maxSeconds (' + maxSeconds + 's): ' + duration.toFixed(2) + 's');
    process.exit(2);
  }

  console.log('OK — portal-loop.mp4:', bytes, 'bytes,', duration.toFixed(2) + 's (limit', maxSeconds + 's)');
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
