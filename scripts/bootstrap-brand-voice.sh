#!/bin/bash
# Einmalig: Lokales XTTS einrichten und Vorlese-Server prüfen.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF="$ROOT/assets/audio/omni-homepage-voice.mp3"

if [[ ! -f "$REF" ]]; then
  echo "Fehlt: $REF"
  exit 1
fi

"$ROOT/scripts/setup-xtts-local.sh"

cd "$ROOT/server"
npm install

echo "Lokales Voice-Cloning bereit. Starten mit: ./scripts/start-local-with-voice.sh"
