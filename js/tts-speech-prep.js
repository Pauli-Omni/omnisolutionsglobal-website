(function () {
  'use strict';

  // CRITICAL: DO NOT HARDCODE LANGUAGES. ALWAYS USE GLOBAL I18N SYSTEM. PARSE ABBREVIATIONS VIA PAULI-METHOD ONLY.

  function escapeRegex(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function pauliAbbrevMap() {
    if (!window.OSGI18n || typeof OSGI18n.t !== 'function') return null;
    var map = OSGI18n.t('voice.pauliAbbrev', { returnObjects: true });
    if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
    return map;
  }

  function pauliExpand(text) {
    var full = String(text || '').trim();
    if (!full) return full;

    var map = pauliAbbrevMap();
    if (!map) return full;

    var keys = Object.keys(map).sort(function (a, b) {
      return b.length - a.length;
    });

    var out = full;
    keys.forEach(function (key) {
      var spoken = String(map[key] || '').trim();
      if (!spoken) return;
      out = out.replace(new RegExp(escapeRegex(key), 'g'), spoken);
    });
    return out;
  }

  window.OSGTtsSpeechPrep = {
    pauliExpand: pauliExpand
  };
})();
