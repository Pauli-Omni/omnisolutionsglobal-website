'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const COUNTER_FILE = path.join(DATA_DIR, 'ticket-counter.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readCounter() {
  ensureDataDir();
  if (!fs.existsSync(COUNTER_FILE)) {
    return { year: new Date().getFullYear(), seq: 0 };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
    return {
      year: Number(raw.year) || new Date().getFullYear(),
      seq: Number(raw.seq) || 0
    };
  } catch (_err) {
    return { year: new Date().getFullYear(), seq: 0 };
  }
}

function writeCounter(state) {
  ensureDataDir();
  fs.writeFileSync(COUNTER_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function nextTicketNumber() {
  const currentYear = new Date().getFullYear();
  const state = readCounter();

  if (state.year !== currentYear) {
    state.year = currentYear;
    state.seq = 0;
  }

  state.seq += 1;
  writeCounter(state);

  const padded = String(state.seq).padStart(4, '0');
  return `#OMNI-${currentYear}-${padded}`;
}

module.exports = {
  nextTicketNumber,
  DATA_DIR
};
