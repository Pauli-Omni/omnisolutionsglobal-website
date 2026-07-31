(function () {
  'use strict';

  /* Rubber root font-size ASAP (before paint of rem-based chrome) */
  (function bootRubber() {
    var REF_W = 1280;
    var REF_H = 800;
    var MIN_S = 0.85;
    var MAX_S = 1.0;
    function apply() {
      var w = window.innerWidth || REF_W;
      var h = window.innerHeight || REF_H;
      var s = Math.min(w / REF_W, h / REF_H);
      if (s < MIN_S) s = MIN_S;
      if (s > MAX_S) s = MAX_S;
      document.documentElement.style.setProperty('--osg-rubber', String(s));
      document.documentElement.style.fontSize = (16 * s) + 'px';
    }
    apply();
    window.addEventListener('resize', apply, { passive: true });
    window.addEventListener('orientationchange', function () { setTimeout(apply, 120); });
  })();

  var STORAGE_KEY = 'osg-build-id';
  var meta = document.querySelector('meta[name="osg-build-id"]');
  var pageBuild = meta && meta.getAttribute('content');

  if (pageBuild) {
    window.OSG_BUILD_ID = pageBuild;
  }

  function fetchRelease() {
    return fetch('/api/release.json', { cache: 'no-store', credentials: 'same-origin' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; });
  }

  fetchRelease().then(function (release) {
    if (!release || !release.buildId) {
      return;
    }

    window.OSG_RELEASE = release;
    if (!pageBuild) {
      window.OSG_BUILD_ID = release.buildId;
    }

    try {
      localStorage.setItem(STORAGE_KEY, release.buildId);
    } catch (e) { /* ignore */ }
  });

  /**
   * Old ∞ site-mark logo removed site-wide (product request 2026-07-30).
   * Home navigation remains via sidebar / in-page links.
   */
  function removeLegacySiteMark() {
    var legacy = document.getElementById('osg-site-mark');
    if (legacy && legacy.parentNode) {
      legacy.parentNode.removeChild(legacy);
    }
  }

  /** Location + © on outer silver ledge corners (never scrolls with content). */
  function mountChromeFixedMeta() {
    if (document.getElementById('osg-chrome-fixed-meta')) return;
    if (!document.body) return;

    var el = document.createElement('div');
    el.id = 'osg-chrome-fixed-meta';
    el.className = 'chrome-fixed-meta';
    el.setAttribute('aria-hidden', 'false');

    var loc = document.createElement('span');
    loc.className = 'chrome-fixed-meta__loc';
    loc.setAttribute('data-i18n-location', '');

    var copy = document.createElement('span');
    copy.className = 'chrome-fixed-meta__copy';
    copy.setAttribute('data-i18n', 'common.footerCopy');

    el.appendChild(loc);
    el.appendChild(copy);
    document.body.appendChild(el);

    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom();
    }
  }

  function bootChromeChrome() {
    function run() {
      removeLegacySiteMark();
      mountChromeFixedMeta();
    }
    if (document.body) run();
    else document.addEventListener('DOMContentLoaded', run);
    document.addEventListener('osg:i18nReady', function () {
      removeLegacySiteMark();
      mountChromeFixedMeta();
      if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
        OSGI18n.applyToDom();
      }
    });
  }

  bootChromeChrome();
})();
