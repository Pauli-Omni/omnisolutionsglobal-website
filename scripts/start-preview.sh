#!/bin/bash
# Lokale Vorschau (Website + i18n + Thai via ElevenLabs) — ohne XTTS-Setup.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_PORT="${LOCAL_WEB_PORT:-8080}"
ELEVEN_ENV="$ROOT/server/elevenlabs.config.env"

if [[ -f "$ELEVEN_ENV" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ELEVEN_ENV"
  set +a
fi

health_ok() {
  curl -sf "http://127.0.0.1:$LOCAL_PORT/health" 2>/dev/null | grep -q '"elevenlabsKeyPresent":true'
}

if lsof -ti :"$LOCAL_PORT" >/dev/null 2>&1; then
  if health_ok; then
    echo "Server läuft bereits (ElevenLabs OK): http://localhost:$LOCAL_PORT/index.html"
    exit 0
  fi
  echo "Alter Server ohne ElevenLabs — starte neu …"
  lsof -ti :"$LOCAL_PORT" | xargs kill -9 2>/dev/null || true
  sleep 1
fi

export PORT="$LOCAL_PORT"
export LOCAL_WEB_PORT="$LOCAL_PORT"

echo "Starte Vorschau-Server …"
echo "Öffnen: http://localhost:$LOCAL_PORT/index.html?lang=th"
echo ""
echo "Vorlesen:"
echo "  • Thai: ElevenLabs (server/elevenlabs.config.env)"
echo "  • DE/PL/…: optional ./scripts/start-local-with-voice.sh (XTTS)"
echo "  • Immer http://localhost:$LOCAL_PORT/ — nicht HTML-Datei direkt"
echo ""

cd "$ROOT/server"
exec npm start
