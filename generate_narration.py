#!/usr/bin/env python3
"""
generate_narration.py — Batch TTS generation using ElevenLabs API

Usage:
  python generate_narration.py --chapter sound --lang en
  python generate_narration.py --chapter sound --lang ko
  python generate_narration.py --chapter sound --lang all
  python generate_narration.py --chapter sound --lang en --dry-run

Reads narration JSON from BedtimeStories narration dir or local narration dir,
generates MP3 files via ElevenLabs API, and saves to assets/narration/{chapter}/.
"""

import argparse
import json
import os
import ssl
import sys
import time
import urllib.request
import urllib.error

# macOS Python often lacks default SSL certificates
try:
    _ssl_ctx = ssl.create_default_context()
except Exception:
    _ssl_ctx = ssl._create_unverified_context()

try:
    import certifi
    _ssl_ctx.load_verify_locations(certifi.where())
except ImportError:
    _ssl_ctx = ssl._create_unverified_context()

# ─── Configuration ────────────────────────────────────────────────

ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

VOICE_IDS = {
    "en": "iCrDUkL56s3C8sCRl7wb",   # Hope (English, female)
    "ko": "uyVNoMrnUku1dZyVEXwD",   # Anna Kim (Korean, female)
}

MODEL_ID = "eleven_multilingual_v2"  # High quality, multilingual

VOICE_SETTINGS = {
    "stability": 0.55,
    "similarity_boost": 0.78,
    "style": 0.35,
    "use_speaker_boost": True,
}

OUTPUT_FORMAT = "mp3_44100_128"

# Narration JSON search paths (relative to this script)
NARRATION_JSON_PATHS = [
    "narration/{chapter}_narration.json",
    "../BedtimeStories/BedtimeStories/Resources/narration/{chapter}_narration.json",
]

OUTPUT_DIR = "assets/narration/{chapter}"


# ─── Functions ────────────────────────────────────────────────────

def find_narration_json(chapter: str) -> str:
    """Find narration JSON file for a chapter."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    for pattern in NARRATION_JSON_PATHS:
        path = os.path.join(script_dir, pattern.format(chapter=chapter))
        path = os.path.normpath(path)
        if os.path.isfile(path):
            return path
    return None


def load_segments(json_path: str) -> list:
    """Load narration segments from JSON."""
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # Handle both formats: { "segments": [...] } and [...]
    if isinstance(data, list):
        return data
    return data.get("segments", [])


def generate_audio(text: str, voice_id: str, api_key: str, output_path: str,
                   model_id: str = MODEL_ID, dry_run: bool = False) -> bool:
    """Generate audio for a single text segment."""
    if dry_run:
        print(f"  [DRY RUN] Would generate: {output_path}")
        print(f"            Text: {text[:80]}...")
        return True

    url = f"{ELEVENLABS_API_URL}/{voice_id}?output_format={OUTPUT_FORMAT}"

    payload = json.dumps({
        "text": text,
        "model_id": model_id,
        "voice_settings": VOICE_SETTINGS,
    }).encode("utf-8")

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=120, context=_ssl_ctx) as resp:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, "wb") as f:
                while True:
                    chunk = resp.read(8192)
                    if not chunk:
                        break
                    f.write(chunk)
            size_kb = os.path.getsize(output_path) / 1024
            print(f"  ✅ Saved: {output_path} ({size_kb:.1f} KB)")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  ❌ HTTP {e.code}: {body[:200]}")
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def process_chapter(chapter: str, lang: str, api_key: str, dry_run: bool = False,
                    skip_existing: bool = True):
    """Process all segments for a chapter in a given language."""
    json_path = find_narration_json(chapter)
    if not json_path:
        print(f"❌ No narration JSON found for chapter '{chapter}'")
        sys.exit(1)

    print(f"📖 Loading: {json_path}")
    segments = load_segments(json_path)

    if not segments:
        print(f"❌ No segments found in {json_path}")
        sys.exit(1)

    print(f"📝 {len(segments)} segments found")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(script_dir, OUTPUT_DIR.format(chapter=chapter))
    os.makedirs(out_dir, exist_ok=True)

    voice_id = VOICE_IDS.get(lang)
    if not voice_id:
        print(f"❌ No voice ID for language '{lang}'")
        sys.exit(1)

    text_key = f"text_{lang}"
    success = 0
    skipped = 0
    failed = 0

    for seg in segments:
        seg_id = seg.get("id", 0)
        text = seg.get(text_key, "")

        if not text:
            print(f"  ⚠️  Segment {seg_id}: no '{text_key}' field, skipping")
            skipped += 1
            continue

        filename = f"{lang}_{seg_id:02d}.mp3"
        output_path = os.path.join(out_dir, filename)

        if skip_existing and os.path.isfile(output_path) and os.path.getsize(output_path) > 1000:
            print(f"  ⏭️  {filename} already exists, skipping")
            skipped += 1
            continue

        print(f"  🎙️  Segment {seg_id} ({lang}): {text[:60]}...")

        if generate_audio(text, voice_id, api_key, output_path, dry_run=dry_run):
            success += 1
        else:
            failed += 1

        # Rate limiting: wait between API calls
        if not dry_run:
            time.sleep(0.5)

    print(f"\n{'='*50}")
    print(f"✅ {success} generated | ⏭️ {skipped} skipped | ❌ {failed} failed")
    print(f"📁 Output: {out_dir}")


# ─── Main ─────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate TTS narration via ElevenLabs")
    parser.add_argument("--chapter", required=True, help="Chapter name (e.g., sound, drum)")
    parser.add_argument("--lang", required=True, choices=["en", "ko", "all"],
                        help="Language to generate")
    parser.add_argument("--api-key", default=None,
                        help="ElevenLabs API key (or set ELEVENLABS_API_KEY env var)")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview without calling API")
    parser.add_argument("--force", action="store_true",
                        help="Regenerate even if files exist")
    parser.add_argument("--model", default=MODEL_ID,
                        help=f"ElevenLabs model ID (default: {MODEL_ID})")

    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key and not args.dry_run:
        print("❌ No API key provided. Use --api-key or set ELEVENLABS_API_KEY")
        sys.exit(1)

    model_id = args.model

    langs = ["en", "ko"] if args.lang == "all" else [args.lang]

    for lang in langs:
        print(f"\n{'='*50}")
        print(f"🌐 Generating {lang.upper()} narration for '{args.chapter}'")
        print(f"{'='*50}")
        process_chapter(args.chapter, lang, api_key,
                        dry_run=args.dry_run,
                        skip_existing=not args.force)


if __name__ == "__main__":
    main()
