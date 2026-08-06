(function () {
  'use strict';

  var cfg = window.OSGI18nConfig;
  if (!cfg) {
    throw new Error('OSGI18nConfig missing — load js/i18n-config.js before js/i18n.js');
  }

  function isOmniQrHubPage() {
    return document.body && document.body.getAttribute('data-page') === 'omniqr';
  }

  function activeUiLocales() {
    return isOmniQrHubPage() ? cfg.SUPPORTED_LOCALES : cfg.UI_PICKER_LOCALES;
  }

  function normalizeActiveLocale(code) {
    var locale = cfg.normalizeLocale(code);
    if (activeUiLocales().indexOf(locale) >= 0) return locale;
    return cfg.uiPickerBase(locale);
  }

  /** Never paint "undefined" / missing keys over static HTML fallbacks (affiliate crawlers + CDN fails). */
  function isUsableTranslation(val, key) {
    if (val == null) return false;
    if (typeof val !== 'string') return false;
    var s = val.trim();
    if (!s) return false;
    if (s === 'undefined' || s === 'null' || s === '[object Object]') return false;
    if (key && s === key) return false;
    return true;
  }

  function translate(key, opts) {
    if (!key) return '';
    if (!window.i18next || typeof i18next.t !== 'function') return '';
    try {
      return i18next.t(key, opts || { year: new Date().getFullYear() });
    } catch (e) {
      return '';
    }
  }

  function lookupNested(obj, key) {
    if (!obj || !key) return '';
    var parts = String(key).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== 'object') return '';
      cur = cur[parts[i]];
    }
    return typeof cur === 'string' ? cur : '';
  }

  function applyBundleToDom(bundle) {
    if (!bundle || typeof bundle !== 'object') return;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = lookupNested(bundle, key);
      if (!isUsableTranslation(val, key)) return;
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      var val = lookupNested(bundle, key);
      if (key && isUsableTranslation(val, key)) el.setAttribute('aria-label', val);
    });
    var body = document.body;
    if (!body) return;
    var titleKey = body.getAttribute('data-i18n-title');
    if (titleKey) {
      var titleVal = lookupNested(bundle, titleKey);
      if (isUsableTranslation(titleVal, titleKey)) document.title = titleVal;
    }
    var metaKey = body.getAttribute('data-i18n-meta');
    if (metaKey) {
      var meta = document.querySelector('meta[name="description"]');
      var metaVal = lookupNested(bundle, metaKey);
      if (meta && isUsableTranslation(metaVal, metaKey)) meta.content = metaVal;
    }
    var company = lookupNested(bundle, 'common.company');
    if (isUsableTranslation(company, 'common.company')) {
      document.querySelectorAll('[data-i18n-company]').forEach(function (el) {
        el.textContent = company;
      });
    }
    var email = lookupNested(bundle, 'common.email');
    if (isUsableTranslation(email, 'common.email')) {
      document.querySelectorAll('[data-i18n-email]').forEach(function (el) {
        if (el.hasAttribute('data-contact-trigger')) {
          el.textContent = email;
        } else if (el.tagName === 'A') {
          el.href = 'mailto:' + email;
          el.textContent = email;
        } else {
          el.textContent = email;
        }
      });
    }
    var location = lookupNested(bundle, 'common.location');
    if (isUsableTranslation(location, 'common.location')) {
      document.querySelectorAll('[data-i18n-location]').forEach(function (el) {
        el.textContent = location;
      });
    }
  }

  function applyToDom() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = translate(key, { year: new Date().getFullYear() });
      if (!isUsableTranslation(val, key)) return;
      if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
      else el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (!key) return;
      var val = translate(key);
      if (isUsableTranslation(val, key)) el.setAttribute('aria-label', val);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (!key) return;
      var val = translate(key);
      if (isUsableTranslation(val, key)) el.setAttribute('placeholder', val);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (!key) return;
      var val = translate(key, {
        year: new Date().getFullYear(),
        opsPath: '/ops/voice-check.html'
      });
      if (isUsableTranslation(val, key)) el.setAttribute('title', val);
    });

    var body = document.body;
    var titleKey = body && body.getAttribute('data-i18n-title');
    if (titleKey) {
      var translatedTitle = translate(titleKey, { year: new Date().getFullYear() });
      if (isUsableTranslation(translatedTitle, titleKey)) {
        document.title = translatedTitle;
      }
    }

    var metaKey = body && body.getAttribute('data-i18n-meta');
    if (metaKey) {
      var meta = document.querySelector('meta[name="description"]');
      var translatedMeta = translate(metaKey);
      if (meta && isUsableTranslation(translatedMeta, metaKey)) {
        meta.content = translatedMeta;
      }
    }

    if (window.i18next && i18next.language) {
      document.documentElement.lang = cfg.htmlLangFor(i18next.language);
    }

    var company = translate('common.company');
    if (isUsableTranslation(company, 'common.company')) {
      document.querySelectorAll('[data-i18n-company]').forEach(function (el) {
        el.textContent = company;
      });
    }
    var email = translate('common.email');
    if (isUsableTranslation(email, 'common.email')) {
      document.querySelectorAll('[data-i18n-email]').forEach(function (el) {
        if (el.hasAttribute('data-contact-trigger')) {
          el.textContent = email;
        } else if (el.tagName === 'A') {
          el.href = 'mailto:' + email;
          el.textContent = email;
        } else {
          el.textContent = email;
        }
      });
    }
    var location = translate('common.location');
    if (isUsableTranslation(location, 'common.location')) {
      document.querySelectorAll('[data-i18n-location]').forEach(function (el) {
        el.textContent = location;
      });
    }
  }

  function localeUrl(lng) {
    if (cfg.localeLoadUrl) return cfg.localeLoadUrl(lng);
    return '/assets/locales/' + encodeURIComponent(lng) + '.json';
  }

  /** When CDN i18next fails: still fill UI from static locale JSON (no "undefined"). */
  function applyStaticLocaleFallback(lng) {
    var url = localeUrl(lng || 'en');
    return fetch(url, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('locale HTTP ' + res.status);
        return res.json();
      })
      .then(function (bundle) {
        applyBundleToDom(bundle);
        return bundle;
      })
      .catch(function () {
        if (lng && lng !== 'en') return applyStaticLocaleFallback('en');
        return null;
      });
  }

  window.OSGI18n = {
    SUPPORTED_LOCALES: cfg.SUPPORTED_LOCALES,
    normalizeLng: cfg.normalizeLocale,
    t: function (key) {
      var val = translate(key, { year: new Date().getFullYear() });
      return isUsableTranslation(val, key) ? val : '';
    },
    applyToDom: applyToDom,
    applyStaticLocaleFallback: applyStaticLocaleFallback,
    init: function () {
      var initialLng = window.OSGWorldLang
        ? OSGWorldLang.getInitialUiLocale()
        : normalizeActiveLocale(navigator.language);

      try {
        var urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang) {
          initialLng = normalizeActiveLocale(urlLang);
          if (window.OSGWorldLang && OSGWorldLang.markUserUiPick) {
            OSGWorldLang.markUserUiPick();
          }
        }
      } catch (e) { /* ignore */ }

      initialLng = normalizeActiveLocale(initialLng);

      if (!window.i18next || typeof i18next.use !== 'function' || typeof i18nextHttpBackend === 'undefined') {
        return applyStaticLocaleFallback(initialLng).then(function () {
          return null;
        });
      }

      return new Promise(function (resolve, reject) {
        i18next
          .use(i18nextHttpBackend)
          .init({
            lng: initialLng,
            supportedLngs: activeUiLocales(),
            fallbackLng: cfg.FALLBACK_LOCALES,
            ns: ['translation'],
            defaultNS: 'translation',
            returnNull: true,
            returnEmptyString: false,
            parseMissingKeyHandler: function () { return null; },
            backend: {
              loadPath: cfg.LOCALE_LOAD_PATH
            },
            interpolation: { escapeValue: false }
          }, function (err) {
            if (err) {
              applyStaticLocaleFallback(initialLng).then(function () {
                reject(err);
              });
              return;
            }
            try { localStorage.setItem(cfg.STORAGE_KEY, i18next.language); } catch (e) { /* ignore */ }
            if (window.OSGWorldLang && OSGWorldLang.syncSpeechFromUiLocale) {
              OSGWorldLang.syncSpeechFromUiLocale(i18next.language);
            }
            applyToDom();
            i18next.on('languageChanged', function (lng) {
              try { localStorage.setItem(cfg.STORAGE_KEY, lng); } catch (e2) { /* ignore */ }
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
