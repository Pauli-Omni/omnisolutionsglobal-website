'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

test('getElevenLabsApiKey prefers process.env on Render', function () {
  const prev = process.env.ELEVENLABS_API_KEY;
  process.env.ELEVENLABS_API_KEY = 'env-key-test';
  delete require.cache[require.resolve('./elevenlabs-key.js')];
  const keyMod = require('./elevenlabs-key');
  assert.equal(keyMod.getElevenLabsApiKey(), 'env-key-test');
  if (prev === undefined) delete process.env.ELEVENLABS_API_KEY;
  else process.env.ELEVENLABS_API_KEY = prev;
  delete require.cache[require.resolve('./elevenlabs-key.js')];
});
