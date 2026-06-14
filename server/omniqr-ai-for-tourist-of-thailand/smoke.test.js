'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { signPayment, verifyPayment } = require('./hmac');
const { validateCrc, parseEmvcoQr, buildPromptPayQr } = require('./emvco');

test('HMAC sign and verify', function () {
  const secret = 'test-secret-key';
  const ts = Math.floor(Date.now() / 1000);
  const seal = signPayment(secret, 'TX-1', 500, 'user_abc', ts);
  assert.equal(seal.signature.length, 64);
  assert.equal(
    verifyPayment(secret, 'TX-1', 500, 'user_abc', ts, seal.signature, 300),
    true
  );
  assert.equal(
    verifyPayment(secret, 'TX-1', 500, 'user_abc', ts, 'bad', 300),
    false
  );
});

test('EMVCo CRC validation', function () {
  const qr = buildPromptPayQr('0812345678', 500);
  assert.equal(validateCrc(qr), true);
  const parsed = parseEmvcoQr(qr);
  assert.equal(parsed.status, 'SUCCESS');
  assert.equal(parsed.amount_thb, 500);
});
