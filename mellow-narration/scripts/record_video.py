#!/usr/bin/env python3
"""
Mellow Math — Playwright Video Recorder
========================================
Automates browser interactions synced with narration audio,
captures screen recording, and composites final video.

Usage:
    python record_video.py --url https://edu.kimsh.kr/sound.html
    python record_video.py --url file:///path/to/sound.html --section sec-fourier
    python record_video.py --url https://edu.kimsh.kr/sound.html --dry-run

Requirements:
    pip install playwright
    playwright install chromium
    # Also needs: ffmpeg (for final compositing)
"""

import asyncio
import json
import os
import sys
import argparse
import subprocess
from pathlib import Path

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("Install playwright: pip install playwright && playwright install chromium")
    sys.exit(1)


# ─── Choreography ────────────────────────────────────
# Each section has timed actions synced to narration
CHOREOGRAPHY = [
    {
        "id": "hero",
        "audio": "00_hero.mp3",
        "scroll_to": "#hero",
        "wait_before": 2.0,
        "actions": [
            {"t": 0, "type": "wait", "dur": 5.0, "note": "Hero animation plays"}
        ]
    },
    {
        "id": "sec-wave",
        "audio": "01_sine_wave.mp3",
        "scroll_to": "#sec-wave",
        "wait_before": 1.5,
        "actions": [
            {"t": 22.0, "type": "click",         "sel": "#play-sine-btn", "note": "Listen to this."},
            {"t": 28.0, "type": "smooth_slider", "sel": "#freq-slider", "from": 440, "to": 880,  "dur": 3000, "note": "watch what happens as we change the frequency"},
            {"t": 35.0, "type": "smooth_slider", "sel": "#freq-slider", "from": 880, "to": 220,  "dur": 4000, "note": "Lower pitch means the wave stretches out"},
            {"t": 39.0, "type": "click",         "sel": "button:has-text('A4')", "note": "Reset to 440 before next"},
            {"t": 41.0, "type": "smooth_slider", "sel": "#amp-slider", "from": 60, "to": 10, "dur": 1500, "note": "And if we change the amplitude?"},
            {"t": 43.5, "type": "smooth_slider", "sel": "#amp-slider", "from": 10, "to": 80, "dur": 2000, "note": "The wave gets taller or shorter"},
            {"t": 48.0, "type": "click",         "sel": "#play-sine-btn", "note": "Simple. Beautiful. And this is just the beginning."}
        ]
    },
    {
        "id": "sec-pythagoras",
        "audio": "02_pythagoras.mp3",
        "scroll_to": "#sec-pythagoras",
        "wait_before": 1.5,
        "actions": [
            {"t": 21.0, "type": "click", "sel": ".interval-btn:has-text('Octave')", "note": "Listen: an octave."},
            {"t": 26.5, "type": "click", "sel": ".interval-btn:has-text('Perfect 5th')", "note": "Now a perfect fifth"},
            {"t": 30.5, "type": "click", "sel": ".interval-btn:has-text('Major 3rd')", "note": "A major third"},
            {"t": 35.0, "type": "click", "sel": ".interval-btn:has-text('Major 2nd')", "note": "nine to eight, a major second"},
            {"t": 40.0, "type": "click", "sel": ".interval-btn:has-text('Tritone')", "note": "And the tritone"}
        ]
    },
    {
        "id": "sec-temperament",
        "audio": "03_temperament.mp3",
        "scroll_to": "#sec-temperament",
        "wait_before": 1.5,
        "actions": [
            {"t": 3.0, "type": "wait", "dur": 2.0}
        ]
    },
    {
        "id": "sec-instruments",
        "audio": "04_instruments.mp3",
        "scroll_to": "#sec-instruments",
        "wait_before": 1.5,
        "actions": [
            {"t": 12.0, "type": "click", "sel": ".inst-tab:has-text('Violin')"},
            {"t": 12.5, "type": "click", "sel": ".chord-pill:has-text('Major Triad')"},
            {"t": 13.0, "type": "click", "sel": "#inst-just-btn", "note": "A violin playing a major triad in just intonation"},
            {"t": 23.5, "type": "click", "sel": "#inst-equal-btn", "note": "Now the same chord in equal temperament"},
            {"t": 41.5, "type": "click", "sel": ".inst-tab:has-text('Trombone')", "note": "but on trombone..."},
            {"t": 44.0, "type": "click", "sel": ".compare-btn", "note": "the contrast becomes unmistakable"}
        ]
    },
    {
        "id": "sec-extreme",
        "audio": "05_extreme.mp3",
        "scroll_to": "#sec-extreme",
        "wait_before": 1.5,
        "actions": [
            {"t": 15.0, "type": "click", "sel": ".extreme-preset:has-text('Major 3rd')"},
            {"t": 19.5, "type": "click", "sel": "#ext-just-btn", "note": "First, listen to the just version."},
            {"t": 25.5, "type": "click", "sel": "#ext-equal-btn", "note": "Now equal temperament."},
            {"t": 31.0, "type": "click", "sel": ".compare-btn", "note": "Compare again"}
        ]
    },
    {
        "id": "sec-wolf",
        "audio": "06_wolf.mp3",
        "scroll_to": "#sec-wolf",
        "wait_before": 1.5,
        "actions": [
            {"t": 42.0, "type": "click_canvas_segment", "sel": "#wolf-circle-canvas", "segment": 0, "note": "Each fifth rings pure..."},
            {"t": 44.5, "type": "click_canvas_segment", "sel": "#wolf-circle-canvas", "segment": 3},
            {"t": 47.0, "type": "click_canvas_segment", "sel": "#wolf-circle-canvas", "segment": 8},
            {"t": 49.5, "type": "click_canvas_segment", "sel": "#wolf-circle-canvas", "segment": 11, "note": "...until we reach the last one. There it is. The wolf."}
        ]
    },
    {
        "id": "sec-bach",
        "audio": "07_bach.mp3",
        "scroll_to": "#sec-bach",
        "wait_before": 1.5,
        "actions": [
            {"t": 27.5, "type": "click", "sel": ".key-color-cell:nth-child(1)", "note": "C major's third is..."},
            {"t": 29.5, "type": "click", "sel": "#tw-well-btn"},
            {"t": 36.0, "type": "click", "sel": ".key-color-cell:nth-child(7)", "note": "F-sharp major's third is..."},
            {"t": 38.0, "type": "click", "sel": "#tw-well-btn"}
        ]
    },
    {
        "id": "sec-fourier",
        "audio": "08_fourier.mp3",
        "scroll_to": "#sec-fourier",
        "wait_before": 1.5,
        "actions": [
            {"t": 19.5, "type": "click",         "sel": "button:has-text('Sine')", "note": "Start with a single sine wave"},
            {"t": 21.0, "type": "click",         "sel": "#play-fourier-btn"},
            {"t": 24.5, "type": "smooth_slider", "sel": "#harm-1", "from": 0, "to": 75,  "dur": 1500, "note": "Now add the second harmonic."},
            {"t": 27.5, "type": "smooth_slider", "sel": "#harm-2", "from": 0, "to": 50,  "dur": 1200, "note": "A third harmonic."},
            {"t": 29.5, "type": "smooth_slider", "sel": "#harm-3", "from": 0, "to": 35,  "dur": 1000, "note": "A fourth."},
            {"t": 35.5, "type": "click",         "sel": "button:has-text('Violin')", "note": "voice of a violin"},
            {"t": 37.5, "type": "click",         "sel": "button:has-text('Clarinet')", "note": "a clarinet"},
            {"t": 39.5, "type": "click",         "sel": "button:has-text('Trumpet')", "note": "a trumpet"},
            {"t": 43.0, "type": "click",         "sel": "#play-fourier-btn"}
        ]
    },
    {
        "id": "sec-timbre",
        "audio": "09_timbre.mp3",
        "scroll_to": "#sec-timbre",
        "wait_before": 1.5,
        "actions": [
            {"t": 16.0, "type": "click", "sel": "button[onclick*='violin']", "note": "A violin produces strong harmonics"},
            {"t": 23.0, "type": "click", "sel": "button[onclick*='flute']", "note": "A flute? Almost all fundamental"}
        ]
    },
    {
        "id": "sec-brain",
        "audio": "10_cochlea.mp3",
        "scroll_to": "#sec-brain",
        "wait_before": 1.5,
        "actions": [
            {"t": 21.0, "type": "click",         "sel": "#play-cochlea-btn", "note": "Watch as we sweep from low to high"},
            {"t": 23.5, "type": "smooth_slider", "sel": "#cochlea-freq", "from": 100, "to": 8000, "dur": 8000},
            {"t": 32.0, "type": "click",         "sel": "#play-cochlea-btn"}
        ]
    },
    {
        "id": "sec-digital",
        "audio": "11_digital.mp3",
        "scroll_to": "#sec-digital",
        "wait_before": 1.5,
        "actions": [
            {"t": 20.0, "type": "click",         "sel": "button:has-text('CD Quality')", "note": "Listen: CD quality."},
            {"t": 21.5, "type": "click",         "sel": "#play-crushed-btn"},
            {"t": 24.0, "type": "click",         "sel": "#play-crushed-btn"},
            {"t": 25.5, "type": "click",         "sel": "button:has-text('Lo-fi')", "note": "Now reduce to lo-fi."},
            {"t": 27.5, "type": "click",         "sel": "#play-crushed-btn"},
            {"t": 30.5, "type": "click",         "sel": "#play-crushed-btn"},
            {"t": 31.5, "type": "click",         "sel": "button:has-text('Extreme')", "note": "And at the extreme"},
            {"t": 33.5, "type": "click",         "sel": "#play-crushed-btn"},
            {"t": 36.5, "type": "click",         "sel": "#play-crushed-btn"},
            {"t": 42.0, "type": "click",         "sel": "button:has-text('Safe')", "note": "Watch: as we push the frequency"},
            {"t": 44.5, "type": "click",         "sel": "#play-alias-btn"},
            {"t": 46.5, "type": "smooth_slider", "sel": "#alias-freq-slider", "from": 440, "to": 3500, "dur": 5000},
            {"t": 53.0, "type": "click",         "sel": "#play-alias-btn"}
        ]
    },
    {
        "id": "sec-closing",
        "audio": "12_closing.mp3",
        "scroll_to": "#sec-closing",
        "wait_before": 2.0,
        "actions": [
            {"t": 0, "type": "wait", "dur": 5.0}
        ]
    }
]


