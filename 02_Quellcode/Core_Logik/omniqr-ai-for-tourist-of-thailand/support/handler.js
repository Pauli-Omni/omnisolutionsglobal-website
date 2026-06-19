'use strict';

const { nextTicketNumber } = require('./ticket-store');
const { lookupGeo } = require('./geo');
const { deliverTicket } = require('./mailer');
const { clientIp } = require('../armor');

const NAME_MAX = 120;
const PHONE_MAX = 40;
const MESSAGE_MAX = 2000;

function sanitizeText(value, maxLen) {
  return String(value || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

function validatePayload(body) {
  const name = sanitizeText(body && body.name, NAME_MAX);
  const phone = sanitizeText(body && body.phone, PHONE_MAX);
  const message = sanitizeText(body && body.message, MESSAGE_MAX);

  if (!name) return { error: 'name_required' };
  if (!message) return { error: 'message_required' };

  const diag = body && body.diagnostics && typeof body.diagnostics === 'object'
    ? body.diagnostics
    : {};

  return {
    name: name,
    phone: phone,
    message: message,
    diagnostics: {
      deviceModel: sanitizeText(diag.deviceModel, 120),
      osVersion: sanitizeText(diag.osVersion, 80),
      userAgent: sanitizeText(diag.userAgent, 512)
    }
  };
}

async function handleSupportRequest(req) {
  const parsed = validatePayload(req.body);
  if (parsed.error) {
    return { status: 400, body: { ok: false, error: parsed.error } };
  }

  const ip = clientIp(req);
  const geo = await lookupGeo(ip);
  const ticketNumber = nextTicketNumber();
  const receivedAt = new Date().toISOString();

  const ticket = {
    ticketNumber: ticketNumber,
    receivedAt: receivedAt,
    name: parsed.name,
    phone: parsed.phone,
    message: parsed.message,
    diagnostics: {
      deviceModel: parsed.diagnostics.deviceModel || 'unknown',
      osVersion: parsed.diagnostics.osVersion || 'unknown',
      userAgent: parsed.diagnostics.userAgent || 'unknown',
      ip: ip,
      geoLabel: geo.label,
      geoCity: geo.city,
      geoRegion: geo.region,
      geoCountry: geo.country
    }
  };

  const delivery = await deliverTicket(ticket);

  return {
    status: 200,
    body: {
      ok: true,
      ticketNumber: ticketNumber,
      emailSent: delivery.emailSent
    },
    _internal: delivery
  };
}

module.exports = {
  validatePayload,
  handleSupportRequest,
  NAME_MAX,
  MESSAGE_MAX
};
