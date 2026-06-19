'use strict';

// CRITICAL: DO NOT HARDCODE LANGUAGES. ALWAYS USE GLOBAL I18N SYSTEM. PARSE ABBREVIATIONS VIA PAULI-METHOD ONLY.

const PROMPTPAY_AID = 'A000000677010111';
const THB_CURRENCY = '764';

function crc16CcittFalse(data) {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data[i] << 8;
    for (let b = 0; b < 8; b += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc;
}

function parseTlv(payload) {
  const tags = [];
  let index = 0;
  while (index + 4 <= payload.length) {
    const tag = payload.slice(index, index + 2);
    const valueLen = parseInt(payload.slice(index + 2, index + 4), 10);
    if (Number.isNaN(valueLen)) throw new Error('invalid_tlv');
    const start = index + 4;
    const end = start + valueLen;
    if (end > payload.length) throw new Error('incomplete_tlv');
    tags.push([tag, payload.slice(start, end)]);
    index = end;
  }
  if (index !== payload.length) throw new Error('trailing_tlv');
  return tags;
}

function tlvToDict(tags) {
  const out = {};
  tags.forEach(function (pair) { out[pair[0]] = pair[1]; });
  return out;
}

function validateCrc(payload) {
  const upper = payload.toUpperCase();
  const match = upper.match(/6304([0-9A-F]{4})$/);
  if (!match) return false;
  const dataPart = payload.slice(0, match.index);
  const expected = parseInt(match[1], 16);
  return crc16CcittFalse(Buffer.from(dataPart, 'ascii')) === expected;
}

function extractPromptpayId(merchantBlock) {
  const nested = tlvToDict(parseTlv(merchantBlock));
  if (nested['01']) return nested['01'].slice(0, 15);
  const alnum = merchantBlock.replace(/[^A-Za-z0-9]/g, '');
  return alnum.slice(0, 15) || 'PROMPTPAY-ID';
}

function parseEmvcoQr(qrPayload) {
  const result = {
    status: 'INVALID',
    amount_thb: 0,
    merchant_id: '',
    currency: '',
    is_dynamic: false,
    crc_valid: false
  };
  if (!qrPayload || !qrPayload.startsWith('000201')) return result;
  if (!validateCrc(qrPayload)) {
    result.status = 'CRC_ERROR';
    return result;
  }
  result.crc_valid = true;
  try {
    const tags = tlvToDict(parseTlv(qrPayload));
    result.is_dynamic = tags['01'] === '11';
    const merchantBlock = tags['29'] || tags['30'] || '';
    if (merchantBlock) result.merchant_id = extractPromptpayId(merchantBlock);
    if (tags['54']) result.amount_thb = parseFloat(tags['54']);
    result.currency = tags['58'] || '';
    result.status = 'SUCCESS';
  } catch (e) {
    result.status = 'ERROR';
  }
  return result;
}

function validateQrPayment(qrPayload, marketAmountThb, maxAmountThb) {
  const qr = parseEmvcoQr(qrPayload);
  if (qr.status === 'CRC_ERROR') return { success: false, error: 'CRC_FAIL' };
  if (qr.status !== 'SUCCESS') return { success: false, error: 'QR_FORMAT' };
  if (String(qr.currency || THB_CURRENCY) !== THB_CURRENCY) return { success: false, error: 'NOT_THB' };

  let amountThb = qr.amount_thb;
  const isStatic = amountThb <= 0;
  if (isStatic) {
    if (!marketAmountThb || marketAmountThb <= 0) {
      return { success: false, error: 'AMOUNT_REQUIRED', is_static_qr: true };
    }
    amountThb = Number(marketAmountThb);
  }
  if (amountThb > Number(maxAmountThb || 2000000)) {
    return { success: false, error: 'AMOUNT_TOO_HIGH' };
  }
  return {
    success: true,
    merchant_id: qr.merchant_id,
    amount_thb: amountThb,
    is_static_qr: isStatic,
    payment_live: process.env.OMNI_PAYMENT_LIVE === '1'
  };
}

function buildTlv(tag, value) {
  return `${tag}${String(value.length).padStart(2, '0')}${value}`;
}

function buildPromptPayQr(promptpayId, amountThb) {
  const inner = buildTlv('00', PROMPTPAY_AID) + buildTlv('01', promptpayId);
  const amountStr = Number(amountThb).toFixed(2);
  let payload = buildTlv('00', '01')
    + buildTlv('01', '11')
    + buildTlv('29', inner)
    + buildTlv('54', amountStr)
    + buildTlv('58', THB_CURRENCY);
  const crc = crc16CcittFalse(Buffer.from(payload, 'ascii'));
  return payload + `6304${crc.toString(16).toUpperCase().padStart(4, '0')}`;
}

module.exports = {
  PROMPTPAY_AID,
  parseEmvcoQr,
  validateQrPayment,
  validateCrc,
  buildPromptPayQr
};
