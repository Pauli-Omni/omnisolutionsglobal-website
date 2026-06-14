'use strict';

const zlib = require('zlib');

const BOT_UA = /curl|wget|python-requests|scrapy|httpie|Go-http-client|libwww|java\/|okhttp|postmanruntime|insomnia|headlesschrome|phantomjs|selenium|puppeteer|playwright/i;

let gzipBombCache = null;

function getGzipBomb() {
  if (!gzipBombCache) {
    const raw = Buffer.alloc(12 * 1024 * 1024, 0);
    gzipBombCache = zlib.gzipSync(raw, { level: 9 });
  }
  return gzipBombCache;
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : '0.0.0.0';
}

function isAutomatedClient(req) {
  const ua = String(req.headers['user-agent'] || '').trim();
  if (!ua) return true;
  if (BOT_UA.test(ua)) return true;
  const accept = String(req.headers.accept || '');
  if (!accept && req.method === 'GET') return true;
  return false;
}

function lacksClientProof(req) {
  const proof = req.headers['x-osg-client-proof'];
  return proof !== 'omniqr-web-v1';
}

function sendZipBomb(res) {
  res.status(403);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Content-Disposition', 'attachment; filename="integrity-feed.gz"');
  res.setHeader('Cache-Control', 'no-store');
  res.send(getGzipBomb());
}

function createArmorMiddleware(options) {
  const basePath = options && options.basePath ? options.basePath : '/omniqr-ai-for-tourist-of-thailand';

  return function omniQrArmor(req, res, next) {
    if (!req.path.startsWith(basePath)) return next();

    if (isAutomatedClient(req)) {
      sendZipBomb(res);
      return;
    }

    if (req.path.indexOf('/api/') >= 0 && lacksClientProof(req)) {
      res.status(403).json({ error: 'client_proof_required' });
      return;
    }

    next();
  };
}

module.exports = {
  createArmorMiddleware,
  clientIp,
  isAutomatedClient,
  sendZipBomb,
  getGzipBomb
};
