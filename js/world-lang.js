(function () {
  'use strict';

  var cfg = window.OSGI18nConfig;
  if (!cfg) {
    throw new Error('OSGI18nConfig missing — load js/i18n-config.js before js/world-lang.js');
  }

  var SPEECH_STORAGE = 'osg-speech-lang';
  var SPEECH_USER_PICKED = 'osg-speech-user-picked';
  var UI_USER_PICKED = 'osg-lang-user-picked';

  var NAME_TO_BCP = {
    de: 'de-DE', deu: 'de-DE', german: 'de-DE', deutsch: 'de-DE', allemand: 'de-DE',
    en: 'en-US', eng: 'en-US', english: 'en-US', englisch: 'en-US', anglais: 'en-US',
    th: 'th-TH', tha: 'th-TH', thai: 'th-TH', thailändisch: 'th-TH', ไทย: 'th-TH', 'ภาษาไทย': 'th-TH',
    pl: 'pl-PL', pol: 'pl-PL', polish: 'pl-PL', polnisch: 'pl-PL', polski: 'pl-PL',
    ru: 'ru-RU', rus: 'ru-RU', russian: 'ru-RU', russisch: 'ru-RU', русский: 'ru-RU',
    zh: 'zh-CN', zho: 'zh-CN', chinese: 'zh-CN', chinesisch: 'zh-CN', 中文: 'zh-CN', mandarin: 'zh-CN',
    fr: 'fr-FR', fra: 'fr-FR', french: 'fr-FR', französisch: 'fr-FR', français: 'fr-FR', francais: 'fr-FR',
    es: 'es-ES', spa: 'es-ES', spanish: 'es-ES', spanisch: 'es-ES', español: 'es-ES', espanol: 'es-ES',
    it: 'it-IT', ita: 'it-IT', italian: 'it-IT', italienisch: 'it-IT', italiano: 'it-IT',
    pt: 'pt-PT', por: 'pt-PT', portuguese: 'pt-PT', portugiesisch: 'pt-PT', português: 'pt-PT',
    'pt-br': 'pt-BR', brasil: 'pt-BR', brazilian: 'pt-BR',
    nl: 'nl-NL', dutch: 'nl-NL', niederländisch: 'nl-NL', nederlands: 'nl-NL',
    ar: 'ar-SA', ara: 'ar-SA', arabic: 'ar-SA', arabisch: 'ar-SA', العربية: 'ar-SA',
    hi: 'hi-IN', hin: 'hi-IN', hindi: 'hi-IN',
    ja: 'ja-JP', jpn: 'ja-JP', japanese: 'ja-JP', japanisch: 'ja-JP', 日本語: 'ja-JP',
    ko: 'ko-KR', kor: 'ko-KR', korean: 'ko-KR', koreanisch: 'ko-KR', 한국어: 'ko-KR',
    vi: 'vi-VN', vie: 'vi-VN', vietnamese: 'vi-VN', vietnamesisch: 'vi-VN', 'tiếng việt': 'vi-VN',
    tr: 'tr-TR', tur: 'tr-TR', turkish: 'tr-TR', türkisch: 'tr-TR', türkçe: 'tr-TR',
    id: 'id-ID', ind: 'id-ID', indonesian: 'id-ID', indonesisch: 'id-ID', 'bahasa indonesia': 'id-ID',
    sv: 'sv-SE', swe: 'sv-SE', swedish: 'sv-SE', schwedisch: 'sv-SE', svenska: 'sv-SE',
    da: 'da-DK', dan: 'da-DK', danish: 'da-DK', dänisch: 'da-DK', dansk: 'da-DK',
    no: 'nb-NO', nor: 'nb-NO', norwegian: 'nb-NO', norwegisch: 'nb-NO', norsk: 'nb-NO',
    fi: 'fi-FI', fin: 'fi-FI', finnish: 'fi-FI', finnisch: 'fi-FI', suomi: 'fi-FI',
    cs: 'cs-CZ', ces: 'cs-CZ', czech: 'cs-CZ', tschechisch: 'cs-CZ', čeština: 'cs-CZ',
    sk: 'sk-SK', slk: 'sk-SK', slovak: 'sk-SK', slowakisch: 'sk-SK', slovenčina: 'sk-SK',
    hu: 'hu-HU', hun: 'hu-HU', hungarian: 'hu-HU', ungarisch: 'hu-HU', magyar: 'hu-HU',
    ro: 'ro-RO', ron: 'ro-RO', romanian: 'ro-RO', rumänisch: 'ro-RO', română: 'ro-RO',
    bg: 'bg-BG', bul: 'bg-BG', bulgarian: 'bg-BG', bulgarisch: 'bg-BG', български: 'bg-BG',
    uk: 'uk-UA', ukr: 'uk-UA', ukrainian: 'uk-UA', ukrainisch: 'uk-UA', українська: 'uk-UA',
    el: 'el-GR', ell: 'el-GR', greek: 'el-GR', griechisch: 'el-GR', ελληνικά: 'el-GR',
    he: 'he-IL', heb: 'he-IL', hebrew: 'he-IL', hebräisch: 'he-IL', עברית: 'he-IL',
    ms: 'ms-MY', msa: 'ms-MY', malay: 'ms-MY', malaiisch: 'ms-MY', 'bahasa melayu': 'ms-MY',
    fil: 'fil-PH', filipino: 'fil-PH', tagalog: 'fil-PH'
  };

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function storageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }

  function normalizeKey(raw) {
    return String(raw || '').trim().toLowerCase().replace(/_/g, '-');
  }

  function getSystemLanguageTag() {
    var nav = navigator.language
      || (navigator.languages && navigator.languages.length ? navigator.languages[0] : '')
      || cfg.speechTagFor('en');
    return resolveSpeechTag(nav) || nav;
  }

  function resolveSpeechTag(raw) {
    var norm = normalizeKey(raw);
    if (!norm) return null;
    if (NAME_TO_BCP[norm]) return NAME_TO_BCP[norm];
    if (/^[a-z]{2}$/i.test(norm)) return norm.toLowerCase();
    if (/^[a-z]{2}-[a-z]{2,4}$/i.test(norm)) return norm;
    return norm;
  }

  function localeBaseFromTag(tag) {
    if (!tag) return cfg.FALLBACK_LOCALES[0];
    var base = String(tag).split('-')[0].toLowerCase();
    return base === 'zh' ? 'zh' : base;
  }

  function isOmniQrHubPage() {
    return typeof document !== 'undefined'
      && document.body
      && document.body.getAttribute('data-page') === 'omniqr';
  }

  function hubUiLocales() {
    return isOmniQrHubPage() ? cfg.SUPPORTED_LOCALES : cfg.UI_PICKER_LOCALES;
  }

  function isUiLocale(locale) {
    return hubUiLocales().indexOf(locale) >= 0;
  }

  function mapTagToUiLocale(tag) {
    var base = localeBaseFromTag(tag);
    if (cfg.isUiPickerLocale(base)) return base;
    if (isOmniQrHubPage() && cfg.isSupported(base)) return base;
    return cfg.uiPickerBase(base);
  }

  function hasUserSpeechPick() {
    return storageGet(SPEECH_USER_PICKED) === '1';
  }

  function hasUserUiPick() {
    return storageGet(UI_USER_PICKED) === '1';
  }

  function getSpeechTag() {
    if (hasUserSpeechPick()) {
      var stored = storageGet(SPEECH_STORAGE);
      if (stored) return stored;
    }
    return getSystemLanguageTag();
  }

  function getEffectiveSpeechTag() {
    if (typeof window !== 'undefined' && window.i18next && isUiLocale(i18next.language)) {
      return cfg.speechTagFor(i18next.language) || getSpeechTag();
    }
    if (hasUserSpeechPick()) return getSpeechTag();
    return getSpeechTag();
  }

  function syncSpeechFromUiLocale(lng) {
    var locale = lng || (typeof window !== 'undefined' && window.i18next ? i18next.language : '');
    if (locale && isUiLocale(locale)) {
      setSpeechTag(cfg.speechTagFor(locale));
      try { localStorage.removeItem(SPEECH_USER_PICKED); } catch (e) { /* ignore */ }
    }
  }

  function setSpeechTag(tag) {
    if (!tag) return;
    storageSet(SPEECH_STORAGE, tag);
  }

  function markUserSpeechPick() {
    storageSet(SPEECH_USER_PICKED, '1');
    storageSet(UI_USER_PICKED, '1');
  }

  function getInitialUiLocale() {
    if (hasUserUiPick()) {
      var saved = storageGet(cfg.STORAGE_KEY);
      if (saved && isUiLocale(saved)) return saved;
    }
    return mapTagToUiLocale(getSystemLanguageTag());
  }

  function applyUserLanguageInput(raw) {
    var speechTag = resolveSpeechTag(raw);
    if (!speechTag) return { speechTag: null, uiLocale: null };
    var uiLocale = mapTagToUiLocale(speechTag);
    if (isUiLocale(uiLocale)) {
      setSpeechTag(cfg.speechTagFor(uiLocale));
      storageSet(UI_USER_PICKED, '1');
      try { localStorage.removeItem(SPEECH_USER_PICKED); } catch (e) { /* ignore */ }
    } else {
      setSpeechTag(speechTag);
      markUserSpeechPick();
    }
    return {
      speechTag: speechTag,
      uiLocale: uiLocale
    };
  }

  window.OSGWorldLang = {
    SUPPORTED_LOCALES: cfg.SUPPORTED_LOCALES,
    LOCALE_BCP47: cfg.LOCALE_BCP47,
    getSystemLanguageTag: getSystemLanguageTag,
    resolveSpeechTag: resolveSpeechTag,
    mapTagToUiLocale: mapTagToUiLocale,
    getSpeechTag: getSpeechTag,
    getEffectiveSpeechTag: getEffectiveSpeechTag,
    syncSpeechFromUiLocale: syncSpeechFromUiLocale,
    setSpeechTag: setSpeechTag,
    getInitialUiLocale: getInitialUiLocale,
    hasUserSpeechPick: hasUserSpeechPick,
    hasUserUiPick: hasUserUiPick,
    applyUserLanguageInput: applyUserLanguageInput
  };
})();
