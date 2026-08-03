(function () {
  'use strict';
  /**
   * Static Site (no sleep) serves HTML; Node API may live on another host.
   * Override via <meta name="osg-api-origin" content="https://api.…"> if needed.
   */
  var meta = document.querySelector('meta[name="osg-api-origin"]');
  var fromMeta = meta && meta.getAttribute('content');
  var DEFAULT_API = 'https://api.omnisolutionsglobal.com';
  var origin = String(fromMeta || DEFAULT_API || '').trim().replace(/\/$/, '');
  window.OSG_API_ORIGIN = origin;

  window.osgApiUrl = function (path) {
    var p = String(path || '');
    if (!p) return origin || '';
    if (/^https?:\/\//i.test(p)) return p;
    if (p.charAt(0) !== '/') p = '/' + p;
    return (origin || '') + p;
  };
})();
