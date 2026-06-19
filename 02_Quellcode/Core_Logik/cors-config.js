'use strict';

/**
 * CORS für Render: Same-Origin (Website + /api/speak auf einem Host) braucht
 * oft kein BRAND_TTS_CORS_ORIGIN — reflektiert die Anfrage-Origin in Produktion.
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
