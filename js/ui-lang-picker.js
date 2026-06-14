(function () {
  'use strict';

  var cfg = window.OSGI18nConfig;
  if (!cfg) return;

  var LEGAL_QUICK = ['th', 'de', 'en', 'pl', 'ru', 'zh'];

  function updateActive() {
    var lng = window.i18next ? i18next.language : cfg.FALLBACK_LOCALES[0];
    document.querySelectorAll('.ui-lang-picker__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-ui-locale') === lng;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function pickLocale(locale) {
    if (!window.i18next || !cfg.isSupported(locale)) return;
    try {
      localStorage.setItem(cfg.STORAGE_KEY, locale);
      localStorage.setItem('osg-lang-user-picked', '1');
    } catch (e) { /* ignore */ }
    i18next.changeLanguage(locale);
    if (window.OSGWorldLang && OSGWorldLang.syncSpeechFromUiLocale) {
      OSGWorldLang.syncSpeechFromUiLocale(locale);
    }
  }

  function mount(selector) {
    var root = document.querySelector(selector);
    if (!root || root.dataset.langPickerMounted) return;
    root.dataset.langPickerMounted = '1';

    var wrap = document.createElement('div');
    wrap.className = 'ui-lang-picker';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-labelledby', 'ui-lang-picker-label');

    var label = document.createElement('span');
    label.id = 'ui-lang-picker-label';
    label.className = 'ui-lang-picker__label';
    label.setAttribute('data-i18n', 'voice.langQuickLabel');

    var grid = document.createElement('div');
    grid.className = 'ui-lang-picker__grid';

    LEGAL_QUICK.forEach(function (locale) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ui-lang-picker__btn';
      btn.setAttribute('data-ui-locale', locale);
      btn.setAttribute('aria-label', cfg.LOCALE_NATIVE_LABELS[locale] || locale);
      btn.textContent = cfg.LOCALE_NATIVE_LABELS[locale] || locale;
      btn.addEventListener('click', function () { pickLocale(locale); });
      grid.appendChild(btn);
    });

    wrap.appendChild(label);
    wrap.appendChild(grid);
    root.appendChild(wrap);

    if (window.OSGI18n) OSGI18n.applyToDom();
    if (window.i18next) {
      i18next.on('languageChanged', updateActive);
    }
    updateActive();
  }

  window.OSGUiLangPicker = { mount: mount };
})();
