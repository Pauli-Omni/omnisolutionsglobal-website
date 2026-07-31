(function () {
  'use strict';

  var MARKET_META = {
    de: { labelKey: 'pauliGlobal.countryDe', fallback: 'Deutschland', native: 'Deutschland', langAttr: 'de' },
    us: { labelKey: 'pauliGlobal.countryUs', fallback: 'United States', native: 'United States', langAttr: 'en' },
    nl: { labelKey: 'pauliGlobal.countryNl', fallback: 'Nederland', native: 'Nederland', langAttr: 'nl' },
    uk: { labelKey: 'pauliGlobal.countryUk', fallback: 'United Kingdom', native: 'United Kingdom', langAttr: 'en-GB' },
    vn: { labelKey: 'pauliGlobal.countryVn', fallback: 'Vietnam', native: 'Việt Nam', langAttr: 'vi', code: 'VN' }
  };

  function qs(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (e) {
      return '';
    }
  }

  function t(key, fallback) {
    if (window.OSGI18n && typeof OSGI18n.t === 'function') {
      var v = OSGI18n.t(key);
      if (v && v !== key) return v;
    }
    return fallback || key;
  }

  function applyMarket() {
    if (!document.body || document.body.getAttribute('data-page') !== 'pauli-market') return;
    var market = String(qs('market') || '').toLowerCase();
    if (!MARKET_META[market]) market = 'de';
    var meta = MARKET_META[market];
    document.body.setAttribute('data-market', market);

    var title = document.getElementById('pbg-market-title');
    var label = t(meta.labelKey, meta.fallback);
    if (title) {
      title.textContent = 'Pauli BestPrice Global® — ' + (meta.native || label);
      title.setAttribute('lang', meta.langAttr);
    }

    var img = document.getElementById('app-front-icon-img');
    var ph = document.getElementById('app-front-icon-placeholder');
    var codeEl = document.getElementById('app-front-icon-code');
    var app = window.OSGAppRegistry && OSGAppRegistry.getById('pauliBestprice');
    var iconPath = app && app.marketIcons ? app.marketIcons[market] : '';
    var bust = window.OSG_BUILD_ID || '2026.08.01.04';

    if (iconPath && img) {
      img.onload = function () {
        img.hidden = false;
        if (ph) ph.hidden = true;
        if (codeEl) codeEl.hidden = true;
      };
      img.onerror = function () {
        img.hidden = true;
        if (ph) ph.hidden = false;
        if (codeEl && meta.code) {
          codeEl.textContent = meta.code;
          codeEl.hidden = false;
        }
      };
      img.src = iconPath + (iconPath.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(bust);
      img.alt = label;
    } else if (codeEl && meta.code) {
      if (img) img.hidden = true;
      if (ph) ph.hidden = true;
      codeEl.textContent = meta.code;
      codeEl.hidden = false;
    }

    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom();
    }
  }

  function boot() {
    applyMarket();
    if (window.i18next && !i18next._osgMarketSoonBound) {
      i18next._osgMarketSoonBound = true;
      i18next.on('languageChanged', applyMarket);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('osg:i18nReady', applyMarket);
})();
