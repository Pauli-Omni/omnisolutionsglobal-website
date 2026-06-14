'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { buildLocalePayload } = require('./router');

const LOCALES_DIR = path.join(__dirname, '..', '..', 'assets', 'locales');

test('i18n API merges en base with locale overlay', function () {
  const de = buildLocalePayload(LOCALES_DIR, 'de');
  assert.ok(de.payload.omniqr);
  assert.ok(de.payload.omniqr.terms);
  assert.equal(de.servedLocale, 'de');
  assert.match(de.payload.omniqr.terms.s3P1, /4,5/);
});

test('i18n API merges fr overlay with en base', function () {
  const fr = buildLocalePayload(LOCALES_DIR, 'fr');
  assert.equal(fr.servedLocale, 'fr');
  assert.ok(fr.payload.omniqr.support);
  assert.ok(fr.payload.omniqr.terms);
  assert.equal(fr.payload.omniqr.terms.readAloud, 'Lire les CGU');
});

test('all 18 locales expose OmniQR terms button keys', function () {
  const { SUPPORTED_LOCALES } = require('./locale-registry');
  SUPPORTED_LOCALES.forEach(function (locale) {
    const built = buildLocalePayload(LOCALES_DIR, locale);
    assert.equal(built.servedLocale, locale, locale + ' should have locale file');
    assert.ok(built.payload.omniqr.terms.readAloud, locale + ' missing readAloud');
    assert.ok(built.payload.omniqr.terms.welcomeAgbBtn, locale + ' missing welcomeAgbBtn');
    assert.ok(built.payload.omniqr.terms.pdfDownload, locale + ' missing pdfDownload');
  });
});
