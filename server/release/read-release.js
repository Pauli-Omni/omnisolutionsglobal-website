'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_RELEASE = {
  buildId: '0',
  termsVersion: '0',
  agbPdfVersion: '2026',
  minNativeAppVersion: '1.0.0'
};

function releaseFilePath(siteRoot) {
  return path.join(siteRoot, 'assets', 'config', 'release.json');
}

function readRelease(siteRoot) {
  const filePath = releaseFilePath(siteRoot);
  if (!fs.existsSync(filePath)) {
    return Object.assign({}, DEFAULT_RELEASE);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return {
    buildId: String(raw.buildId || DEFAULT_RELEASE.buildId),
    termsVersion: String(raw.termsVersion || DEFAULT_RELEASE.termsVersion),
    agbPdfVersion: String(raw.agbPdfVersion || DEFAULT_RELEASE.agbPdfVersion),
    minNativeAppVersion: String(raw.minNativeAppVersion || DEFAULT_RELEASE.minNativeAppVersion)
  };
}

function writeRelease(siteRoot, release) {
  const filePath = releaseFilePath(siteRoot);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const payload = {
    buildId: String(release.buildId),
    termsVersion: String(release.termsVersion),
    agbPdfVersion: String(release.agbPdfVersion),
    minNativeAppVersion: String(release.minNativeAppVersion)
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  return payload;
}

function bumpBuildId(current) {
  const m = String(current || '0').match(/^(\d{4}\.\d{2}\.\d{2})\.(\d+)$/);
  if (m) {
    return m[1] + '.' + (Number(m[2]) + 1);
  }
  const d = new Date();
  const pad = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + '.1';
}

module.exports = {
  DEFAULT_RELEASE,
  releaseFilePath,
  readRelease,
  writeRelease,
  bumpBuildId
};
