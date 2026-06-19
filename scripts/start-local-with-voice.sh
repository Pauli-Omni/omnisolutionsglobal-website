#!/bin/bash
# Lokal: Website + XTTS Voice-Clone auf Port 8080 — alles bleibt auf diesem Computer.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL_PORT="${LOCAL_WEB_PORT:-8080}"
XTTS_PORT="${XTTS_PORT:-8788}"
VENV="$ROOT/.venv-xtts"

CORE_LOGIK="$ROOT/02_Quellcode/Core_Logik"

# shellcheck disable=SC1090
[ -f "$CORE_LOGIK/.env" ] && source "$CORE_LOGIK/.env"

export PORT="$LOCAL_PORT"
export LOCAL_WEB_PORT="$LOCAL_PORT"
export XTTS_PORT="$XTTS_PORT"
export XTTS_SERVICE_URL="${XTTS_SERVICE_URL:-http://127.0.0.1:$XTTS_PORT}"
export BRAND_TTS_ENGINE="xtts"
export COQUI_TOS_AGREED="1"
export TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD="1"

"$ROOT/scripts/prepare-voice-reference.sh"

if [[ ! -x "$VENV/bin/python" ]]; then
  echo "FEHLER: Lokales XTTS ist nicht eingerichtet."
  echo "Einmalig ausführen: ./scripts/setup-xtts-local.sh"
  exit 1
fi

if ! "$VENV/bin/python" -c "import TTS" 2>/dev/null; then
  echo "FEHLER: XTTS-Pakete fehlen in .venv-xtts"
  echo "Bitte erneut: ./scripts/setup-xtts-local.sh"
  exit 1
fi

XTTS_PID=""
echo "Starte lokalen XTTS Voice-Clone (Port $XTTS_PORT) …"
"$VENV/bin/python" "$CORE_LOGIK/xtts/xtts_daemon.py" \
  --reference "$ROOT/assets/audio/voice_reference_template.wav" &
XTTS_PID=$!

if lsof -ti :"$LOCAL_PORT" >/dev/null 2>&1; then
  echo "FEHLER: Port $LOCAL_PORT ist bereits belegt."
  echo "Bitte zuerst freigeben: lsof -ti :$LOCAL_PORT | xargs kill -9"
  [[ -n "$XTTS_PID" ]] && kill "$XTTS_PID" 2>/dev/null || true
  exit 1
fi

cleanup() {
  [[ -n "$XTTS_PID" ]] && kill "$XTTS_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Website + lokales Vorlesen: http://localhost:$LOCAL_PORT"
echo "Health-Check:               http://localhost:$LOCAL_PORT/health"
echo "Referenz-Stimme (lokal):    $ROOT/assets/audio/omni-homepage-voice.mp3"

cd "$CORE_LOGIK"
npm start
