#!/bin/bash
# Erzeugt deploy/omnisolutionsglobal-webseite-upload.zip für cPanel/Render/manuelles Hosting.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/deploy/omnisolutionsglobal-webseite-upload.zip"
mkdir -p "$ROOT/deploy"
cd "$ROOT"
rm -f "$OUT"
zip -r "$OUT" . \
  -x "./deploy/omnisolutionsglobal-webseite-upload.zip" \
  -x "./deploy/*.zip" \
  -x "./.DS_Store" \
  -x "*/.DS_Store" \
  -x "./.git/*" \
  -x "./.git"
echo ""
echo "✓ Upload-Paket erstellt:"
ls -lh "$OUT"
