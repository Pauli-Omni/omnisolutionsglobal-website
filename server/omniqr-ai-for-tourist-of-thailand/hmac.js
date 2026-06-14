'use strict';

const crypto = require('crypto');

function signPayment(secret, transactionId, amountThb, userId, timestamp) {
  const ts = timestamp != null ? Number(timestamp) : Math.floor(Date.now() / 1000);
  const amount = Number(amountThb).toFixed(2);
  const message = `${transactionId}|${amount}|${userId}|${ts}`;
  const digest = crypto.createHmac('sha256', String(secret)).update(message, 'utf8').digest('hex');
  return { signature: digest, timestamp: ts };
}

function verifyPayment(secret, transactionId, amountThb, userId, timestamp, signature, maxAgeSec) {
  if (!signature || timestamp == null) return false;
  const { signature: expected } = signPayment(secret, transactionId, amountThb, userId, timestamp);
  const sigBuf = Buffer.from(String(signature), 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(expBuf, sigBuf)) return false;
  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  return age <= Number(maxAgeSec || 300);
}

module.exports = { signPayment, verifyPayment };
