/**
 * Cloudflare Worker cron — ping OSG API every minute (WP-067).
 * Keeps Render Free Node awake; Static Site does not need this.
 */
const TARGETS = [
  'https://api.omnisolutionsglobal.com/health/ping',
  'https://omnisolutionsglobal-web.onrender.com/health/ping'
];

async function pingAll() {
  const results = [];
  for (const url of TARGETS) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'OSG-KeepAlive/1.0 (+cloudflare-worker)'
        }
      });
      results.push({ url, status: res.status, ok: res.ok });
    } catch (err) {
      results.push({ url, status: 0, ok: false, error: String(err) });
    }
  }
  return results;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pingAll().then((r) => console.log('keepalive', JSON.stringify(r))));
  },
  async fetch() {
    const results = await pingAll();
    return Response.json({ ok: results.every((r) => r.ok), results });
  }
};
