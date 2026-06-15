(function () {
  'use strict';

  var OMNIQR_ICON = '/assets/icons/apps/omniqr-ai-pay.png';

  function t(key) {
    return window.OSGI18n ? OSGI18n.t(key) : key;
  }

  function resolveDescHref(descFile) {
    if (!descFile) return '#';
    var normalized = String(descFile).replace(/^\//, '');
    var parts = normalized.split('/');
    var fileName = parts[parts.length - 1];
    if (parts.length > 1) {
      var folderPath = '/' + parts.slice(0, -1).join('/');
      var here = window.location.pathname.replace(/\/[^/]*$/, '') || '/';
      if (here === folderPath || here.endsWith(folderPath)) {
        return fileName;
      }
    }
    if (descFile.charAt(0) === '/') return descFile;
    return window.OSGI18nConfig ? OSGI18nConfig.assetUrl(descFile) : descFile;
  }

  function initIcon(app) {
    var img = document.getElementById('app-front-icon-img');
    var placeholder = document.getElementById('app-front-icon-placeholder');
    if (!img || !placeholder || !app || !app.icon) return;

    img.alt = t('portfolio.' + app.id + '.name');
    img.onload = function () {
      img.hidden = false;
      placeholder.hidden = true;
    };
    img.onerror = function () {
      img.hidden = true;
      placeholder.hidden = false;
    };
    if (app.id === 'omniqrAiPay') {
      img.src = OMNIQR_ICON;
      return;
    }
    img.src = window.OSGI18nConfig ? OSGI18nConfig.assetUrl(app.icon) : app.icon;
  }

  function initWerbetext(app) {
    var block = document.getElementById('app-front-werbetext');
    if (!block || !app) return;

    block.setAttribute('data-i18n', app.pageKey + '.frontWerbetext');
    block.setAttribute('data-i18n-html', '');
    if (window.OSGI18n) OSGI18n.applyToDom();
  }

  function initCta(app) {
    var cta = document.getElementById('app-front-cta');
    if (!cta || !app || !app.descFile) return;
    cta.href = resolveDescHref(app.descFile);
  }

  function init() {
    if (!document.body.classList.contains('app-page--front')) return;
    var appId = document.body.getAttribute('data-app-id');
    var app = OSGAppRegistry.getById(appId);
    if (!app) return;
    initIcon(app);
    initWerbetext(app);
    initCta(app);
  }

  function bindLangRefresh() {
    if (!window.i18next || i18next._osgFrontBound) return;
    i18next._osgFrontBound = true;
    i18next.on('languageChanged', function () {
      initWerbetext(OSGAppRegistry.getById(document.body.getAttribute('data-app-id')));
    });
  }

  function boot() {
    init();
    bindLangRefresh();
  }

  window.OSGAppFrontPage = { init: init, boot: boot };
})();
