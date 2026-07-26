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
    /** Paul: ≥5 s portal (audio/loop time), then curtains open onto Home. */
    var AUTO_OPEN_MS = 5500;
    var autoTimer = null;

    function dismissPortal() {
      if (portal.classList.contains('portal-opening') || portal.classList.contains('portal-hidden')) {
        return;
      }
      if (autoTimer) {
        clearTimeout(autoTimer);
        autoTimer = null;
      }
      portal.classList.add('portal-opening');
      portal.setAttribute('aria-hidden', 'true');
      // Curtain slide (~1.1s) then fade/hide.
      setTimeout(function () {
        portal.classList.add('portal-reveal');
        setTimeout(function () {
          portal.classList.add('portal-hidden');
          portal.classList.remove('portal-reveal', 'portal-opening');
        }, 420);
      }, 1100);
    }

    portal.classList.remove('portal-hidden', 'portal-reveal', 'portal-opening');
    portal.setAttribute('aria-hidden', 'false');

    if (btn) btn.addEventListener('click', dismissPortal);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dismissPortal();
      return;
    }
    autoTimer = setTimeout(dismissPortal, AUTO_OPEN_MS);
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
    if (document.body.classList.contains('app-page--desc') && window.OSGAppDescPage) {
      OSGAppDescPage.boot();
      if (window.i18next) {
        i18next.on('languageChanged', function () {
          OSGAppDescPage.mountStoreBadges();
        });
      }
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
    if (window.osgAffiliateCheckOnce) {
      window.osgAffiliateCheckOnce();
    }
    initPortalBranding();
    initChameleonVideoBg();
    OSGI18n.init().then(function () {
      initSidebar();
      initPortal();
      initModules();
      initVoiceLangMaintenance();
      document.dispatchEvent(new CustomEvent('osg:i18nReady'));
    }).catch(function (err) {
      console.error('i18n init failed', err);
      initSidebar();
      initPortal();
      initModules();
      initVoiceLangMaintenance();
      document.dispatchEvent(new CustomEvent('osg:i18nReady'));
    });
  }

  function initVoiceLangMaintenance() {
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;

    function bootMaintenance() {
      if (window.OSGVoiceLangMaintenance) {
        OSGVoiceLangMaintenance.init();
      }
    }

    function loadScript(name, cb) {
      if (name === 'osg-brand-tts.js' && window.OSGBrandTts) {
        cb();
        return;
      }
      if (name === 'voice-lang-maintenance.js' && window.OSGVoiceLangMaintenance) {
        cb();
        return;
      }
      if (name === 'hub-back-nav.js' && window.OSGHubBackNav) {
        cb();
        return;
      }
      var scripts = document.querySelectorAll('script[src*="app.js"]');
      var src = scripts.length ? scripts[scripts.length - 1].getAttribute('src') : 'js/app.js';
      var base = src.replace(/js\/app\.js.*$/, '');
      var tag = document.createElement('script');
      tag.src = base + 'js/' + name + '?v=' +
        encodeURIComponent(window.OSG_BUILD_ID || '2026.06.15.48');
      tag.onload = cb;
      document.body.appendChild(tag);
    }

    loadScript('osg-brand-tts.js', function () {
      loadScript('hub-back-nav.js', function () {
        loadScript('voice-lang-maintenance.js', bootMaintenance);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
