'use strict';

/**
 * CORS: Marketing Static Site (omnisolutionsglobal.com) + API host (api.*).
 * In Produktion ohne BRAND_TTS_CORS_ORIGIN: reflektiert https?-Origins
 * (Static → API Cross-Origin für /api/speak, affiliate, ozgs, ops).
 */
function createCorsOriginResolver() {
  var explicit = String(process.env.BRAND_TTS_CORS_ORIGIN || '').trim();
  var isProd = process.env.OMNI_DEV_MODE === '0';

  if (explicit && explicit !== '*') {
    return explicit;
  }

  if (isProd && !explicit) {
    return function (origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (/^https?:\/\//i.test(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    };
  }

  return explicit || '*';
}

module.exports = { createCorsOriginResolver };
