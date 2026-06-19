'use strict';

const fs = require('fs');
const path = require('path');
const { DATA_DIR } = require('./ticket-store');

const SUPPORT_TO = String(process.env.OMNI_SUPPORT_EMAIL || 'support@omnisolutionsglobal.com').trim();

function buildEmailBody(ticket) {
  const lines = [
    'OmniQR-AI for Tourist of Thailand — Support Ticket',
    '==================================================',
    '',
    'Ticket: ' + ticket.ticketNumber,
    'Received: ' + ticket.receivedAt,
    '',
    '--- Customer ---',
    'Name: ' + ticket.name,
    'Phone: ' + (ticket.phone || '(not provided)'),
    '',
    'Message:',
    ticket.message,
    '',
    '--- Diagnostics (support troubleshooting only) ---',
    'Device: ' + (ticket.diagnostics.deviceModel || 'unknown'),
    'OS: ' + (ticket.diagnostics.osVersion || 'unknown'),
    'User-Agent: ' + (ticket.diagnostics.userAgent || 'unknown'),
    'IP: ' + ticket.diagnostics.ip,
    'Location (approx.): ' + ticket.diagnostics.geoLabel,
    '',
    'This diagnostic block is not stored server-side after delivery.',
    'Service: omniqr-ai-for-tourist-of-thailand'
  ];
  return lines.join('\n');
}

function writeOutbox(ticket) {
  const outboxDir = path.join(DATA_DIR, 'support-outbox');
  if (!fs.existsSync(outboxDir)) {
    fs.mkdirSync(outboxDir, { recursive: true });
  }
  const safeId = ticket.ticketNumber.replace(/[^A-Z0-9-]/gi, '');
  const filePath = path.join(outboxDir, safeId + '.eml.txt');
  fs.writeFileSync(filePath, buildEmailBody(ticket), 'utf8');
  return filePath;
}

async function sendViaSmtp(ticket) {
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch (_err) {
    return { sent: false, reason: 'nodemailer_missing' };
  }

  const host = process.env.OMNI_SMTP_HOST;
  const port = Number(process.env.OMNI_SMTP_PORT || 587);
  const user = process.env.OMNI_SMTP_USER;
  const pass = process.env.OMNI_SMTP_PASS;
  const from = process.env.OMNI_SMTP_FROM || user || 'noreply@omnisolutionsglobal.com';

  if (!host || !user || !pass) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: { user: user, pass: pass }
  });

  await transporter.sendMail({
    from: from,
    to: SUPPORT_TO,
    subject: ticket.ticketNumber + ' — OmniQR Support: ' + ticket.name,
    text: buildEmailBody(ticket)
  });

  return { sent: true, reason: 'smtp' };
}

async function deliverTicket(ticket) {
  const outboxPath = writeOutbox(ticket);
  let smtpResult = { sent: false, reason: 'skipped' };

  try {
    smtpResult = await sendViaSmtp(ticket);
  } catch (err) {
    smtpResult = { sent: false, reason: String(err && err.message || err) };
  }

  return {
    to: SUPPORT_TO,
    outboxPath: outboxPath,
    emailSent: smtpResult.sent,
    delivery: smtpResult.reason
  };
}

module.exports = {
  SUPPORT_TO,
  deliverTicket,
  buildEmailBody
};
