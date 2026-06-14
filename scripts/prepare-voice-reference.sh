#!/bin/bash
# Legt voice_reference_template.wav an (Ziel: 1h Training-Sample des Nutzers).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/assets/audio/voice_reference_template.wav"
CUSTOM="${1:-}"

mkdir -p "$ROOT/assets/audio"

if [[ -n "$CUSTOM" && -f "$CUSTOM" ]]; then
  echo "Nutze Custom-Referenz: $CUSTOM"
  afconvert "$CUSTOM" "$OUT" -d LEI16 2>/dev/null || cp "$CUSTOM" "$OUT"
elif [[ -f "$OUT" && -s "$OUT" ]]; then
  echo "Referenz vorhanden: $OUT"
else
  SRC="$ROOT/assets/audio/omni-homepage-voice.mp3"
  if [[ ! -f "$SRC" ]]; then
    echo "Fehlt: $SRC oder Custom-Pfad als Argument."
    exit 1
  fi
  echo "Zwischen-Referenz aus $SRC (bitte durch 1h-Sample ersetzen)"
  afconvert "$SRC" "$OUT" -d LEI16
fi

ls -lh "$OUT"
