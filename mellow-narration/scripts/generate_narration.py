#!/usr/bin/env python3
"""
Mellow Math — ElevenLabs TTS Batch Generator
=============================================
Generates narration audio files for a Mellow Math chapter.

Usage:
    python generate_narration.py                    # Generate all sections
    python generate_narration.py --section 01       # Generate specific section
    python generate_narration.py --preview          # Use Flash model (cheaper) for preview
    python generate_narration.py --list             # List sections & estimated credits

Requirements:
    pip install requests python-dotenv
"""

import json
import os
import sys
import time
import argparse
import requests
from pathlib import Path

# ─── Configuration ───────────────────────────────────
API_KEY = os.environ.get("ELEVENLABS_API_KEY", "sk_bd55918abff2c8b5b81e424342ea83cb04ede5724a7fcf2b")
BASE_URL = "https://api.elevenlabs.io/v1"

# Voice & model settings
DEFAULT_MODEL = "eleven_multilingual_v2"    # High quality
PREVIEW_MODEL = "eleven_flash_v2_5"          # Faster, cheaper for previews

# Voice settings — tune these for the best narration feel
VOICE_SETTINGS = {
    "stability": 0.55,           # 0-1: lower = more expressive, higher = more consistent
    "similarity_boost": 0.72,    # 0-1: how closely to match the voice
    "style": 0.15,               # 0-1: style exaggeration (keep low for narration)
    "use_speaker_boost": True
}

OUTPUT_FORMAT = "mp3_44100_128"  # mp3 at 44.1kHz, 128kbps — good for web


def load_script(script_path: str) -> dict:
    """Load narration script JSON."""
    with open(script_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def estimate_credits(text: str, model: str) -> int:
    """Estimate credit usage for a text. 1 char ≈ 1 credit for multilingual v2."""
    chars = len(text)
    if "flash" in model.lower():
        return int(chars * 0.5)  # Flash models cost ~half
    return chars


def generate_audio(text: str, voice_id: str, model: str, output_path: str) -> bool:
    """Call ElevenLabs TTS API and save the audio file."""
    url = f"{BASE_URL}/text-to-speech/{voice_id}"

    headers = {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }

    payload = {
        "text": text,
        "model_id": model,
        "voice_settings": VOICE_SETTINGS,
        "output_format": OUTPUT_FORMAT
    }

    try:
        print(f"  → Calling API ({len(text)} chars, model={model.split('_')[-1]})...")
        response = requests.post(url, json=payload, headers=headers, timeout=120)

        if response.status_code == 200:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(response.content)
            size_kb = len(response.content) / 1024
            print(f"  ✓ Saved: {output_path} ({size_kb:.0f} KB)")
            return True
        else:
            print(f"  ✗ Error {response.status_code}: {response.text[:200]}")
            return False

    except requests.exceptions.Timeout:
        print(f"  ✗ Timeout — text may be too long, try splitting")
        return False
    except Exception as e:
        print(f"  ✗ Exception: {e}")
        return False


def get_audio_duration(filepath: str) -> float:
    """Get mp3 duration using ffprobe if available."""
    try:
        import subprocess
        result = subprocess.run(
            ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
             "-of", "csv=p=0", filepath],
            capture_output=True, text=True
        )
        return float(result.stdout.strip())
    except:
        # Rough estimate: ~150 words per minute for narration
        return None


def main():
    parser = argparse.ArgumentParser(description="Mellow Math TTS Generator")
    parser.add_argument("--script", default="narration_texts/sound_en.json",
                        help="Path to narration script JSON")
    parser.add_argument("--section", type=str, default=None,
                        help="Generate only this section (match filename prefix, e.g. '01')")
    parser.add_argument("--preview", action="store_true",
                        help="Use Flash model for cheaper preview")
    parser.add_argument("--list", action="store_true",
                        help="List sections and credit estimates without generating")
    parser.add_argument("--output-dir", default="audio/en",
                        help="Output directory for audio files")
    args = parser.parse_args()

    # Load script
    project_root = Path(__file__).parent.parent
    script_path = project_root / args.script
    if not script_path.exists():
        print(f"Script not found: {script_path}")
        sys.exit(1)

    data = load_script(str(script_path))
    voice_id = data.get("voice_id", "")
    model = PREVIEW_MODEL if args.preview else data.get("model", DEFAULT_MODEL)
    sections = data["sections"]

    # Filter to specific section if requested
    if args.section:
        sections = [s for s in sections if s["filename"].startswith(args.section)]
        if not sections:
            print(f"No section matching '{args.section}'")
            sys.exit(1)

    # ─── List mode ───
    if args.list:
        total_chars = 0
        total_credits = 0
        print(f"\n{'─' * 65}")
        print(f"  Chapter: {data['chapter']}  |  Language: {data['language']}")
        print(f"  Voice: {voice_id}  |  Model: {model}")
        print(f"{'─' * 65}")
        print(f"  {'Section':<25} {'Chars':>6} {'Credits':>8} {'~Minutes':>9}")
        print(f"  {'─' * 55}")
        for s in sections:
            chars = len(s["text"])
            credits = estimate_credits(s["text"], model)
            minutes = chars / 900  # rough: ~900 chars per minute of speech
            total_chars += chars
            total_credits += credits
            print(f"  {s['filename']:<25} {chars:>6} {credits:>8} {minutes:>8.1f}")
        print(f"  {'─' * 55}")
        print(f"  {'TOTAL':<25} {total_chars:>6} {total_credits:>8} {total_chars/900:>8.1f}")
        print(f"{'─' * 65}")
        print(f"  Creator plan: 100,000 credits/month")
        print(f"  This batch uses: ~{total_credits:,} credits ({total_credits/1000:.1f}% of monthly quota)")
        print()
        return

    # ─── Generate mode ───
    print(f"\n{'═' * 65}")
    print(f"  Mellow Math TTS Generator")
    print(f"  Chapter: {data['chapter']}  |  Sections: {len(sections)}")
    print(f"  Voice: {voice_id}  |  Model: {model}")
    print(f"  Output: {args.output_dir}/")
    print(f"{'═' * 65}\n")

    success = 0
    failed = 0
    total_credits_used = 0
    timing_data = []

    for i, section in enumerate(sections):
        print(f"[{i+1}/{len(sections)}] {section['id']} → {section['filename']}")

        output_path = project_root / args.output_dir / section["filename"]
        credits = estimate_credits(section["text"], model)
        total_credits_used += credits

        if generate_audio(section["text"], voice_id, model, str(output_path)):
            success += 1
            duration = get_audio_duration(str(output_path))
            timing_data.append({
                "id": section["id"],
                "filename": section["filename"],
                "duration": duration,
                "chars": len(section["text"])
            })
            if duration:
                print(f"  ⏱ Duration: {duration:.1f}s")
        else:
            failed += 1

        # Rate limit courtesy: wait 0.5s between requests
        if i < len(sections) - 1:
            time.sleep(0.5)

    # Save timing data for Playwright sync
    timing_path = project_root / args.output_dir / "_timing.json"
    with open(str(timing_path), 'w') as f:
        json.dump(timing_data, f, indent=2)
    print(f"\n  Timing data saved: {timing_path}")

    # Summary
    print(f"\n{'═' * 65}")
    print(f"  Done! {success} succeeded, {failed} failed")
    print(f"  Credits used: ~{total_credits_used:,}")
    print(f"{'═' * 65}\n")


if __name__ == "__main__":
    main()
