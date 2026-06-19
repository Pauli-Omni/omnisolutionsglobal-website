'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validatePayload } = require('./support/handler');
const { nextTicketNumber } = require('./support/ticket-store');

test('support payload validation', function () {
  assert.equal(validatePayload({}).error, 'name_required');
  assert.equal(validatePayload({ name: 'Ada' }).error, 'message_required');
  const ok = validatePayload({
    name: 'Ada Lovelace',
    phone: '+66 81 234 5678',
    message: 'QR scan failed on market stall.',
    diagnostics: { deviceModel: 'iPhone 15', osVersion: 'iOS 17.4' }
  });
  assert.equal(ok.error, undefined);
  assert.equal(ok.name, 'Ada Lovelace');
  assert.equal(ok.diagnostics.deviceModel, 'iPhone 15');
});

test('ticket number format', function () {
  const ticket = nextTicketNumber();
  const year = new Date().getFullYear();
  assert.match(ticket, new RegExp('^#OMNI-' + year + '-\\d{4}$'));
});
