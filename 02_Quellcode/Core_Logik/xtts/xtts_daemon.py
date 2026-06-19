#!/usr/bin/env python3
"""Lokaler XTTS Voice-Clone-Service (Coqui). Port 8788."""
from __future__ import annotations

import argparse
import io
import json
import os
import sys
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_REF = ROOT / 'assets' / 'audio' / 'voice_reference_template.wav'
PORT = int(os.environ.get('XTTS_PORT', '8788'))
os.environ.setdefault('COQUI_TOS_AGREED', '1')
os.environ.setdefault('TORCH_FORCE_NO_WEIGHTS_ONLY_LOAD', '1')
MODEL_NAME = os.environ.get('XTTS_MODEL', 'tts_models/multilingual/multi-dataset/xtts_v2')

_TTS = None
_REF_WAV = None


XTTS_LANGS = frozenset({
    'en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar',
    'zh-cn', 'hu', 'ko', 'ja', 'hi',
})


def lang_code(raw: str) -> str:
    tag = (raw or 'de-DE').strip().lower()
    if tag.startswith('zh'):
        code = 'zh-cn'
    else:
        code = tag.split('-')[0] or 'de'
    if code in XTTS_LANGS:
        return code
    raise ValueError(f'unsupported_language:{code}')


def load_reference(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f'reference missing: {path}')
    return str(path)


def get_tts():
    global _TTS
    if _TTS is not None:
        return _TTS
    from TTS.api import TTS  # noqa: PLC0415

    use_gpu = os.environ.get('XTTS_USE_GPU', '0') == '1'
    device = 'cuda' if use_gpu else 'cpu'
    _TTS = TTS(MODEL_NAME).to(device)
    return _TTS


def wav_to_mp3_bytes(wav_path: Path) -> bytes:
    try:
        from pydub import AudioSegment  # noqa: PLC0415

        seg = AudioSegment.from_wav(str(wav_path))
        buf = io.BytesIO()
        seg.export(buf, format='mp3', bitrate='128k')
        return buf.getvalue()
    except Exception:
        with wave.open(str(wav_path), 'rb') as wf:
            return _pcm_to_wav_bytes(wf)


def _pcm_to_wav_bytes(wf) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as out:
        out.setnchannels(wf.getnchannels())
        out.setsampwidth(wf.getsampwidth())
        out.setframerate(wf.getframerate())
        out.writeframes(wf.readframes(wf.getnframes()))
    return buf.getvalue()


def synthesize(text: str, lang: str, ref_wav: str) -> bytes:
    import tempfile  # noqa: PLC0415

    tts = get_tts()
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        out_path = tmp.name
    try:
        tts.tts_to_file(
            text=text,
            speaker_wav=ref_wav,
            language=lang_code(lang),
            file_path=out_path,
        )
        return wav_to_mp3_bytes(Path(out_path))
    finally:
        try:
            os.unlink(out_path)
        except OSError:
            pass


class Handler(BaseHTTPRequestHandler):
    server_version = 'OSGXtts/1.0'

    def _send_json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.end_headers()

    def do_GET(self):  # noqa: N802
        if self.path != '/health':
            self._send_json(404, {'ok': False})
            return
        try:
            get_tts()
            ready = True
        except Exception as exc:  # pragma: no cover
            ready = False
            err = str(exc)
        else:
            err = ''
        self._send_json(200, {
            'ok': ready,
            'engine': 'xtts',
            'model': MODEL_NAME,
            'reference': _REF_WAV,
            'error': err,
        })

    def do_POST(self):  # noqa: N802
        if self.path != '/synthesize':
            self._send_json(404, {'ok': False})
            return
        length = int(self.headers.get('Content-Length', '0') or 0)
        raw = self.rfile.read(length) if length else b'{}'
        try:
            data = json.loads(raw.decode('utf-8'))
        except json.JSONDecodeError:
            self._send_json(400, {'error': 'invalid_json'})
            return
        text = str(data.get('text', '')).strip()
        lang = str(data.get('lang', 'de-DE'))
        if not text or len(text) > 4500:
            self._send_json(400, {'error': 'invalid_text'})
            return
        try:
            mp3 = synthesize(text, lang, _REF_WAV)
        except ValueError as exc:
            detail = str(exc)
            if detail.startswith('unsupported_language:'):
                self._send_json(502, {'error': 'unsupported_language', 'detail': detail})
                return
            self._send_json(500, {'error': 'xtts_failed', 'detail': detail[:300]})
            return
        except Exception as exc:  # pragma: no cover
            self._send_json(500, {'error': 'xtts_failed', 'detail': str(exc)[:300]})
            return
        self.send_response(200)
        self.send_header('Content-Type', 'audio/mpeg')
        self.send_header('Content-Length', str(len(mp3)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-OSG-Voice-Engine', 'xtts-local')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(mp3)

    def log_message(self, fmt, *args):  # noqa: A003
        sys.stdout.write('[xtts] ' + (fmt % args) + '\n')


def main() -> int:
    global _REF_WAV
    parser = argparse.ArgumentParser()
    parser.add_argument('--reference', default=str(DEFAULT_REF))
    parser.add_argument('--port', type=int, default=PORT)
    args = parser.parse_args()
    _REF_WAV = load_reference(Path(args.reference))
    print(f'xtts daemon on :{args.port} ref={_REF_WAV}')
    httpd = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    httpd.serve_forever()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
