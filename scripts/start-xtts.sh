#!/bin/bash
# Startet lokalen XTTS Voice-Clone Daemon (Python 3.10+ empfohlen).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE_LOGIK="$ROOT/02_Quellcode/Core_Logik"
VENV="$ROOT/.venv-xtts"
PY="$VENV/bin/python"

if [[ ! -x "$PY" ]]; then
  echo "XTTS venv fehlt. Einmalig:"
  echo "  python3.10 -m venv $VENV"
  echo "  $VENV/bin/pip install -r $CORE_LOGIK/xtts/requirements.txt"
  exit 1
fi

"$ROOT/scripts/prepare-voice-reference.sh"
exec "$PY" "$CORE_LOGIK/xtts/xtts_daemon.py" --reference "$ROOT/assets/audio/voice_reference_template.wav"
