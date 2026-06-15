(function () {
  'use strict';

  function mountStoreBadges() {
    var appId = document.body.getAttribute('data-app-id');
    var app = window.OSGAppRegistry ? OSGAppRegistry.getById(appId) : null;
    var article = document.querySelector('.app-desc');
    if (!article || !app || !window.OSGStoreBadges) return;

    var section = document.getElementById('app-desc-stores');
    if (!section) {
      section = document.createElement('div');
      section.id = 'app-desc-stores';
      section.className = 'app-desc-stores';
      section.setAttribute('data-i18n-aria', 'product.storesAria');
      var backBtn = article.querySelector('.app-desc-back');
      if (backBtn) article.insertBefore(section, backBtn);
      else article.appendChild(section);
    }

    OSGStoreBadges.renderInto(section, app);
    if (window.OSGI18n) OSGI18n.applyToDom();
  }

  function boot() {
    if (!document.body.classList.contains('app-page--desc')) return;
    mountStoreBadges();
  }

  window.OSGAppDescPage = { boot: boot, mountStoreBadges: mountStoreBadges };
})();
