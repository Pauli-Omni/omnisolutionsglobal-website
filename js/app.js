(function () {
  'use strict';

  function initSidebar() {
    var toggle = document.getElementById('sidebar-toggle');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (!toggle || !sidebar || !overlay) return;

    function closeSidebar() {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = sidebar.classList.toggle('is-open');
      overlay.classList.toggle('is-visible', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    overlay.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeSidebar);
    });
  }

  function initPortal() {
    var portal = document.getElementById('portal-overlay');
    if (!portal) return;

    var btn = document.getElementById('portal-enter-btn');

    function dismissPortal() {
      portal.classList.add('portal-reveal');
      portal.setAttribute('aria-hidden', 'true');
      setTimeout(function () {
        portal.classList.add('portal-hidden');
        portal.classList.remove('portal-reveal');
      }, 420);
    }

    portal.classList.remove('portal-hidden', 'portal-reveal');
    portal.setAttribute('aria-hidden', 'false');

    if (btn) btn.addEventListener('click', dismissPortal);
  }

  function initModules() {
    if (document.getElementById('hub-sidebar-list') && window.OSGHubSidebar) {
      OSGHubSidebar.init();
      if (window.i18next) i18next.on('languageChanged', OSGHubSidebar.init);
    }
    if (document.getElementById('product-qr-img') && window.OSGProductPage) {
      OSGProductPage.init();
    }
    if (window.OSGPresentation) {
      OSGPresentation.init();
    }
    if (window.OSGHome) {
      OSGHome.initAnimatedLogo();
    }
    if (window.OSGPortfolio && (document.getElementById('portfolio-list') || document.getElementById('apps-portfolio-grid'))) {
      OSGPortfolio.init();
      if (window.i18next) {
        i18next.on('languageChanged', OSGPortfolio.init);
      }
    }
    if (window.OSGHome) {
      OSGHome.init();
    }
    if (window.OSGHomeStarfield) {
      OSGHomeStarfield.init();
    }
    if (document.body.classList.contains('app-page--front') && window.OSGAppFrontPage) {
      OSGAppFrontPage.boot();
    }
    if (document.body.getAttribute('data-page') === 'impressum' && window.OSGContactForm) {
      OSGContactForm.init();
    }
    if (document.getElementById('ui-lang-picker-mount') && window.OSGUiLangPicker) {
      OSGUiLangPicker.mount('#ui-lang-picker-mount');
    }
    if (document.body.classList.contains('app-page--desc') && window.OSGAppDescPage) {
      OSGAppDescPage.boot();
      if (window.i18next) {
        i18next.on('languageChanged', function () {
          OSGAppDescPage.mountStoreBadges();
        });
      }
    }
    if (document.getElementById('app-voice-slot') && window.OSGVoiceMount) {
      OSGVoiceMount.mount();
    }
  }

  function initChameleonVideoBg() {
    var container = document.querySelector('.chameleon-bg');
    if (!container || container.querySelector('.chameleon-bg__video')) return;

    var videoSrc = '/assets/video/chameleon-bg.mp4';
    fetch(videoSrc, { method: 'HEAD' })
      .then(function (res) {
        if (!res.ok) return;
        var video = document.createElement('video');
        video.className = 'chameleon-bg__video';
        video.src = videoSrc;
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('aria-hidden', 'true');
        video.preload = 'metadata';
        container.insertBefore(video, container.firstChild);
      })
      .catch(function () { /* CSS-only fallback */ });
  }

  function initPortalBranding() {
    if (window.OSGHome && document.querySelector('.osg-logo-mount--portal')) {
      OSGHome.initPortalFallbackLogo();
    }
    if (window.OSGPortalVideo) {
      OSGPortalVideo.init();
    }
  }

  function boot() {
    initPortalBranding();
    initChameleonVideoBg();
    OSGI18n.init().then(function () {
      initSidebar();
      initPortal();
      initModules();
      document.dispatchEvent(new CustomEvent('osg:i18nReady'));
    }).catch(function (err) {
      console.error('i18n init failed', err);
      initSidebar();
      initPortal();
      initModules();
      document.dispatchEvent(new CustomEvent('osg:i18nReady'));
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
