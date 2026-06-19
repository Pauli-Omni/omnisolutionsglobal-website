'use strict';

const fs = require('fs');
const path = require('path');
const { readRelease, writeRelease, bumpBuildId } = require('../release/read-release');
const { SITE_ROOT } = require('../paths');
const RELEASE_BLOCK_RE = /<!-- osg-release -->[\s\S]*?<!-- \/osg-release -->\n?/g;

function shouldSkipDir(name) {
  return name === '.venv' || name === '.venv-xtts' || name === 'node_modules' || name.startsWith('.');
}

function collectHtmlFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (entry.name.startsWith('.')) return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) return;
      collectHtmlFiles(full, out);
      return;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(full);
    }
  });
}

function jsPrefixForHtml(htmlPath) {
  const relDir = path.relative(SITE_ROOT, path.dirname(htmlPath));
  if (!relDir || relDir === '.') return 'js/';
  const depth = relDir.split(path.sep).filter(Boolean).length;
  return '../'.repeat(depth) + 'js/';
}

function stampQueryUrls(html, buildId) {
  var next = html.replace(/\?v=[^"'&\s>]+/g, '?v=' + buildId);
  next = next.replace(
    /(\b(?:href|src)=["'])((?:\.\.\/)*(?:css|js)\/[^"']+\.(?:css|js))(["'])/g,
    function (_m, pre, url, post) {
      if (url.indexOf('?v=') >= 0) return pre + url + post;
      return pre + url + '?v=' + buildId + post;
    }
  );
  return next;
}

var VIEWPORT_META =
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';

function normalizeViewport(html) {
  if (/<meta name="viewport"[^>]*>/i.test(html)) {
    return html.replace(/<meta name="viewport"[^>]*>/i, VIEWPORT_META);
  }
  if (/<head>\n/i.test(html)) {
    return html.replace(/(<head>\n)/i, '$1  ' + VIEWPORT_META + '\n');
  }
  return html;
}

function injectReleaseBlock(html, buildId, guardSrc) {
  var cleaned = html.replace(RELEASE_BLOCK_RE, '');
  var block =
    '<!-- osg-release -->\n' +
    '  <meta name="osg-build-id" content="' + buildId + '">\n' +
    '  <script src="' + guardSrc + 'release-guard.js?v=' + buildId + '"></script>\n' +
    '  <!-- /osg-release -->\n';

  if (/<meta name="viewport"[^>]*>\n/i.test(cleaned)) {
    return cleaned.replace(/(<meta name="viewport"[^>]*>\n)/i, '$1' + block);
  }
  if (/<head>\n/i.test(cleaned)) {
    return cleaned.replace(/(<head>\n)/i, '$1' + block);
  }
  return cleaned;
}

function updateVoiceConfig(buildId) {
  const filePath = path.join(SITE_ROOT, 'js', 'osg-voice-config.js');
  if (!fs.existsSync(filePath)) return;
  var src = fs.readFileSync(filePath, 'utf8');
  var next = src.replace(
    /assetVersion:\s*['"][^'"]*['"]/,
    "assetVersion: '" + buildId + "'"
  );
  if (next !== src) {
    fs.writeFileSync(filePath, next, 'utf8');
  }
}

function main() {
  var bump = process.argv.indexOf('--bump') >= 0;
  var release = readRelease(SITE_ROOT);
  if (bump) {
    release.buildId = bumpBuildId(release.buildId);
    writeRelease(SITE_ROOT, release);
    console.log('Bumped buildId ->', release.buildId);
  }

  var buildId = release.buildId;
  var htmlFiles = [];
  collectHtmlFiles(SITE_ROOT, htmlFiles);

  var stamped = 0;
  htmlFiles.forEach(function (htmlPath) {
    var rel = path.relative(SITE_ROOT, htmlPath);
    if (rel.indexOf('.venv') >= 0) return;

    var guardSrc = jsPrefixForHtml(htmlPath);
    var original = fs.readFileSync(htmlPath, 'utf8');
    var updated = normalizeViewport(original);
    updated = injectReleaseBlock(updated, buildId, guardSrc);
    updated = stampQueryUrls(updated, buildId);

    if (updated !== original) {
      fs.writeFileSync(htmlPath, updated, 'utf8');
      stamped += 1;
      console.log('stamped', rel);
    }
  });

  updateVoiceConfig(buildId);
  console.log('Release stamp complete. buildId=' + buildId + ' files=' + stamped);
}

main();
