'use strict';

const SUPPORTED_LOCALES = [
  'de', 'en', 'th', 'pl', 'ru', 'zh',
  'fr', 'es', 'it', 'pt', 'nl',
  'ar', 'ja', 'ko', 'vi', 'tr', 'hi', 'id'
];

const FALLBACK_LOCALES = ['en', 'de'];

const LOCALE_BCP47 = {
  de: 'de-DE', en: 'en-US', th: 'th-TH', pl: 'pl-PL', ru: 'ru-RU', zh: 'zh-CN',
  fr: 'fr-FR', es: 'es-ES', it: 'it-IT', pt: 'pt-PT', nl: 'nl-NL',
  ar: 'ar-SA', ja: 'ja-JP', ko: 'ko-KR', vi: 'vi-VN', tr: 'tr-TR', hi: 'hi-IN', id: 'id-ID'
};

function normalizeLocale(raw) {
  if (!raw) return FALLBACK_LOCALES[0];
  const c = String(raw).toLowerCase().replace(/_/g, '-');
  if (c.startsWith('zh')) return 'zh';
  const base = c.split('-')[0];
  if (SUPPORTED_LOCALES.includes(base)) return base;
  return FALLBACK_LOCALES[0];
}

function isSupported(locale) {
  return SUPPORTED_LOCALES.includes(locale);
}

module.exports = {
  SUPPORTED_LOCALES,
  FALLBACK_LOCALES,
  LOCALE_BCP47,
  normalizeLocale,
  isSupported
};