# ─── Smooth interaction helpers ──────────────────────

async def smooth_scroll_to(page, selector: str, duration_ms: int = 1500):
    """Smooth scroll to an element."""
    await page.evaluate(f"""
        document.querySelector('{selector}')?.scrollIntoView({{
            behavior: 'smooth', block: 'center'
        }});
    """)
    await asyncio.sleep(duration_ms / 1000)


async def smooth_slider(page, selector: str, from_val: float, to_val: float, duration_ms: int):
    """Smoothly drag a range slider from one value to another."""
    steps = max(30, duration_ms // 30)
    for i in range(steps + 1):
        t = i / steps
        # Smoothstep easing
        eased = t * t * (3 - 2 * t)
        value = from_val + (to_val - from_val) * eased
        await page.evaluate(f"""
            (() => {{
                const el = document.querySelector('{selector}');
                if (!el) return;
                el.value = {value};
                el.dispatchEvent(new Event('input', {{ bubbles: true }}));
            }})()
        """)
        await asyncio.sleep(duration_ms / steps / 1000)
    # Fire change event at end
    await page.evaluate(f"""
        document.querySelector('{selector}')?.dispatchEvent(new Event('change', {{ bubbles: true }}));
    """)


async def click_canvas_segment(page, selector: str, segment: int):
    """Click a specific segment of the wolf circle canvas."""
    # Calculate click position for the given segment
    await page.evaluate(f"""
        (() => {{
            const canvas = document.querySelector('{selector}');
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const r = rect.width * 0.38;
            const angle = ({segment} + 0.5) / 12 * Math.PI * 2 - Math.PI / 2;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            canvas.dispatchEvent(new MouseEvent('mousemove', {{
                clientX: rect.left + x, clientY: rect.top + y, bubbles: true
            }}));
            canvas.dispatchEvent(new MouseEvent('click', {{
                clientX: rect.left + x, clientY: rect.top + y, bubbles: true
            }}));
        }})()
    """)


async def execute_action(page, action: dict):
    """Execute a single choreography action."""
    action_type = action["type"]

    if action_type == "click":
        try:
            await page.click(action["sel"], timeout=3000)
        except Exception as e:
            print(f"    ⚠ Click failed: {action['sel']} — {e}")

    elif action_type == "smooth_slider":
        await smooth_slider(page, action["sel"], action["from"], action["to"], action["dur"])

    elif action_type == "click_canvas_segment":
        await click_canvas_segment(page, action["sel"], action["segment"])

    elif action_type == "wait":
        await asyncio.sleep(action["dur"])


# ─── Recording pipeline ─────────────────────────────

async def record_section(page, section: dict, audio_dir: str, video_dir: str, dry_run: bool = False):
    """Record one section: scroll, play actions timed to narration."""
    section_id = section["id"]
    print(f"\n{'─' * 50}")
    print(f"  Recording: {section_id}")
    print(f"  Audio: {section.get('audio', 'none')}")
    print(f"  Actions: {len(section['actions'])}")
    print(f"{'─' * 50}")

    if dry_run:
        print("  [DRY RUN] Would execute actions:")
        for a in section["actions"]:
            print(f"    t={a['t']:>4.1f}s  {a['type']:<15}  {a.get('sel', '')}")
        return

    # Scroll to section
    await smooth_scroll_to(page, section["scroll_to"])
    await asyncio.sleep(section.get("wait_before", 1.0))

    # Initialize audio context on page (needed for Web Audio)
    await page.evaluate("if (typeof initAudio === 'function') initAudio();")

    # Get audio duration from timing file
    audio_file = os.path.join(audio_dir, section.get("audio", ""))
    duration = 30.0  # default
    timing_path = os.path.join(audio_dir, "_timing.json")
    if os.path.exists(timing_path):
        with open(timing_path) as f:
            timing_data = json.load(f)
            timing_list = timing_data.get("sections", []) if isinstance(timing_data, dict) else timing_data
            for t in timing_list:
                if t.get("filename") == section.get("audio"):
                    duration = t.get("duration", 30.0) or 30.0
                    break

    # Execute timed actions
    start_time = asyncio.get_event_loop().time()
    action_idx = 0
    actions = sorted(section["actions"], key=lambda a: a["t"])

    while action_idx < len(actions):
        elapsed = asyncio.get_event_loop().time() - start_time
        action = actions[action_idx]

        if elapsed >= action["t"]:
            note = action.get("note", "")
            print(f"  [{elapsed:.1f}s] {action['type']} {action.get('sel', '')} {note}")
            await execute_action(page, action)
            action_idx += 1
        else:
            await asyncio.sleep(0.05)

    # Wait for remaining audio duration
    elapsed = asyncio.get_event_loop().time() - start_time
    remaining = duration - elapsed
    if remaining > 0:
        print(f"  Waiting {remaining:.1f}s for audio to finish...")
        await asyncio.sleep(remaining)


async def run_recording(url: str, audio_dir: str, video_dir: str,
                        sections_filter: list = None, dry_run: bool = False,
                        viewport_w: int = 1920, viewport_h: int = 1080):
    """Main recording pipeline."""
    # Filter sections
    choreography = CHOREOGRAPHY
    if sections_filter:
        choreography = [s for s in choreography if s["id"] in sections_filter]

    if dry_run:
        for section in choreography:
            await record_section(None, section, audio_dir, video_dir, True)
        return

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=[
                f"--window-size={viewport_w},{viewport_h}",
                "--autoplay-policy=no-user-gesture-required",
                "--disable-web-security",
            ]
        )

        context = await browser.new_context(
            viewport={"width": viewport_w, "height": viewport_h},
            record_video_dir=video_dir,
            record_video_size={"width": viewport_w, "height": viewport_h},
        )

        page = await context.new_page()
        print(f"\nOpening: {url}")
        await page.goto(url, wait_until="networkidle")
        await asyncio.sleep(2)

        # Dismiss audio notice if present
        try:
            await page.click(".notice-start", timeout=2000)
        except:
            pass

        # Click "Start Exploring" to init audio
        try:
            await page.click(".start-btn", timeout=2000)
            await asyncio.sleep(1)
        except:
            pass

        # Record each section
        for section in choreography:
            await record_section(page, section, audio_dir, video_dir, dry_run)

        # Close & save video
        await asyncio.sleep(2)
        await context.close()
        await browser.close()

        print(f"\n✓ Raw video saved in: {video_dir}/")


