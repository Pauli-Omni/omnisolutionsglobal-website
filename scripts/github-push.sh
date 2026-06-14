#!/bin/bash
# Website zu GitHub senden (nach einmaliger SSH-Key-Einrichtung).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
git status -sb
git push origin main
