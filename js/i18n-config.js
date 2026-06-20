(function () {
  'use strict';

  // CRITICAL: DO NOT HARDCODE LANGUAGES. ALWAYS USE GLOBAL I18N SYSTEM. PARSE ABBREVIATIONS VIA PAULI-METHOD ONLY.

  /**
   * OSG Homepage hub: 6 UI locales (assets/locales/{de,en,th,pl,ru,zh}.json).
   * Extended apps (e.g. OmniQR) may use SUPPORTED_LOCALES (18).
   */
  var UI_PICKER_LOCALES = ['th', 'en', 'ru', 'de', 'pl', 'zh'];

  var SUPPORTED_LOCALES = UI_PICKER_LOCALES.concat([
    'fr', 'es', 'it', 'pt', 'nl',
    'ar', 'ja', 'ko', 'vi', 'tr', 'hi', 'id'
  ]);

  var HTML_LANG = {
    de: 'de', en: 'en', th: 'th', pl: 'pl', ru: 'ru', zh: 'zh-CN',
    fr: 'fr', es: 'es', it: 'it', pt: 'pt', nl: 'nl',
    ar: 'ar', ja: 'ja', ko: 'ko', vi: 'vi', tr: 'tr', hi: 'hi', id: 'id'
  };

  var LOCALE_BCP47 = {
    de: 'de-DE', en: 'en-US', th: 'th-TH', pl: 'pl-PL', ru: 'ru-RU', zh: 'zh-CN',
    fr: 'fr-FR', es: 'es-ES', it: 'it-IT', pt: 'pt-PT', nl: 'nl-NL',
    ar: 'ar-SA', ja: 'ja-JP', ko: 'ko-KR', vi: 'vi-VN', tr: 'tr-TR', hi: 'hi-IN', id: 'id-ID'
  };

  var LOCALE_NATIVE_LABELS = {
    de: 'Deutsch', en: 'English', th: 'ไทย', pl: 'Polski', ru: 'Русский', zh: '中文',
    fr: 'Français', es: 'Español', it: 'Italiano', pt: 'Português', nl: 'Nederlands',
    ar: 'العربية', ja: '日本語', ko: '한국어', vi: 'Tiếng Việt', tr: 'Türkçe', hi: 'हिन्दी', id: 'Bahasa Indonesia'
  };

  var FALLBACK_LOCALES = ['en', 'de'];
  var STORAGE_KEY = 'osg-lang';
  var LOCALE_LOAD_PATH = '/api/i18n/{{lng}}.json';
  var ASSET_ROOT = '/';

  function isSupported(locale) {
    return SUPPORTED_LOCALES.indexOf(locale) >= 0;
  }

  function normalizeLocale(code) {
    if (!code) return FALLBACK_LOCALES[0];
    var c = String(code).toLowerCase().replace(/_/g, '-');
    if (c.indexOf('zh') === 0) return 'zh';
    var base = c.split('-')[0];
    if (isSupported(base)) return base;
    return FALLBACK_LOCALES[0];
  }

  function htmlLangFor(locale) {
    return HTML_LANG[locale] || locale || HTML_LANG.en;
  }

  function speechTagFor(locale) {
    return LOCALE_BCP47[locale] || LOCALE_BCP47.en;
  }

  function localeLoadUrl(locale) {
    var url = LOCALE_LOAD_PATH.replace('{{lng}}', encodeURIComponent(locale));
    var buildId = window.OSG_BUILD_ID;
    if (buildId) {
      url += (url.indexOf('?') >= 0 ? '&' : '?') + 'v=' + encodeURIComponent(buildId);
    }
    return url;
  }

  function assetUrl(relativePath) {
    if (!relativePath) return ASSET_ROOT;
    if (/^https?:\/\//i.test(relativePath) || relativePath.charAt(0) === '/') {
      return relativePath;
    }
    return ASSET_ROOT + relativePath.replace(/^\.\//, '');
  }

  function isUiPickerLocale(locale) {
    return UI_PICKER_LOCALES.indexOf(locale) >= 0;
  }

  function uiPickerBase(locale) {
    var base = normalizeLocale(locale);
    return isUiPickerLocale(base) ? base : FALLBACK_LOCALES[0];
  }

  window.OSGI18nConfig = {
    UI_PICKER_LOCALES: UI_PICKER_LOCALES,
    SUPPORTED_LOCALES: SUPPORTED_LOCALES,
    HTML_LANG: HTML_LANG,
    LOCALE_BCP47: LOCALE_BCP47,
    LOCALE_NATIVE_LABELS: LOCALE_NATIVE_LABELS,
    FALLBACK_LOCALES: FALLBACK_LOCALES,
    STORAGE_KEY: STORAGE_KEY,
    LOCALE_LOAD_PATH: LOCALE_LOAD_PATH,
    ASSET_ROOT: ASSET_ROOT,
    isSupported: isSupported,
    isUiPickerLocale: isUiPickerLocale,
    uiPickerBase: uiPickerBase,
    normalizeLocale: normalizeLocale,
    htmlLangFor: htmlLangFor,
    speechTagFor: speechTagFor,
    localeLoadUrl: localeLoadUrl,
    assetUrl: assetUrl
  };
})();
