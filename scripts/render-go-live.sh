#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/render-deploy.js
node scripts/render-set-secrets.js
echo ""
echo "Deploy gestartet. In 2–3 Minuten testen:"
echo "  https://omnisolutionsglobal-web.onrender.com/health"
echo "  https://omnisolutionsglobal-web.onrender.com/impressum.html"
