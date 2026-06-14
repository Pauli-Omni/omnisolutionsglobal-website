#!/usr/bin/env python3
"""Erzeugt Vorlese-MP3s in der Marken-Stimme über den Brand-TTS-Server."""
import argparse
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / 'assets' / 'locales'
OUT = ROOT / 'assets' / 'audio' / 'narration'

PAGE_KEYS = [
    'pauli', 'omnicad', 'omnigate', 'omniqr', 'omnifix',
    'omnibot', 'omniaiQr', 'omnitalk'
]
LANG_BCP = {
    'de': 'de-DE', 'en': 'en-US', 'th': 'th-TH', 'pl': 'pl-PL', 'ru': 'ru-RU', 'zh': 'zh-CN',
    'fr': 'fr-FR', 'es': 'es-ES', 'it': 'it-IT', 'pt': 'pt-PT', 'nl': 'nl-NL',
    'ar': 'ar-SA', 'ja': 'ja-JP', 'ko': 'ko-KR', 'vi': 'vi-VN', 'tr': 'tr-TR', 'hi': 'hi-IN', 'id': 'id-ID'
}
DEFAULT_LANGS = 'de,en,th,pl,ru,zh,fr,es,it,pt,nl,ar,ja,ko,vi,tr,hi,id'


def strip_html(html: str) -> str:
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html or '')).strip()


def fetch_tts(endpoint: str, text: str, lang: str) -> bytes:
    payload = json.dumps({'text': text, 'lang': lang}).encode('utf-8')
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={'Content-Type': 'application/json', 'Accept': 'audio/mpeg'},
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=120) as res:
        return res.read()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--endpoint', required=True)
    parser.add_argument('--langs', default=DEFAULT_LANGS)
    args = parser.parse_args()
    langs = [x.strip() for x in args.langs.split(',') if x.strip()]

    for lang in langs:
        locale_path = LOCALES / f'{lang}.json'
        if not locale_path.exists():
            print('skip missing', locale_path, file=sys.stderr)
            continue
        locale = json.loads(locale_path.read_text(encoding='utf-8'))
        bcp = LANG_BCP.get(lang, lang)

        for pk in PAGE_KEYS:
            if pk not in locale:
                continue
            for view, field in [('front', 'frontWerbetext'), ('desc', 'pageDesc')]:
                text = strip_html(locale[pk][field])
                if not text:
                    continue
                out_dir = OUT / pk / view
                out_dir.mkdir(parents=True, exist_ok=True)
                out_file = out_dir / f'{bcp}.mp3'
                print('generating', out_file.relative_to(ROOT))
                out_file.write_bytes(fetch_tts(args.endpoint, text, bcp))

    print('done')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
