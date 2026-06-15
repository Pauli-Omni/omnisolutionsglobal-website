#!/usr/bin/env node
'use strict';

/**
 * Generates app icons via OpenAI Images API from assets/config/visual-ai-briefs.json.
 * Icons (PNG, transparent) — NOT Sora 2 (video). Sora is for background clips only.
 *
 * Usage:
 *   node scripts/generate-app-icons-openai.js
 *   node scripts/generate-app-icons-openai.js --id omnigateAiMaster
 *   node scripts/generate-app-icons-openai.js --force
 */

const fs = require('fs');
const path = require('path');
const { ROOT, loadOpenAiKey } = require('./lib/openai-env');

const BRIEFS_PATH = path.join(ROOT, 'assets', 'config', 'visual-ai-briefs.json');
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1';

function parseArgs(argv) {
  const out = { force: false, id: '' };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--force') out.force = true;
    else if (argv[i] === '--id' && argv[i + 1]) {
      out.id = argv[++i];
    }
  }
  return out;
}

function buildPrompt(styleSystem, imagePrompt) {
  return styleSystem + ' Subject: ' + imagePrompt;
}

async function generateIcon(apiKey, prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      background: 'transparent',
      output_format: 'png'
    })
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error('image_api_failed:' + res.status + ':' + detail.slice(0, 400));
  }

  const data = await res.json();
  const item = data && data.data && data.data[0];
  if (!item) throw new Error('image_api_empty_response');

  if (item.b64_json) return Buffer.from(item.b64_json, 'base64');
  if (item.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error('image_download_failed:' + imgRes.status);
    return Buffer.from(await imgRes.arrayBuffer());
  }
  throw new Error('image_api_no_payload');
}

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = loadOpenAiKey();
  if (!apiKey) {
    console.error('OPENAI_API_KEY fehlt. Kopiere scripts/visual-ai.local.env.example → scripts/visual-ai.local.env');
    process.exit(1);
  }

  const briefs = JSON.parse(fs.readFileSync(BRIEFS_PATH, 'utf8'));
  let apps = briefs.apps || [];
  if (args.id) {
    apps = apps.filter(function (a) { return a.id === args.id; });
    if (!apps.length) {
      console.error('Unbekannte App-ID:', args.id);
      process.exit(1);
    }
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < apps.length; i += 1) {
    const app = apps[i];
    const outPath = path.join(ROOT, app.output);
    if (!args.force && fs.existsSync(outPath) && fs.statSync(outPath).size > 0) {
      console.log('skip (exists):', app.output);
      skipped += 1;
      continue;
    }

    const prompt = buildPrompt(briefs.styleSystem, app.imagePrompt);
    console.log('generating:', app.id, '→', app.output);
    const buffer = await generateIcon(apiKey, prompt);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, buffer);
    console.log('saved:', app.output, '(' + buffer.length + ' bytes)');
    created += 1;
  }

  console.log('done — created:', created, 'skipped:', skipped);
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
