#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOCALES = path.join(ROOT, 'assets', 'locales');
const LANGS = [
  { locale: 'de', tag: 'de-DE' },
  { locale: 'en', tag: 'en-US' },
  { locale: 'th', tag: 'th-TH' }
];

const HUB_PAGES = [
  { id: 'home', keys: ['home.lead', 'home.portfolioTitle'] },
  { id: 'werbe', keys: ['werbe.premiumTitle', 'werbe.mainVideoTitle', 'werbe.secondVideoTitle'] },
  { id: 'impressum', keys: ['impressum.title', 'impressum.subtitle', 'impressum.note'] },
  { id: 'agb', keys: ['agb.s1Title', 'agb.s1Text', 'agb.s2Title', 'agb.s2Text'] }
];

const APP_PAGES = [
  { id: 'pauli-front', pageKey: 'pauli', view: 'front' },
  { id: 'pauli-desc', pageKey: 'pauli', view: 'desc' },
  { id: 'omnicad-front', pageKey: 'omnicad', view: 'front' },
  { id: 'omnicad-desc', pageKey: 'omnicad', view: 'desc' },
  { id: 'omnigate-front', pageKey: 'omnigate', view: 'front' },
  { id: 'omnigate-desc', pageKey: 'omnigate', view: 'desc' },
  { id: 'omniqr-front', pageKey: 'omniqr', view: 'front' },
  { id: 'omniqr-desc', pageKey: 'omniqr', view: 'desc' },
  { id: 'omnifix-front', pageKey: 'omnifix', view: 'front' },
  { id: 'omnifix-desc', pageKey: 'omnifix', view: 'desc' },
  { id: 'omnibot-front', pageKey: 'omnibot', view: 'front' },
  { id: 'omnibot-desc', pageKey: 'omnibot', view: 'desc' },
  { id: 'omniaiQr-front', pageKey: 'omniaiQr', view: 'front' },
  { id: 'omniaiQr-desc', pageKey: 'omniaiQr', view: 'desc' },
  { id: 'omnitalk-front', pageKey: 'omnitalk', view: 'front' },
  { id: 'omnitalk-desc', pageKey: 'omnitalk', view: 'desc' }
];

function loadLocale(locale) {
  const en = JSON.parse(fs.readFileSync(path.join(LOCALES, 'en.json'), 'utf8'));
  const overlay = JSON.parse(fs.readFileSync(path.join(LOCALES, locale + '.json'), 'utf8'));
  return deepMerge(en, overlay);
}

function deepMerge(base, overlay) {
  const out = Object.assign({}, base);
  Object.keys(overlay || {}).forEach(function (key) {
    if (overlay[key] && typeof overlay[key] === 'object' && !Array.isArray(overlay[key]) &&
        base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      out[key] = deepMerge(base[key], overlay[key]);
    } else {
      out[key] = overlay[key];
    }
  });
  return out;
}

function get(obj, keyPath) {
  return keyPath.split('.').reduce(function (acc, k) {
    return acc && acc[k] !== undefined ? acc[k] : null;
  }, obj);
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function hubText(payload, keys) {
  return keys.map(function (k) { return stripHtml(get(payload, k)); }).filter(Boolean).join(' ');
}

function appText(payload, pageKey, view) {
  const key = view === 'desc' ? pageKey + '.pageDesc' : pageKey + '.frontWerbetext';
  return stripHtml(get(payload, key));
}

function splitChunks(text, maxLen) {
  const full = String(text || '').trim();
  if (!full) return [];
  if (full.length <= maxLen) return [full];
  const parts = full.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [full];
  const chunks = [];
  let buf = '';
  parts.forEach(function (p) {
    const piece = p.trim();
    if (!piece) return;
    if ((buf + ' ' + piece).trim().length > maxLen) {
      if (buf) chunks.push(buf.trim());
      buf = piece;
    } else {
      buf = buf ? buf + ' ' + piece : piece;
    }
  });
  if (buf) chunks.push(buf.trim());
  return chunks.length ? chunks : [full];
}

async function testViaRouter(tts, text, langTag) {
  const chunks = splitChunks(text, 480);
  let total = 0;
  let engine = '';
  for (let i = 0; i < chunks.length; i += 1) {
    const out = await tts.synthesizeChunk(chunks[i], langTag);
    engine = out.engine;
    total += out.buffer.length;
    if (out.buffer.length < 800) {
      throw new Error('chunk_too_small:' + out.buffer.length);
    }
  }
  return { engine: engine, bytes: total, chunks: chunks.length };
}

async function testViaHttp(baseUrl, text, langTag) {
  const chunks = splitChunks(text, 480);
  let total = 0;
  let engine = '';
  for (let i = 0; i < chunks.length; i += 1) {
    const res = await fetch(baseUrl.replace(/\/$/, '') + '/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: chunks[i], lang: langTag })
    });
    if (!res.ok) {
      const body = await res.text().catch(function () { return ''; });
      throw new Error('http_' + res.status + ':' + body.slice(0, 120));
    }
    engine = res.headers.get('x-osg-voice-engine') || 'unknown';
    const buf = Buffer.from(await res.arrayBuffer());
    total += buf.length;
    if (buf.length < 800) throw new Error('chunk_too_small:' + buf.length);
  }
  return { engine: engine, bytes: total, chunks: chunks.length };
}

async function main() {
  const baseUrl = process.argv[2] || '';
  const useHttp = !!baseUrl;
  let tts = null;
  if (!useHttp) {
    require(path.join(ROOT, 'server', 'load-env')).loadProjectEnv();
    tts = require(path.join(ROOT, 'server', 'tts-router'));
  }

  const cases = [];
  LANGS.forEach(function (lang) {
    const payload = loadLocale(lang.locale);
    HUB_PAGES.forEach(function (page) {
      cases.push({
        id: page.id + '/' + lang.locale,
        langTag: lang.tag,
        text: hubText(payload, page.keys)
      });
    });
    APP_PAGES.forEach(function (page) {
      cases.push({
        id: page.id + '/' + lang.locale,
        langTag: lang.tag,
        text: appText(payload, page.pageKey, page.view)
      });
    });
  });

  const fails = [];
  const oks = [];
  for (let i = 0; i < cases.length; i += 1) {
    const c = cases[i];
    if (!c.text || c.text.length < 20) {
      fails.push({ id: c.id, error: 'missing_text' });
      continue;
    }
    process.stdout.write('… ' + c.id + '\r');
    try {
      const out = useHttp
        ? await testViaHttp(baseUrl, c.text, c.langTag)
        : await testViaRouter(tts, c.text, c.langTag);
      oks.push({ id: c.id, engine: out.engine, bytes: out.bytes, chunks: out.chunks });
    } catch (err) {
      fails.push({ id: c.id, error: String(err && err.message || err) });
    }
  }

  console.log('\nVoice page test' + (useHttp ? ' @ ' + baseUrl : ' (local router)'));
  console.log('OK:', oks.length, 'FAIL:', fails.length);
  if (fails.length) {
    fails.forEach(function (f) { console.log('FAIL', f.id, f.error); });
    process.exit(1);
  }
  const th = oks.filter(function (r) { return r.id.indexOf('/th') >= 0; }).length;
  const de = oks.filter(function (r) { return r.id.indexOf('/de') >= 0; }).length;
  const en = oks.filter(function (r) { return r.id.indexOf('/en') >= 0; }).length;
  console.log('de:', de, 'en:', en, 'th:', th);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
