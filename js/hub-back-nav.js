(function () {
  'use strict';

  var TRILINGUAL = ['de', 'en', 'th'];

  function homeHref() {
    var scripts = document.querySelectorAll('script[src*="app.js"], script[src*="hub-back-nav.js"]');
    var src = scripts.length ? scripts[scripts.length - 1].getAttribute('src') : 'js/app.js';
    var base = src.replace(/js\/(?:app|hub-back-nav)\.js.*$/, '');
    return base + 'index.html';
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = homeHref();
  }

  function mountBackButton() {
    if (document.getElementById('hub-back-btn')) return;
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'hub-back-btn';
    btn.className = 'hub-back-btn';
    btn.setAttribute('data-i18n', 'nav.back');
    btn.setAttribute('data-i18n-aria', 'a11y.navBack');
    btn.addEventListener('click', goBack);
    document.body.appendChild(btn);

    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(btn);
    }
  }

  window.OSGHubBackNav = { init: mountBackButton, goBack: goBack };
})();
