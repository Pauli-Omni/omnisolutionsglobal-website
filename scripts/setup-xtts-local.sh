#!/bin/bash
# Einmalig: Lokaler Voice-Clone (XTTS) — nutzt Ihre Referenz-MP3 nur auf diesem Computer.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="$ROOT/.venv-xtts"

"$ROOT/scripts/prepare-voice-reference.sh"

PY_BIN=""
PY_VER=""
for candidate in python3.12 python3.11 python3.10; do
  if command -v "$candidate" >/dev/null 2>&1; then
    ver=$("$candidate" -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    major=${ver%%.*}
    minor=${ver#*.}
    if [[ "$major" -eq 3 && "$minor" -ge 10 ]]; then
      PY_BIN="$candidate"
      PY_VER="$ver"
      break
    fi
  fi
done

if [[ -z "$PY_BIN" ]]; then
  echo "FEHLER: Python 3.10 oder neuer wird benötigt (XTTS)."
  echo "Installieren Sie z. B. python3.11 (Homebrew: brew install python@3.11)"
  echo "Dann: PYTHON_BIN=python3.11 ./scripts/setup-xtts-local.sh"
  exit 1
fi

if [[ -x "$VENV/bin/python" ]]; then
  cur=$("$VENV/bin/python" -c 'import sys; print(".".join(map(str, sys.version_info[:2])))' 2>/dev/null || echo "0.0")
  cmin=${cur#*.}
  if [[ "${cur%%.*}" -lt 3 || "$cmin" -lt 10 ]]; then
    echo "Entferne alte XTTS-Umgebung (Python $cur — zu alt) …"
    rm -rf "$VENV"
  fi
fi

if [[ ! -x "$VENV/bin/python" ]]; then
  echo "Erstelle XTTS-Umgebung mit $PY_BIN ($PY_VER) …"
  "$PY_BIN" -m venv "$VENV"
fi

echo "Installiere XTTS-Abhängigkeiten (kann einige Minuten dauern) …"
"$VENV/bin/pip" install --upgrade pip
"$VENV/bin/pip" install -r "$ROOT/server/xtts/requirements.txt"

echo "Fertig. Starten mit: ./scripts/start-local-with-voice.sh"
