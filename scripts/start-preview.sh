#!/bin/bash
# Lokale Vorschau (Website + i18n) — ohne XTTS/Voice-Setup.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_PORT="${LOCAL_WEB_PORT:-8080}"

if lsof -ti :"$LOCAL_PORT" >/dev/null 2>&1; then
  echo "Server läuft bereits: http://localhost:$LOCAL_PORT/index.html"
  exit 0
fi

export PORT="$LOCAL_PORT"
export LOCAL_WEB_PORT="$LOCAL_PORT"

echo "Starte Vorschau-Server …"
echo "Öffnen: http://localhost:$LOCAL_PORT/index.html"
echo ""
echo "Hinweis Vorlesen:"
echo "  • Deutsch/Polnisch/…: ./scripts/start-local-with-voice.sh (lokaler XTTS-Klon)"
echo "  • Thai/Vietnamesisch: start-preview.sh reicht — ElevenLabs (server/elevenlabs.config.env)"
echo "  • Immer öffnen: http://localhost:$LOCAL_PORT/ (nicht HTML-Datei direkt)"
echo ""

cd "$ROOT/server"
exec npm start
