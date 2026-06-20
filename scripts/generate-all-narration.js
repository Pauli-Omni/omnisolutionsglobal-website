#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CORE = path.join(ROOT, '02_Quellcode', 'Core_Logik');
const LOCALES = path.join(ROOT, 'assets', 'locales');
const OUT = path.join(ROOT, 'assets', 'audio', 'narration');

const LANGS = [
  { locale: 'de', tag: 'de-DE' },
  { locale: 'en', tag: 'en-US' },
  { locale: 'th', tag: 'th-TH' },
  { locale: 'pl', tag: 'pl-PL' },
  { locale: 'ru', tag: 'ru-RU' },
  { locale: 'zh', tag: 'zh-CN' }
];

const HUB_PAGES = [
  { id: 'home', keys: ['home.lead', 'home.portfolioTitle'] },
  { id: 'werbe', keys: ['werbe.premiumTitle', 'werbe.mainVideoTitle', 'werbe.secondVideoTitle'] },
  { id: 'impressum', keys: ['impressum.title', 'impressum.subtitle', 'impressum.note'] },
  { id: 'agb', keys: ['agb.s1Title', 'agb.s1Text', 'agb.s2Title', 'agb.s2Text'] }
];

const APP_PAGES = [
  { id: 'pauli', pageKey: 'pauli' },
  { id: 'omnicad', pageKey: 'omnicad' },
  { id: 'omnigate', pageKey: 'omnigate' },
  { id: 'omniqr', pageKey: 'omniqr' },
  { id: 'omnifix', pageKey: 'omnifix' },
  { id: 'omnibot', pageKey: 'omnibot' },
  { id: 'omniaiQr', pageKey: 'omniaiQr' },
  { id: 'omnitalk', pageKey: 'omnitalk' }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { force: false, langs: null, only: null };
  args.forEach(function (arg) {
    if (arg === '--force') opts.force = true;
    else if (arg.indexOf('--langs=') === 0) {
      opts.langs = arg.slice(8).split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    } else if (arg.indexOf('--only=') === 0) {
      opts.only = arg.slice(7).trim();
    }
  });
  return opts;
}

function loadEnvFile(filePath, overwrite) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, 'utf8').split(/\r?\n/).forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx < 1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (overwrite || !process.env[key]) process.env[key] = val;
  });
}

function loadAllEnv() {
  require(path.join(CORE, 'load-env')).loadProjectEnv();
  loadEnvFile(path.join(ROOT, '..', 'Pauli Best Price', '.env'), false);
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

function loadLocale(locale) {
  const en = JSON.parse(fs.readFileSync(path.join(LOCALES, 'en.json'), 'utf8'));
  const overlayPath = path.join(LOCALES, locale + '.json');
  if (locale === 'en') return en;
  const overlay = JSON.parse(fs.readFileSync(overlayPath, 'utf8'));
  return deepMerge(en, overlay);
}

function get(obj, keyPath) {
  return keyPath.split('.').reduce(function (acc, k) {
    return acc && acc[k] !== undefined ? acc[k] : null;
  }, obj);
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pauliExpand(text, payload) {
  const full = String(text || '').trim();
  if (!full) return full;
  const map = get(payload, 'voice.pauliAbbrev');
  if (!map || typeof map !== 'object' || Array.isArray(map)) return full;
  const keys = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
  let out = full;
  keys.forEach(function (key) {
    const spoken = String(map[key] || '').trim();
    if (!spoken) return;
    out = out.replace(new RegExp(escapeRegex(key), 'g'), spoken);
  });
  return out;
}

function hubText(payload, keys) {
  return pauliExpand(keys.map(function (k) { return stripHtml(get(payload, k)); }).filter(Boolean).join(' '), payload);
}

function appText(payload, pageKey, view) {
  const key = view === 'desc' ? pageKey + '.pageDesc' : pageKey + '.frontWerbetext';
  return pauliExpand(stripHtml(get(payload, key)), payload);
}

function buildCases(opts) {
  const langs = LANGS.filter(function (l) {
    return !opts.langs || opts.langs.indexOf(l.locale) >= 0;
  });
  const cases = [];

  langs.forEach(function (lang) {
    const payload = loadLocale(lang.locale);
    HUB_PAGES.forEach(function (page) {
      cases.push({
        id: page.id + '/hub/' + lang.locale,
        pageKey: page.id,
        view: 'hub',
        langTag: lang.tag,
        text: hubText(payload, page.keys)
      });
    });
    APP_PAGES.forEach(function (page) {
      ['front', 'desc'].forEach(function (view) {
        cases.push({
          id: page.id + '-' + view + '/' + lang.locale,
          pageKey: page.pageKey,
          view: view,
          langTag: lang.tag,
          text: appText(payload, page.pageKey, view)
        });
      });
    });
  });

  if (opts.only) {
    return cases.filter(function (c) { return c.id.indexOf(opts.only) >= 0; });
  }
  return cases;
}

async function main() {
  const opts = parseArgs();
  loadAllEnv();
  const tts = require(path.join(CORE, 'tts-router'));
  const health = await tts.health();
  console.log('TTS health:', JSON.stringify({
    elevenlabsKey: health.elevenlabsKeyPresent,
    openai: !!process.env.OPENAI_API_KEY,
    localRef: health.localReferencePresent
  }));

  const cases = buildCases(opts);
  let ok = 0;
  let skip = 0;
  const fails = [];

  for (let i = 0; i < cases.length; i += 1) {
    const c = cases[i];
    const outDir = path.join(OUT, c.pageKey, c.view);
    const outFile = path.join(outDir, c.langTag + '.mp3');

    if (!c.text || c.text.length < 20) {
      fails.push({ id: c.id, error: 'missing_text' });
      continue;
    }

    if (!opts.force && fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
      skip += 1;
      continue;
    }

    process.stdout.write('[' + (i + 1) + '/' + cases.length + '] ' + c.id + ' …\r');
    try {
      const out = await tts.synthesizeFull(c.text, c.langTag);
      if (!out.buffer || out.buffer.length < 800) {
        throw new Error('output_too_small:' + (out.buffer ? out.buffer.length : 0));
      }
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, out.buffer);
      ok += 1;
      console.log('[' + (i + 1) + '/' + cases.length + '] OK ' + path.relative(ROOT, outFile) +
        ' (' + out.buffer.length + ' B, ' + out.engine + ')');
    } catch (err) {
      fails.push({ id: c.id, error: String(err && err.message || err) });
      console.log('[' + (i + 1) + '/' + cases.length + '] FAIL ' + c.id + ': ' + (err && err.message || err));
    }
  }

  console.log('\nDone. generated:', ok, 'skipped:', skip, 'failed:', fails.length);
  if (fails.length) {
    fails.forEach(function (f) { console.log('FAIL', f.id, f.error); });
    process.exit(1);
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
