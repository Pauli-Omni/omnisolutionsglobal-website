'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPublicVoiceStatus } = require('./voice-diagnostics');

test('public voice status exposes speakReady boolean', async function () {
  const status = await buildPublicVoiceStatus();
  assert.equal(typeof status.speakReady, 'boolean');
  assert.equal(typeof status.engines, 'object');
});
