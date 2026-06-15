#!/usr/bin/env node
'use strict';

/**
 * Fix MP4 movie header (mvhd) duration to match longest track (mdhd).
 * Sora extensions often leave mvhd too short — browsers stop playback early.
 */

const fs = require('fs');
const path = require('path');

function readTrackMaxDuration(data) {
  let maxDur = 0;
  let pos = 0;
  while (pos < data.length) {
    const idx = data.indexOf(Buffer.from('mdhd'), pos);
    if (idx < 0) break;
    const version = data[idx + 4];
    let timescale = 0;
    let duration = 0;
    if (version === 0) {
      timescale = data.readUInt32BE(idx + 16);
      duration = data.readUInt32BE(idx + 20);
    } else if (version === 1) {
      timescale = data.readUInt32BE(idx + 24);
      duration = Number(data.readBigUInt64BE(idx + 28));
    }
    if (timescale > 0) maxDur = Math.max(maxDur, duration / timescale);
    pos = idx + 4;
  }
  return maxDur;
}

function readMovieDuration(data) {
  const idx = data.indexOf(Buffer.from('mvhd'));
  if (idx < 0) return 0;
  const version = data[idx + 4];
  if (version === 0) {
    const timescale = data.readUInt32BE(idx + 16);
    const duration = data.readUInt32BE(idx + 20);
    return timescale ? duration / timescale : 0;
  }
  if (version === 1) {
    const timescale = data.readUInt32BE(idx + 28);
    const duration = Number(data.readBigUInt64BE(idx + 32));
    return timescale ? duration / timescale : 0;
  }
  return 0;
}

function patchMovieDuration(filePath) {
  const buf = fs.readFileSync(filePath);
  const idx = buf.indexOf(Buffer.from('mvhd'));
  if (idx < 0) throw new Error('mvhd not found: ' + filePath);

  const trackSec = readTrackMaxDuration(buf);
  if (trackSec < 1) throw new Error('no track duration: ' + filePath);

  const version = buf[idx + 4];
  const out = Buffer.from(buf);
  let timescale = 0;

  if (version === 0) {
    timescale = out.readUInt32BE(idx + 16);
    const ticks = Math.round(trackSec * timescale);
    out.writeUInt32BE(ticks, idx + 20);
  } else if (version === 1) {
    timescale = out.readUInt32BE(idx + 28);
    const ticks = BigInt(Math.round(trackSec * timescale));
    out.writeBigUInt64BE(ticks, idx + 32);
  } else {
    throw new Error('unsupported mvhd version: ' + version);
  }

  fs.writeFileSync(filePath, out);
  const after = readMovieDuration(out);
  return { trackSec, before: readMovieDuration(buf), after, timescale };
}

function main() {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error('Usage: node scripts/fix-mp4-movie-duration.js <file.mp4> [...]');
    process.exit(1);
  }

  files.forEach(function (file) {
    const abs = path.resolve(file);
    const result = patchMovieDuration(abs);
    console.log(
      path.basename(abs) + ': movie ' + result.before.toFixed(2) + 's → ' +
      result.after.toFixed(2) + 's (track ' + result.trackSec.toFixed(2) + 's)'
    );
  });
}

module.exports = { patchMovieDuration, readTrackMaxDuration, readMovieDuration };

if (require.main === module) main();
