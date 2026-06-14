(function () {
  'use strict';

  /**
   * Lokales Live-TTS (XTTS) — gleicher Port wie die Website (lokal: 8080).
   * Stimme kommt ausschließlich aus der lokalen Referenz (omni-homepage-voice.mp3).
   */
  window.OSG_VOICE_CONFIG = {
    brandTtsEndpoint: '',
    localWebPort: 8080,
    localReferenceOnly: true,
    dynamicOnly: true,
    assetVersion: (typeof window !== 'undefined' && window.OSG_BUILD_ID) || '2026.06.12.1'
  };
})();
