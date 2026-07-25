(function () {
  'use strict';

  var ICON_BACK =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
      '<path d="M11 7 5 12l6 5"/><path d="M19 7v10"/><path d="M5 12h10"/>' +
      '<text x="14.2" y="16.2" font-size="6.5" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">10</text>' +
    '</svg>';
  var ICON_FWD =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
      '<path d="M13 7 19 12l-6 5"/><path d="M5 7v10"/><path d="M9 12h10"/>' +
      '<text x="3.2" y="16.2" font-size="6.5" fill="currentColor" stroke="none" font-family="system-ui,sans-serif">10</text>' +
    '</svg>';
  var ICON_PLAY =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z"/></svg>';
  var ICON_STOP =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>';

  var SPEAKER_SVG =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
      '<path d="M11 5 6 9H3v6h3l5 4V5z"/>' +
      '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
      '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
    '</svg>';

  var toolbarUid = 0;

  function assetBase() {
    var scripts = document.querySelectorAll('script[src*="app.js"], script[src*="voice-lang-maintenance.js"]');
    var src = scripts.length ? scripts[scripts.length - 1].getAttribute('src') : 'js/app.js';
    return src.replace(/js\/(?:app|voice-lang-maintenance)\.js.*$/, '');
  }

  function loadStylesheet(href) {
    var id = 'osg-css-' + href.replace(/[^a-z0-9]+/gi, '');
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = assetBase() + href + '?v=' + encodeURIComponent(window.OSG_BUILD_ID || '2026.07.25.03');
    document.head.appendChild(link);
  }

  function t(key) {
    if (window.OSGI18n && typeof OSGI18n.t === 'function') return OSGI18n.t(key);
    if (window.i18next) return i18next.t(key);
    return '';
  }

  function pickerLocales() {
    return window.OSGI18nConfig ? OSGI18nConfig.UI_PICKER_LOCALES : ['th', 'en', 'ru', 'de', 'pl', 'zh'];
  }

  function pickerBase(lng) {
    return window.OSGI18nConfig ? OSGI18nConfig.uiPickerBase(lng) : 'en';
  }

  function ttsState() {
    if (window.OSGBrandTts && typeof OSGBrandTts.getState === 'function') {
      return OSGBrandTts.getState();
    }
    return { playing: false, paused: false };
  }

  function updateTransportUi() {
    var st = ttsState();
    var playing = !!st.playing;
    var paused = !!st.paused;
    document.querySelectorAll('[data-osg-tts-playpause]').forEach(function (btn) {
      btn.classList.toggle('is-playing', playing);
      btn.classList.toggle('is-paused', paused && !playing);
      btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      btn.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      var ariaKey = playing ? 'voice.transportPauseAria' : (paused ? 'voice.transportResumeAria' : 'voice.transportPlayAria');
      btn.setAttribute('aria-label', t(ariaKey) || ariaKey);
      btn.setAttribute('data-i18n-aria', ariaKey);
    });
    document.querySelectorAll('.osg-tts-transport').forEach(function (bar) {
      bar.classList.toggle('is-active', playing || paused);
    });
  }

  function showSpeakError() {
    var msg = t('voice.ttsError') || t('voice.brandVoiceRetry');
    if (msg && typeof window.alert === 'function') window.alert(msg);
  }

  function handleTransportClick(e) {
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;
    var btn = e.target.closest('[data-osg-tts-action]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (!window.OSGBrandTts) {
      showSpeakError();
      return;
    }
    var action = btn.getAttribute('data-osg-tts-action');
    if (action === 'back') {
      OSGBrandTts.seekBack();
      updateTransportUi();
      return;
    }
    if (action === 'forward') {
      OSGBrandTts.seekForward();
      updateTransportUi();
      return;
    }
    if (action === 'stop') {
      OSGBrandTts.stop();
      updateTransportUi();
      return;
    }
    if (action === 'playpause') {
      OSGBrandTts.togglePlayPause().then(function () {
        updateTransportUi();
      }).catch(function () {
        OSGBrandTts.stop();
        updateTransportUi();
        showSpeakError();
      });
    }
  }

  function setPanelOpen(toolbar, open) {
    if (!toolbar) return;
    var panel = toolbar.querySelector('.hub-lang-picker');
    var toggle = toolbar.querySelector('.hub-lang-toggle');
    if (!panel || !toggle) return;
    panel.classList.toggle('is-open', open);
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function anyPanelOpen() {
    return !!document.querySelector('.hub-lang-picker.is-open');
  }

  function closeAllPanels() {
    document.querySelectorAll('.hub-voice-lang-tools').forEach(function (toolbar) {
      setPanelOpen(toolbar, false);
    });
  }

  function pickUiLocale(locale, toolbar) {
    if (!window.i18next || !window.OSGI18nConfig) return;
    if (!OSGI18nConfig.isUiPickerLocale(locale)) return;
    if (window.OSGBrandTts && OSGBrandTts.stop) OSGBrandTts.stop();
    try {
      localStorage.setItem(OSGI18nConfig.STORAGE_KEY, locale);
      localStorage.setItem('osg-lang-user-picked', '1');
    } catch (err) { /* ignore */ }
    i18next.changeLanguage(locale);
    updatePickerState();
    updateTransportUi();
    document.documentElement.classList.add('osg-hub-lang-stable');
    if (toolbar) setPanelOpen(toolbar, false);
  }

  function updatePickerState() {
    var lng = window.i18next ? pickerBase(i18next.language) : 'de';
    document.querySelectorAll('.hub-lang-picker__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-ui-locale') === lng;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function buildLangToolbar() {
    toolbarUid += 1;
    var uid = 'hub-lang-' + toolbarUid;
    var panelId = uid + '-panel';
    var buttons = pickerLocales().map(function (locale) {
      return '<button type="button" class="hub-lang-picker__btn trilingual-ui-picker__btn" data-ui-locale="' +
        locale + '" data-i18n="langPicker.' + locale + '" aria-pressed="false"></button>';
    }).join('');
    var wrap = document.createElement('div');
    wrap.className = 'hub-voice-lang-tools page-header-tools';
    wrap.innerHTML =
      '<div class="app-voice-slot">' +
        '<div class="app-voice-toolbar hub-lang-toolbar">' +
          '<span class="voice-btn voice-btn--marker" aria-hidden="true">' + SPEAKER_SVG + '</span>' +
          '<button type="button" class="hub-lang-toggle" aria-expanded="false" aria-controls="' + panelId + '" ' +
            'data-i18n="langPicker.toggle" data-i18n-aria="langPicker.toggleAria"></button>' +
          '<div id="' + panelId + '" class="hub-lang-picker trilingual-ui-picker" role="group" hidden ' +
            'data-i18n-aria="a11y.trilingualUiPicker">' +
            buttons +
          '</div>' +
        '</div>' +
      '</div>';
    return wrap;
  }

  function buildTransportBar() {
    var bar = document.createElement('div');
    bar.className = 'osg-tts-transport';
    bar.setAttribute('role', 'group');
    bar.setAttribute('data-i18n-aria', 'voice.transportBarAria');
    bar.innerHTML =
      '<button type="button" class="osg-tts-transport__btn" data-osg-tts-action="back" data-i18n-aria="voice.transportBackAria">' +
        ICON_BACK +
      '</button>' +
      '<button type="button" class="osg-tts-transport__btn osg-tts-transport__btn--main" data-osg-tts-action="playpause" data-osg-tts-playpause data-i18n-aria="voice.transportPlayAria">' +
        ICON_PLAY +
      '</button>' +
      '<button type="button" class="osg-tts-transport__btn" data-osg-tts-action="stop" data-i18n-aria="voice.transportStopAria">' +
        ICON_STOP +
      '</button>' +
      '<button type="button" class="osg-tts-transport__btn" data-osg-tts-action="forward" data-i18n-aria="voice.transportForwardAria">' +
        ICON_FWD +
      '</button>';
    return bar;
  }

  function wireLangToolbar(toolbar) {
    var toggle = toolbar.querySelector('.hub-lang-toggle');
    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var panel = toolbar.querySelector('.hub-lang-picker');
        var willOpen = !(panel && panel.classList.contains('is-open'));
        closeAllPanels();
        if (willOpen) setPanelOpen(toolbar, true);
      });
    }
    toolbar.querySelectorAll('.hub-lang-picker__btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        pickUiLocale(btn.getAttribute('data-ui-locale'), toolbar);
      });
    });
    updatePickerState();
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(toolbar);
    }
  }

  function mountLangToolbar(host, position) {
    if (!host || host.querySelector('.hub-voice-lang-tools')) return;
    var toolbar = buildLangToolbar();
    if (position === 'prepend') host.insertBefore(toolbar, host.firstChild);
    else host.appendChild(toolbar);
    wireLangToolbar(toolbar);
  }

  function mountLangToolbars() {
    document.querySelectorAll('.page-header-row').forEach(function (row) {
      mountLangToolbar(row, 'append');
    });

    var homeCore = document.querySelector('body[data-page="home"] .home-splash-core');
    if (homeCore && !homeCore.querySelector('.hub-voice-lang-tools')) {
      var anchor = homeCore.querySelector('.home-enterprise-band');
      if (anchor && anchor.nextElementSibling) {
        var tools = buildLangToolbar();
        homeCore.insertBefore(tools, anchor.nextElementSibling);
        wireLangToolbar(tools);
      } else {
        mountLangToolbar(homeCore, 'append');
      }
    }

    document.querySelectorAll('.app-front, .app-desc, .legal-page, .content-wrapper').forEach(function (section) {
      mountLangToolbar(section, 'prepend');
    });
  }

  function mountTransportBar() {
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;
    if (document.getElementById('osg-tts-transport-root')) return;
    var root = document.createElement('div');
    root.id = 'osg-tts-transport-root';
    root.className = 'osg-tts-transport-root';
    var bar = buildTransportBar();
    root.appendChild(bar);
    document.body.appendChild(root);
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(root);
    }
    updateTransportUi();
  }

  function onDocumentClick(e) {
    if (!anyPanelOpen()) return;
    if (e.target.closest('.hub-lang-toolbar')) return;
    closeAllPanels();
  }

  function init() {
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;

    document.documentElement.classList.add('osg-hub-lang-stable');
    loadStylesheet('css/voice-lang-maintenance.css');
    loadStylesheet('css/trilingual-visual.css');

    mountLangToolbars();
    mountTransportBar();
    document.addEventListener('click', handleTransportClick, true);
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('osg:ttsEnded', updateTransportUi);
    document.addEventListener('osg:ttsPlaying', updateTransportUi);
    document.addEventListener('osg:ttsState', updateTransportUi);

    if (window.i18next) {
      updatePickerState();
      updateTransportUi();
      i18next.on('languageChanged', function () {
        if (window.OSGBrandTts && OSGBrandTts.stop) OSGBrandTts.stop();
        updatePickerState();
        updateTransportUi();
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
    updateSpeakerButtons: updateTransportUi,
    updateTransportUi: updateTransportUi
  };
})();
