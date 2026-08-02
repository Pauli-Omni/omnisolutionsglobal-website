(function () {
  'use strict';

  /** Spiral rewind / forward — not skip-track chevrons. Labels: −10 / +10 */
  var ICON_BACK =
    '<span class="osg-tts-seek">' +
      '<svg class="osg-tts-seek__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
        '<path d="M11.5 4.5A7.5 7.5 0 1 0 19 12" stroke-linecap="round"/>' +
        '<path d="M11.5 4.5 9 7.2M11.5 4.5 14.2 7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>' +
      '<span class="osg-tts-seek__label">−10</span>' +
    '</span>';
  var ICON_FWD =
    '<span class="osg-tts-seek">' +
      '<svg class="osg-tts-seek__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">' +
        '<path d="M12.5 4.5A7.5 7.5 0 1 1 5 12" stroke-linecap="round"/>' +
        '<path d="M12.5 4.5 15 7.2M12.5 4.5 9.8 7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>' +
      '<span class="osg-tts-seek__label">+10</span>' +
    '</span>';
  var ICON_PLAY =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var ICON_PAUSE =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z"/></svg>';

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
    link.href = assetBase() + href + '?v=' + encodeURIComponent(window.OSG_BUILD_ID || '2026.07.28.07');
    document.head.appendChild(link);
  }

  function t(key) {
    if (window.OSGI18n && typeof OSGI18n.t === 'function') return OSGI18n.t(key);
    if (window.i18next) return i18next.t(key);
    return '';
  }

  function pickerLocales() {
    return window.OSGI18nConfig ? OSGI18nConfig.UI_PICKER_LOCALES : ['th', 'en', 'ru', 'zh', 'de', 'pl'];
  }

  function pickerBase(lng) {
    return window.OSGI18nConfig ? OSGI18nConfig.uiPickerBase(lng) : 'en';
  }

  /** Fixed labels (Thai, Englisch, …) — never translate with UI locale. */
  function nativeLabel(locale) {
    var map = window.OSGI18nConfig && OSGI18nConfig.LOCALE_NATIVE_LABELS;
    if (map && map[locale]) return map[locale];
    return String(locale || '').toUpperCase();
  }

  function flagFor(locale) {
    var map = window.OSGI18nConfig && OSGI18nConfig.LOCALE_FLAGS;
    if (map && map[locale]) return map[locale];
    return '';
  }

  function fillLangButton(btn, locale) {
    var label = nativeLabel(locale);
    var flag = flagFor(locale);
    btn.textContent = '';
    if (flag) {
      var flagEl = document.createElement('span');
      flagEl.className = 'hub-lang-picker__flag';
      flagEl.setAttribute('aria-hidden', 'true');
      flagEl.textContent = flag;
      btn.appendChild(flagEl);
    }
    var textEl = document.createElement('span');
    textEl.className = 'hub-lang-picker__label';
    textEl.textContent = label;
    btn.appendChild(textEl);
    btn.removeAttribute('data-i18n');
    btn.setAttribute('aria-label', label);
    btn.setAttribute('lang', locale === 'zh' ? 'zh-CN' : locale);
  }

  function applyNativePickerLabels(root) {
    var scope = root || document;
    scope.querySelectorAll('.hub-lang-picker__btn[data-ui-locale]').forEach(function (btn) {
      fillLangButton(btn, btn.getAttribute('data-ui-locale'));
    });
  }

  /** Vorlesen only on app front/desc — never hub/home/legal/global-hub. */
  function pageAllowsTts() {
    var view = document.body.getAttribute('data-app-view');
    return view === 'front' || view === 'desc';
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

  function showMaintenanceNotice() {
    var msg = t('maintenance.speakerNotice') || 'Vorlesefunktion ist aktuell in der Modifizierungsphase. Bitte um Verstaendnis.';
    if (msg && typeof window.alert === 'function') window.alert(msg);
  }

  function handleTransportClick(e) {
    if (!pageAllowsTts()) return;
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
    if (action === 'playpause') {
      OSGBrandTts.togglePlayPause().then(function () {
        updateTransportUi();
      }).catch(function () {
        updateTransportUi();
        showSpeakError();
      });
    }
  }

  function pickUiLocale(locale) {
    if (!window.i18next || !window.OSGI18nConfig) return;
    if (!OSGI18nConfig.isUiPickerLocale(locale)) return;
    if (window.OSGBrandTts && OSGBrandTts.stop) OSGBrandTts.stop();
    try {
      localStorage.setItem(OSGI18nConfig.STORAGE_KEY, locale);
      localStorage.setItem('osg-lang-user-picked', '1');
      sessionStorage.setItem('osg-lang-session-picked', '1');
    } catch (err) { /* ignore */ }

    function afterSwitch() {
      updatePickerState();
      updateTransportUi();
      if (window.OSGI18n && OSGI18n.applyToDom) OSGI18n.applyToDom();
      applyNativePickerLabels(document);
      if (window.OSGHome && OSGHome.initHomeAppGrid) OSGHome.initHomeAppGrid();
      document.documentElement.classList.add('osg-hub-lang-stable');
    }

    var current = pickerBase(i18next.language);
    if (current === locale) {
      afterSwitch();
      return;
    }
    i18next.changeLanguage(locale).then(afterSwitch).catch(afterSwitch);
  }

  function updatePickerState() {
    var lng = window.i18next ? pickerBase(i18next.language) : 'en';
    document.querySelectorAll('.hub-lang-picker__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-ui-locale') === lng;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function syncPickerStateAfterInit() {
    var tries = 0;
    function tick() {
      tries += 1;
      if (window.i18next && i18next.isInitialized) {
        updatePickerState();
        if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
          OSGI18n.applyToDom(document);
        }
        applyNativePickerLabels(document);
        return;
      }
      if (tries < 20) window.setTimeout(tick, 120);
    }
    tick();
  }

  /** Always-visible vertical language list — no toggle, no speaker. */
  function buildLangToolbar() {
    toolbarUid += 1;
    var uid = 'hub-lang-' + toolbarUid;
    var buttons = pickerLocales().map(function (locale) {
      var label = nativeLabel(locale);
      var flag = flagFor(locale);
      var flagHtml = flag
        ? '<span class="hub-lang-picker__flag" aria-hidden="true">' + flag + '</span>'
        : '';
      return '<button type="button" class="hub-lang-picker__btn trilingual-ui-picker__btn" data-ui-locale="' +
        locale + '" lang="' + (locale === 'zh' ? 'zh-CN' : locale) + '" aria-label="' + label +
        '" aria-pressed="false">' + flagHtml +
        '<span class="hub-lang-picker__label">' + label + '</span></button>';
    }).join('');
    var wrap = document.createElement('div');
    wrap.className = 'hub-voice-lang-tools page-header-tools';
    wrap.innerHTML =
      '<div class="app-voice-slot">' +
        '<div class="app-voice-toolbar hub-lang-toolbar hub-lang-toolbar--always-open">' +
          '<div id="' + uid + '-panel" class="hub-lang-picker trilingual-ui-picker is-open" role="group" ' +
            'data-i18n-aria="a11y.trilingualUiPicker">' +
            buttons +
          '</div>' +
        '</div>' +
      '</div>';
    return wrap;
  }

  /** −10s | Play/Pause | +10s — no Stop. */
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
      '<button type="button" class="osg-tts-transport__btn" data-osg-tts-action="forward" data-i18n-aria="voice.transportForwardAria">' +
        ICON_FWD +
      '</button>';
    return bar;
  }

  function wireLangToolbar(toolbar) {
    toolbar.querySelectorAll('.hub-lang-picker__btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        pickUiLocale(btn.getAttribute('data-ui-locale'));
      });
    });
    updatePickerState();
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(toolbar);
    }
    applyNativePickerLabels(toolbar);
  }

  function mountLangToolbar(host, position) {
    if (!host || host.querySelector('.hub-voice-lang-tools')) return;
    var toolbar = buildLangToolbar();
    if (position === 'prepend') host.insertBefore(toolbar, host.firstChild);
    else host.appendChild(toolbar);
    wireLangToolbar(toolbar);
  }

  function mountLangToolbars() {
    if (document.body.querySelector(':scope > #osg-lang-rail .hub-voice-lang-tools')) return;

    var rail = document.getElementById('osg-lang-rail');
    if (rail && rail.parentElement !== document.body) {
      document.body.appendChild(rail);
    }
    if (!rail) {
      rail = document.createElement('div');
      rail.id = 'osg-lang-rail';
      rail.setAttribute('aria-label', 'Language');
      document.body.appendChild(rail);
    }
    mountLangToolbar(rail, 'append');
  }

  function mountTransportBar() {
    if (!pageAllowsTts()) return;
    if (document.getElementById('osg-tts-transport-root')) return;
    var root = document.createElement('div');
    root.id = 'osg-tts-transport-root';
    root.className = 'osg-tts-transport-root';
    var bar = buildTransportBar();
    root.appendChild(bar);
    document.body.appendChild(root);
    /* Direct button listeners — mid/top of Play must hit the control, not an overlay. */
    bar.querySelectorAll('[data-osg-tts-action]').forEach(function (btn) {
      btn.addEventListener('click', handleTransportClick);
    });
    if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
      OSGI18n.applyToDom(root);
    }
    updateTransportUi();
  }

  function init() {
    if (document.body.getAttribute('data-page') === 'opsVoiceCheck') return;

    document.documentElement.classList.add('osg-hub-lang-stable');
    loadStylesheet('css/voice-lang-maintenance.css');
    loadStylesheet('css/trilingual-visual.css');

    mountLangToolbars();
    mountTransportBar();
    document.addEventListener('click', handleTransportClick, true);
    document.addEventListener('osg:ttsEnded', updateTransportUi);
    document.addEventListener('osg:ttsPlaying', updateTransportUi);
    document.addEventListener('osg:ttsState', updateTransportUi);

    if (window.i18next) {
      updatePickerState();
      updateTransportUi();
      syncPickerStateAfterInit();
      if (typeof i18next.on === 'function') {
        i18next.on('initialized', function () {
          syncPickerStateAfterInit();
        });
      }
      i18next.on('languageChanged', function () {
        if (window.OSGBrandTts && OSGBrandTts.stop) OSGBrandTts.stop();
        updatePickerState();
        updateTransportUi();
        if (window.OSGI18n && typeof OSGI18n.applyToDom === 'function') {
          OSGI18n.applyToDom(document);
        }
        applyNativePickerLabels(document);
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
