(function () {
  'use strict';

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

  function hardReload(release) {
    var onceKey = 'osg-release-reload-' + release.buildId;
    try {
      if (sessionStorage.getItem(onceKey) === '1') {
        return false;
      }
      sessionStorage.setItem(onceKey, '1');
    } catch (e) { /* ignore */ }
    try {
      localStorage.setItem(STORAGE_KEY, release.buildId);
    } catch (e2) { /* ignore */ }
    window.location.reload();
    return true;
  }

  fetchRelease().then(function (release) {
    if (!release || !release.buildId) {
      return;
    }

    window.OSG_RELEASE = release;
    if (!pageBuild) {
      window.OSG_BUILD_ID = release.buildId;
    }

    var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isLocal && pageBuild && release.buildId !== pageBuild) {
      hardReload(release);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, release.buildId);
    } catch (e) { /* ignore */ }
  });

  function mountSiteMark() {
    if (document.getElementById('osg-site-mark')) return;
    if (document.body && document.body.getAttribute('data-page') === 'home' &&
        document.getElementById('portal-overlay')) {
      return;
    }

    var path = location.pathname;
    var inSubfolder = path.indexOf('/omniqr-ai-for-tourist-of-thailand/') >= 0 ||
      path.indexOf('/ops/') >= 0;
    var homeHref = inSubfolder ? '../index.html' : '/index.html';
    var imgSrc = (inSubfolder ? '../assets/images/omni-infinity-mark.png' : '/assets/images/omni-infinity-mark.png');
    if (window.OSG_BUILD_ID) {
      imgSrc += '?v=' + encodeURIComponent(window.OSG_BUILD_ID);
    }

    var link = document.createElement('a');
    link.id = 'osg-site-mark';
    link.className = 'osg-site-mark';
    link.href = homeHref;
    link.setAttribute('data-i18n-aria', 'a11y.siteMarkHome');

    var img = document.createElement('img');
    img.className = 'osg-site-mark__img';
    img.src = imgSrc;
    img.alt = '';
    img.width = 72;
    img.height = 72;
    img.decoding = 'async';
    img.loading = 'lazy';
    link.appendChild(img);
    document.body.appendChild(link);

    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom();
    }
  }

  function bootSiteMark() {
    if (document.body) mountSiteMark();
    else document.addEventListener('DOMContentLoaded', mountSiteMark);
    document.addEventListener('osg:i18nReady', function () {
      if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
        OSGI18n.applyToDom();
      }
    });
  }

  bootSiteMark();
})();
