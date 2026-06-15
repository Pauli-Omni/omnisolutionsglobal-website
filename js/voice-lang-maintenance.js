(function () {
  'use strict';

  var TRILINGUAL = ['de', 'en', 'th'];

  var SPEAKER_SVG =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
      '<path d="M11 5 6 9H3v6h3l5 4V5z"/>' +
      '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
      '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
    '</svg>';

  var SPEAKER_SELECTOR =
    '#voice-btn, .voice-btn:not(.trilingual-ui-picker__btn), [data-osg-speaker-trigger]';

  var modal;
  var lastFocus;

  function assetBase() {
    var scripts = document.querySelectorAll('script[src*="app.js"], script[src*="voice-lang-maintenance.js"]');
    var src = scripts.length ? scripts[scripts.length - 1].getAttribute('src') : 'js/app.js';
    return src.replace(/js\/(?:app|voice-lang-maintenance)\.js.*$/, '');
  }

  function loadStylesheet(href) {
    var id = 'osg-css-' + href.replace(/[^a-z0-9]/gi, '');
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = assetBase() + href + '?v=' + encodeURIComponent(window.OSG_BUILD_ID || '2026.06.15.48');
    document.head.appendChild(link);
  }

  function trilingualBase(lng) {
    var base = String(lng || 'de').split('-')[0].toLowerCase();
    return TRILINGUAL.indexOf(base) >= 0 ? base : 'en';
  }

  function ensureModal() {
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'osg-voice-lang-maintenance';
    modal.className = 'osg-maint-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'osg-maint-modal-title');
    modal.innerHTML =
      '<div class="osg-maint-modal__backdrop" data-osg-maint-close></div>' +
      '<div class="osg-maint-modal__panel neo-accent-box">' +
        '<button type="button" class="osg-maint-modal__close" data-osg-maint-close data-i18n-aria="maintenance.voiceLangCloseAria">&times;</button>' +
        '<h2 id="osg-maint-modal-title" class="osg-maint-modal__title chrome-silver-text" data-i18n="maintenance.voiceLangTitle"></h2>' +
        '<p class="osg-maint-modal__body osg-maint-modal__body--speaker chrome-silver-text" id="osg-maint-speaker-notice"></p>' +
        '<button type="button" class="btn btn-neon osg-maint-modal__ok" data-osg-maint-close data-i18n="maintenance.voiceLangClose"></button>' +
      '</div>';
    document.body.appendChild(modal);

    modal.querySelectorAll('[data-osg-maint-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });

    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    return modal;
  }

  function refreshModalCopy() {
    ensureModal();
    var notice = modal.querySelector('#osg-maint-speaker-notice');
    if (notice && window.i18next) {
      notice.textContent = i18next.t('maintenance.speakerNotice');
    }
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(modal);
    }
  }

  function openSpeakerMaintenance() {
    ensureModal();
    refreshModalCopy();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('osg-maint-modal-open');
    var ok = modal.querySelector('.osg-maint-modal__ok');
    if (ok) ok.focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('osg-maint-modal-open');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  function interceptSpeakerClick(e) {
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;
    var trigger = e.target.closest(SPEAKER_SELECTOR);
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openSpeakerMaintenance();
  }

  function pickUiLocale(locale) {
    if (!window.i18next || !window.OSGI18nConfig) return;
    if (TRILINGUAL.indexOf(locale) < 0) return;
    try {
      localStorage.setItem(OSGI18nConfig.STORAGE_KEY, locale);
    } catch (err) { /* ignore */ }
    i18next.changeLanguage(locale);
    updateTrilingualPickerState();
    document.documentElement.classList.add('osg-trilingual-stable');
  }

  function updateTrilingualPickerState() {
    var lng = window.i18next ? trilingualBase(i18next.language) : 'de';
    document.querySelectorAll('.trilingual-ui-picker__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-ui-locale') === lng;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function buildToolbar() {
    var wrap = document.createElement('div');
    wrap.className = 'hub-voice-lang-tools page-header-tools';
    wrap.innerHTML =
      '<div id="app-voice-slot" class="app-voice-slot">' +
        '<div class="app-voice-toolbar">' +
          '<button type="button" id="voice-btn" class="voice-btn voice-btn--deactivated" ' +
            'data-osg-speaker-trigger data-i18n-aria="voice.ariaDeactivated" aria-pressed="false">' +
            SPEAKER_SVG +
          '</button>' +
          '<div class="trilingual-ui-picker" role="group" data-i18n-aria="a11y.trilingualUiPicker">' +
            '<button type="button" class="trilingual-ui-picker__btn" data-ui-locale="de" aria-pressed="false">DE</button>' +
            '<button type="button" class="trilingual-ui-picker__btn" data-ui-locale="en" aria-pressed="false">EN</button>' +
            '<button type="button" class="trilingual-ui-picker__btn" data-ui-locale="th" aria-pressed="false">TH</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    return wrap;
  }

  function wireToolbar(toolbar) {
    toolbar.querySelectorAll('.trilingual-ui-picker__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        pickUiLocale(btn.getAttribute('data-ui-locale'));
      });
    });
    updateTrilingualPickerState();
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(toolbar);
    }
  }

  function mountToolbar(host, position) {
    if (!host || host.querySelector('.hub-voice-lang-tools')) return;
    var toolbar = buildToolbar();
    if (position === 'prepend') {
      host.insertBefore(toolbar, host.firstChild);
    } else {
      host.appendChild(toolbar);
    }
    wireToolbar(toolbar);
  }

  function mountToolbars() {
    document.querySelectorAll('.page-header-row').forEach(function (row) {
      mountToolbar(row, 'append');
    });

    var homeCore = document.querySelector('body[data-page="home"] .home-splash-core');
    if (homeCore) {
      var anchor = homeCore.querySelector('.home-enterprise-band');
      if (anchor && anchor.nextElementSibling) {
        var tools = buildToolbar();
        homeCore.insertBefore(tools, anchor.nextElementSibling);
        wireToolbar(tools);
      } else {
        mountToolbar(homeCore, 'append');
      }
    }

    document.querySelectorAll('.app-front, .app-desc').forEach(function (section) {
      mountToolbar(section, 'prepend');
    });
  }

  function init() {
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;

    document.documentElement.classList.add('osg-trilingual-stable');
    loadStylesheet('css/voice-lang-maintenance.css');
    loadStylesheet('css/trilingual-visual.css');

    ensureModal();
    mountToolbars();
    document.addEventListener('click', interceptSpeakerClick, true);

    if (window.i18next) {
      var current = String(i18next.language || 'de').split('-')[0].toLowerCase();
      if (TRILINGUAL.indexOf(current) < 0) {
        pickUiLocale('en');
      } else {
        updateTrilingualPickerState();
      }
      i18next.on('languageChanged', function () {
        updateTrilingualPickerState();
        if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
          OSGI18n.applyToDom(document);
        }
      });
    }

    if (window.OSGHubBackNav) {
      OSGHubBackNav.init();
    }
  }

  window.OSGVoiceLangMaintenance = {
    init: init,
    openSpeakerMaintenance: openSpeakerMaintenance,
    close: closeModal
  };
})();
