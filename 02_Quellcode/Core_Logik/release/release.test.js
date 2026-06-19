'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { readRelease, bumpBuildId } = require('./read-release');

const { SITE_ROOT } = require('../paths');

test('release.json exposes buildId and termsVersion', function () {
  const release = readRelease(SITE_ROOT);
  assert.ok(release.buildId);
  assert.ok(release.termsVersion);
  assert.match(release.buildId, /^\d{4}\.\d{2}\.\d{2}\.\d+$/);
});

test('bumpBuildId increments patch segment', function () {
  assert.equal(bumpBuildId('2026.06.12.1'), '2026.06.12.2');
});
