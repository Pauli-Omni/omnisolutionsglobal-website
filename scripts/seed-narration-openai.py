#!/usr/bin/env python3
"""Erzeugt Vorlese-MP3s (lokaler Dev-Seed) bis die Marken-Stimme aktiv ist."""
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / 'assets' / 'locales'
OUT = ROOT / 'assets' / 'audio' / 'narration'
ENV_CANDIDATES = [
    ROOT / 'server' / '.env',
    ROOT / '.env',
    ROOT.parent / 'Pauli Best Price' / '.env',
]

PAGE_KEYS = [
    'pauli', 'omnicad', 'omnigate', 'omniqr', 'omnifix',
    'omnibot', 'omniaiQr', 'omnitalk'
]
LANG_BCP = {'de': 'de-DE'}


def load_openai_key() -> str:
    for env_path in ENV_CANDIDATES:
        if not env_path.exists():
            continue
        for line in env_path.read_text(encoding='utf-8').splitlines():
            if line.startswith('OPENAI_API_KEY='):
                val = line.split('=', 1)[1].strip()
                if val:
                    return val
    return ''


def strip_html(html: str) -> str:
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html or '')).strip()


def tts_mp3(api_key: str, text: str) -> bytes:
    payload = json.dumps({
        'model': 'gpt-4o-mini-tts',
        'voice': 'onyx',
        'input': text,
        'response_format': 'mp3'
    }).encode('utf-8')
    req = urllib.request.Request(
        'https://api.openai.com/v1/audio/speech',
        data=payload,
        headers={
            'Authorization': 'Bearer ' + api_key,
            'Content-Type': 'application/json'
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=180) as res:
        return res.read()


def main() -> int:
    api_key = load_openai_key()
    if not api_key:
        print('OPENAI_API_KEY fehlt (server/.env oder Pauli Best Price/.env)', file=sys.stderr)
        return 1

    locale_path = LOCALES / 'de.json'
    locale = json.loads(locale_path.read_text(encoding='utf-8'))

    for pk in PAGE_KEYS:
        if pk not in locale:
            continue
        for view, field in [('front', 'frontWerbetext'), ('desc', 'pageDesc')]:
            text = strip_html(locale[pk][field])
            if not text:
                continue
            out_dir = OUT / pk / view
            out_dir.mkdir(parents=True, exist_ok=True)
            out_file = out_dir / 'de-DE.mp3'
            if out_file.exists() and out_file.stat().st_size > 1000:
                print('skip', out_file.relative_to(ROOT))
                continue
            print('generating', out_file.relative_to(ROOT))
            out_file.write_bytes(tts_mp3(api_key, text))

    print('done')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
