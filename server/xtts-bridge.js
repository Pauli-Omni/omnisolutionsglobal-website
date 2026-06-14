'use strict';

const XTTS_URL = (process.env.XTTS_SERVICE_URL || 'http://127.0.0.1:8788').replace(/\/$/, '');
const XTTS_TIMEOUT_MS = Number(process.env.XTTS_TIMEOUT_MS || 300000);

async function health() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 4000);
    const res = await fetch(XTTS_URL + '/health', { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return { ok: false };
    return res.json();
  } catch (e) {
    return { ok: false };
  }
}

async function synthesizeMp3(text, lang) {
  const ctrl = new AbortController();
  const timer = setTimeout(function () { ctrl.abort(); }, XTTS_TIMEOUT_MS);
  try {
    const res = await fetch(XTTS_URL + '/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      signal: ctrl.signal,
      body: JSON.stringify({ text: text, lang: lang })
    });
    if (!res.ok) {
      const detail = await res.text().catch(function () { return ''; });
      try {
        const body = JSON.parse(detail);
        if (body && body.error === 'unsupported_language') {
          throw new Error('unsupported_language');
        }
      } catch (parseErr) {
        if (parseErr && parseErr.message === 'unsupported_language') throw parseErr;
      }
      if (/not supported|unsupported_language/i.test(detail)) {
        throw new Error('unsupported_language');
      }
      throw new Error('xtts_failed:' + res.status + ':' + detail.slice(0, 200));
    }
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  health: health,
  synthesizeMp3: synthesizeMp3,
  serviceUrl: XTTS_URL
};
