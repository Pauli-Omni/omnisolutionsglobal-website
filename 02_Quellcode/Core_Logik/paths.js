'use strict';

const path = require('path');

/** Repository root (HTML, assets, js — unverändert im Root). */
const SITE_ROOT = path.join(__dirname, '..', '..');

module.exports = { SITE_ROOT };