def composite_video(video_dir: str, audio_dir: str, output_path: str):
    """Combine screen recording with narration audio using ffmpeg."""
    # Find the recorded video
    videos = list(Path(video_dir).glob("*.webm"))
    if not videos:
        print("No video files found!")
        return

    video_file = str(videos[0])

    # Concatenate all audio files
    audio_files = sorted(Path(audio_dir).glob("*.mp3"))
    if not audio_files:
        print("No audio files found!")
        return

    # Create audio concat list
    concat_list = Path(video_dir) / "audio_list.txt"
    with open(str(concat_list), 'w') as f:
        for af in audio_files:
            f.write(f"file '{af.absolute()}'\n")

    # Concat audio
    combined_audio = str(Path(video_dir) / "combined_narration.mp3")
    subprocess.run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0",
        "-i", str(concat_list),
        "-c", "copy", combined_audio
    ], check=True)

    # Composite: video + audio → final mp4
    subprocess.run([
        "ffmpeg", "-y",
        "-i", video_file,
        "-i", combined_audio,
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k",
        "-map", "0:v:0", "-map", "1:a:0",
        "-shortest",
        output_path
    ], check=True)

    print(f"\n✓ Final video: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Mellow Math Video Recorder")
    parser.add_argument("--url", required=True, help="URL of the chapter page")
    parser.add_argument("--audio-dir", default="audio/en", help="Directory with narration mp3s")
    parser.add_argument("--video-dir", default="video", help="Output directory for video")
    parser.add_argument("--output", default="video/sound_final.mp4", help="Final output path")
    parser.add_argument("--section", type=str, nargs="*", help="Record only these sections")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without executing")
    parser.add_argument("--width", type=int, default=1920, help="Viewport width")
    parser.add_argument("--height", type=int, default=1080, help="Viewport height")
    parser.add_argument("--composite-only", action="store_true",
                        help="Skip recording, just composite existing files")
    args = parser.parse_args()

    os.makedirs(args.video_dir, exist_ok=True)

    if args.composite_only:
        composite_video(args.video_dir, args.audio_dir, args.output)
        return

    # Run recording
    asyncio.run(run_recording(
        url=args.url,
        audio_dir=args.audio_dir,
        video_dir=args.video_dir,
        sections_filter=args.section,
        dry_run=args.dry_run,
        viewport_w=args.width,
        viewport_h=args.height,
    ))

    # Composite
    if not args.dry_run:
        print("\nCompositing video + audio...")
        composite_video(args.video_dir, args.audio_dir, args.output)


if __name__ == "__main__":
    main()
