(function () {
  'use strict';

  var cfg = window.OSGI18nConfig;
  if (!cfg) {
    throw new Error('OSGI18nConfig missing — load js/i18n-config.js before js/i18n.js');
  }

  function applyToDom() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = i18next.t(key, { year: new Date().getFullYear() });
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
      else el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (key) el.setAttribute('aria-label', i18next.t(key));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', i18next.t(key));
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', i18next.t(key, {
          year: new Date().getFullYear(),
          opsPath: '/ops/voice-check.html'
        }));
      }
    });

    var body = document.body;
    var titleKey = body.getAttribute('data-i18n-title');
    if (titleKey) document.title = i18next.t(titleKey, { year: new Date().getFullYear() });

    var metaKey = body.getAttribute('data-i18n-meta');
    if (metaKey) {
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = i18next.t(metaKey);
    }

    document.documentElement.lang = cfg.htmlLangFor(i18next.language);

    var company = i18next.t('common.company');
    document.querySelectorAll('[data-i18n-company]').forEach(function (el) {
      el.textContent = company;
    });
    document.querySelectorAll('[data-i18n-email]').forEach(function (el) {
      var email = i18next.t('common.email');
      if (el.hasAttribute('data-contact-trigger')) {
        el.textContent = email;
      } else if (el.tagName === 'A') {
        el.href = 'mailto:' + email;
        el.textContent = email;
      } else {
        el.textContent = email;
      }
    });
    document.querySelectorAll('[data-i18n-location]').forEach(function (el) {
      el.textContent = i18next.t('common.location');
    });
  }

  window.OSGI18n = {
    SUPPORTED_LOCALES: cfg.SUPPORTED_LOCALES,
    normalizeLng: cfg.normalizeLocale,
    t: function (key) { return i18next.t(key, { year: new Date().getFullYear() }); },
    applyToDom: applyToDom,
    init: function () {
      var initialLng = window.OSGWorldLang
        ? OSGWorldLang.getInitialUiLocale()
        : cfg.normalizeLocale(navigator.language);

      return new Promise(function (resolve, reject) {
        i18next
          .use(i18nextHttpBackend)
          .init({
            lng: initialLng,
            supportedLngs: cfg.SUPPORTED_LOCALES,
            fallbackLng: cfg.FALLBACK_LOCALES,
            ns: ['translation'],
            defaultNS: 'translation',
            backend: {
              loadPath: cfg.LOCALE_LOAD_PATH
            },
            interpolation: { escapeValue: false }
          }, function (err) {
            if (err) { reject(err); return; }
            try { localStorage.setItem(cfg.STORAGE_KEY, i18next.language); } catch (e) { /* ignore */ }
            if (window.OSGWorldLang && OSGWorldLang.syncSpeechFromUiLocale) {
              OSGWorldLang.syncSpeechFromUiLocale(i18next.language);
            }
            applyToDom();
            i18next.on('languageChanged', function (lng) {
              try { localStorage.setItem(cfg.STORAGE_KEY, lng); } catch (e) { /* ignore */ }
              if (window.OSGWorldLang && OSGWorldLang.syncSpeechFromUiLocale) {
                OSGWorldLang.syncSpeechFromUiLocale(lng);
              }
              if (window.OSGBrandTts && OSGBrandTts.clearSessionCache) {
                OSGBrandTts.clearSessionCache();
              }
              if (window.OSGTtsEnglishTerms && OSGTtsEnglishTerms.invalidateCache) {
                OSGTtsEnglishTerms.invalidateCache();
              }
              applyToDom();
            });
            resolve(i18next);
          });
      });
    }
  };
})();
