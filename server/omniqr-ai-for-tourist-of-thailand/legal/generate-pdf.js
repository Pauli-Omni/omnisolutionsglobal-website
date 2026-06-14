'use strict';

const fs = require('fs');
const path = require('path');
const { AGB_DOCUMENT, PDF_FILENAME } = require('./agb-canonical-de');
const { buildPdf } = require('./minimal-pdf');

const OUT_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'omniqr-ai-for-tourist-of-thailand',
  'legal'
);
const OUT_FILE = path.join(OUT_DIR, PDF_FILENAME);

function generatePdfBuffer() {
  const lines = [
    AGB_DOCUMENT.title,
    AGB_DOCUMENT.subtitle,
    ''
  ];

  AGB_DOCUMENT.sections.forEach(function (section) {
    lines.push(section.heading);
    section.paragraphs.forEach(function (para) {
      lines.push(para);
      lines.push('');
    });
  });

  lines.push('Omni Solutions Global - Koenigreich Thailand - ' + AGB_DOCUMENT.version);
  return buildPdf(lines);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  const buffer = generatePdfBuffer();
  fs.writeFileSync(OUT_FILE, buffer);
  console.log('Wrote', OUT_FILE, '(' + buffer.length + ' bytes)');
}

if (require.main === module) {
  main().catch(function (err) {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { generatePdfBuffer, OUT_FILE, PDF_FILENAME };
