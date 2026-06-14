'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

test('synthesizeChunk uses ElevenLabs first for Thai', async function () {
  const xtts = require('./xtts-bridge');
  const elevenlabs = require('./elevenlabs-speak');
  const originalHealth = xtts.health;
  const originalHasKey = elevenlabs.hasApiKey;
  const originalSynth = elevenlabs.synthesizeMp3;
  let xttsCalled = false;

  xtts.health = async function () { return { ok: true }; };
  xtts.synthesizeMp3 = async function () {
    xttsCalled = true;
    return Buffer.from('xtts');
  };
  elevenlabs.hasApiKey = function () { return true; };
  elevenlabs.synthesizeMp3 = async function (_text, lang) {
    assert.equal(lang, 'th-TH');
    return Buffer.from('elevenlabs-th');
  };

  delete require.cache[require.resolve('./tts-router.js')];
  const tts = require('./tts-router');

  try {
    const out = await tts.synthesizeChunk('สวัสดี', 'th-TH');
    assert.equal(out.engine, 'elevenlabs-clone');
    assert.equal(xttsCalled, false);
  } finally {
    xtts.health = originalHealth;
    delete xtts.synthesizeMp3;
    elevenlabs.hasApiKey = originalHasKey;
    elevenlabs.synthesizeMp3 = originalSynth;
    delete require.cache[require.resolve('./tts-router.js')];
  }
});

test('synthesizeChunk falls back to cloud when XTTS offline', async function () {
  const xtts = require('./xtts-bridge');
  const elevenlabs = require('./elevenlabs-speak');
  const originalHealth = xtts.health;
  const originalHasKey = elevenlabs.hasApiKey;
  const originalSynth = elevenlabs.synthesizeMp3;

  xtts.health = async function () { return { ok: false }; };
  elevenlabs.hasApiKey = function () { return true; };
  elevenlabs.synthesizeMp3 = async function () { return Buffer.from('fake-mp3'); };

  delete require.cache[require.resolve('./tts-router.js')];
  const tts = require('./tts-router');

  try {
    const out = await tts.synthesizeChunk('Hallo.', 'de-DE');
    assert.equal(out.engine, 'elevenlabs-clone');
    assert.ok(out.buffer.length > 0);
  } finally {
    xtts.health = originalHealth;
    elevenlabs.hasApiKey = originalHasKey;
    elevenlabs.synthesizeMp3 = originalSynth;
    delete require.cache[require.resolve('./tts-router.js')];
  }
});
