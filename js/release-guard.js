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
    window.OSG_BUILD_ID = release.buildId;

    if (pageBuild && release.buildId !== pageBuild) {
      hardReload(release);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, release.buildId);
    } catch (e) { /* ignore */ }
  });
})();
