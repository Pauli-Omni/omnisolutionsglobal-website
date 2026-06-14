'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { signPayment, verifyPayment } = require('./hmac');
const { validateQrPayment, buildPromptPayQr } = require('./emvco');
const { clientIp } = require('./armor');
const { handleSupportRequest } = require('./support/handler');

const BASE = '/omniqr-ai-for-tourist-of-thailand/api';

function getSecret() {
  const key = process.env.OMNI_SECRET_KEY || process.env.OMNI_QR_PAY_HMAC_SECRET;
  if (key) return key;
  if (process.env.OMNI_DEV_MODE === '0') {
    throw new Error('OMNI_SECRET_KEY missing');
  }
  return 'OMNI_DEV_SECRET_CHANGE_IN_PRODUCTION';
}

function getMaxAge() {
  return Number(process.env.OMNI_HMAC_MAX_AGE || 300);
}

function getMaxAmount() {
  return Number(process.env.OMNI_MAX_AMOUNT_THB || 2000000);
}

function createRouter() {
  const router = express.Router();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.OMNI_QR_RATE_MAX || 40),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'rate_limited' },
    keyGenerator: function (req) { return clientIp(req); }
  });

  router.use(limiter);

  const supportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: Number(process.env.OMNI_SUPPORT_RATE_MAX || 8),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'support_rate_limited' },
    keyGenerator: function (req) { return clientIp(req); }
  });

  router.get('/demo-qr', function (_req, res) {
    res.json({
      ok: true,
      qrPayload: buildPromptPayQr('0812345678', 500),
      amount_thb: 500
    });
  });

  router.get('/health', function (_req, res) {
    res.json({
      ok: true,
      service: 'omniqr-ai-for-tourist-of-thailand',
      payment_live: process.env.OMNI_PAYMENT_LIVE === '1',
      hmac: true
    });
  });

  router.post('/preview', function (req, res) {
    const body = req.body || {};
    const qrPayload = String(body.qrPayload || '').trim();
    const marketAmount = body.marketAmountThb != null ? Number(body.marketAmountThb) : null;

    if (!qrPayload) {
      res.status(400).json({ error: 'missing_qr' });
      return;
    }

    const quote = validateQrPayment(qrPayload, marketAmount, getMaxAmount());
    if (!quote.success) {
      res.status(422).json(quote);
      return;
    }

    res.json({
      ok: true,
      preview: quote,
      client_ip_masked: clientIp(req).replace(/\d+$/, 'xxx')
    });
  });

  router.post('/authorize', function (req, res) {
    const body = req.body || {};
    const qrPayload = String(body.qrPayload || '').trim();
    const userId = String(body.userId || '').trim() || `web_${crypto.randomBytes(6).toString('hex')}`;
    const txId = String(body.transactionId || '').trim() || `TX-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const marketAmount = body.marketAmountThb != null ? Number(body.marketAmountThb) : null;

    if (!qrPayload) {
      res.status(400).json({ error: 'missing_qr' });
      return;
    }

    const quote = validateQrPayment(qrPayload, marketAmount, getMaxAmount());
    if (!quote.success) {
      res.status(422).json(quote);
      return;
    }

    const secret = getSecret();
    const seal = signPayment(secret, txId, quote.amount_thb, userId);

    const incomingSig = body.integritySignature;
    const incomingTs = body.integrityTimestamp;
    if (incomingSig && incomingTs != null) {
      const valid = verifyPayment(
        secret,
        txId,
        quote.amount_thb,
        userId,
        incomingTs,
        incomingSig,
        getMaxAge()
      );
      if (!valid) {
        res.status(403).json({ error: 'integrity_invalid' });
        return;
      }
    }

    const live = process.env.OMNI_PAYMENT_LIVE === '1';
    res.json({
      ok: true,
      transaction_id: txId,
      user_id: userId,
      amount_thb: quote.amount_thb,
      merchant_id: quote.merchant_id,
      integrity_hash: seal.signature,
      integrity_timestamp: seal.timestamp,
      status: live ? 'payment_authorized' : 'authorization_recorded',
      payment_live: live
    });
  });

  router.post('/verify-seal', function (req, res) {
    const body = req.body || {};
    const valid = verifyPayment(
      getSecret(),
      String(body.transactionId || ''),
      Number(body.amountThb),
      String(body.userId || ''),
      Number(body.integrityTimestamp),
      String(body.integritySignature || ''),
      getMaxAge()
    );
    res.json({ ok: valid });
  });

  router.post('/support', supportLimiter, function (req, res) {
    handleSupportRequest(req)
      .then(function (result) {
        res.status(result.status).json(result.body);
      })
      .catch(function () {
        res.status(500).json({ ok: false, error: 'support_failed' });
      });
  });

  return router;
}

module.exports = { createRouter, BASE };
