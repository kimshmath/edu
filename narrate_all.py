#!/usr/bin/env python3
"""
narrate_all.py — Master automation: create narration JSONs, inject players, generate TTS.

Phase 1: Extract sections from each HTML chapter, create narration JSONs
Phase 2: Inject NARRATION_CONFIG + player CSS/JS into each chapter HTML
Phase 3: Call generate_narration.py for each chapter to produce audio

Usage:
  python3 narrate_all.py --phase 1          # Create narration JSONs only
  python3 narrate_all.py --phase 2          # Inject player into HTMLs only
  python3 narrate_all.py --phase 3          # Generate TTS audio only
  python3 narrate_all.py --phase all        # Do everything
  python3 narrate_all.py --phase 3 --dry-run  # Preview TTS calls
"""

import argparse
import json
import os
import re
import sys
import subprocess
from html.parser import HTMLParser

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
NARRATION_DIR = os.path.join(SCRIPT_DIR, "narration")
IOS_NARRATION_DIR = os.path.join(SCRIPT_DIR, "..", "BedtimeStories", "BedtimeStories", "Resources", "narration")

# Chapters that ALREADY have working narration (skip them)
ALREADY_DONE = {"sound", "drum", "ghost", "illusion", "synth"}

# Chapters to skip entirely (placeholders, index, etc.)
SKIP_CHAPTERS = {"index", "skimmath", "energy", "vectors", "oscillator"}

# Map chapter base name -> list of section IDs to find in the HTML
# We'll auto-detect these from the HTML files.


def get_all_chapters():
    """Get list of all English chapter base names."""
    chapters = []
    for f in sorted(os.listdir(SCRIPT_DIR)):
        if not f.endswith(".html"):
            continue
        # Skip Korean/index/skip files
        if any(f.endswith(suf) for suf in ["_ko.html", "_kr.html", "-ko.html", "-kr.html"]):
            continue
        base = f.replace(".html", "")
        if base in SKIP_CHAPTERS:
            continue
        chapters.append(base)
    return chapters


class SectionExtractor(HTMLParser):
    """Extract section IDs and text content from HTML."""
    def __init__(self):
        super().__init__()
        self.sections = []
        self.current_section_id = None
        self.current_text = []
        self.in_section = False
        self.in_script = False
        self.in_style = False
        self.depth = 0
        self.section_depth = 0
        # Track headers
        self.in_header = False
        self.header_text = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == "script":
            self.in_script = True
            return
        if tag == "style":
            self.in_style = True
            return

        if tag == "section":
            self.depth += 1
            sec_id = attrs_dict.get("id", "")
            if sec_id and self.depth == 1:
                # Save previous section
                if self.current_section_id and self.current_text:
                    self.sections.append({
                        "id": self.current_section_id,
                        "text": " ".join(self.current_text).strip()
                    })
                self.current_section_id = sec_id
                self.current_text = []
                self.in_section = True
                self.section_depth = self.depth

        if tag in ("h1", "h2", "h3"):
            self.in_header = True
            self.header_text = ""

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False
        if tag == "style":
            self.in_style = False
        if tag == "section":
            if self.depth == self.section_depth:
                if self.current_section_id and self.current_text:
                    self.sections.append({
                        "id": self.current_section_id,
                        "text": " ".join(self.current_text).strip()
                    })
                    self.current_section_id = None
                    self.current_text = []
                    self.in_section = False
            self.depth -= 1
        if tag in ("h1", "h2", "h3"):
            self.in_header = False

    def handle_data(self, data):
        if self.in_script or self.in_style:
            return
        text = data.strip()
        if not text:
            return
        if self.in_section and self.current_section_id:
            self.current_text.append(text)


def extract_sections_from_html(filepath):
    """Parse HTML and extract section IDs + text."""
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    parser = SectionExtractor()
    try:
        parser.feed(html)
    except Exception:
        pass

    # Also catch the last section
    if parser.current_section_id and parser.current_text:
        parser.sections.append({
            "id": parser.current_section_id,
            "text": " ".join(parser.current_text).strip()
        })

    return parser.sections


def condense_section_text(text, max_chars=500):
    """Condense section text to narration-friendly length."""
    # Remove excess whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Take first N characters, ending at a sentence boundary
    if len(text) <= max_chars:
        return text
    # Find last sentence end before max_chars
    truncated = text[:max_chars]
    last_period = max(truncated.rfind(". "), truncated.rfind("。"))
    if last_period > max_chars // 2:
        return truncated[:last_period + 1]
    return truncated.rstrip() + "..."


def create_narration_json(chapter, en_sections, ko_sections):
    """Create narration JSON for a chapter."""
    segments = []

    # Match EN and KO sections by index (they should correspond)
    for i, en_sec in enumerate(en_sections):
        seg = {
            "id": i,
            "text_en": condense_section_text(en_sec["text"]),
            "text_ko": "",
            "scroll_to": f"#{en_sec['id']}",
            "pause_after": True
        }

        # Try to find matching KO section
        if i < len(ko_sections):
            seg["text_ko"] = condense_section_text(ko_sections[i]["text"])

        segments.append(seg)

    return {
        "chapter": chapter,
        "segments": segments
    }


def find_ko_file(chapter):
    """Find the Korean counterpart file for a chapter."""
    candidates = [
        f"{chapter}_ko.html",
        f"{chapter}-ko.html",
        f"{chapter}_kr.html",
        f"{chapter}-kr.html",
    ]
    for c in candidates:
        path = os.path.join(SCRIPT_DIR, c)
        if os.path.isfile(path):
            return path
    return None


def get_narration_config_block(chapter, segments):
    """Generate the NARRATION_CONFIG script block."""
    seg_lines = []
    for seg in segments:
        section = seg.get("scroll_to", f"#section-{seg['id']}")
        label = section.replace("#", "").replace("sec-", "§").replace("-", " ").title()
        seg_lines.append(f"    {{ id: {seg['id']},  section: '{section}', label: '{label}' }}")

    segments_str = ",\n".join(seg_lines)

    return f"""
<script>
window.NARRATION_CONFIG = {{
  chapter: '{chapter}',
  basePath: 'assets/narration/{chapter}/',
  segments: [
{segments_str}
  ]
}};
</script>
<script src="narration_player.js"></script>
"""


def inject_narration_into_html(filepath, chapter, segments):
    """Inject narration player CSS + config into an HTML file."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Check if already has narration
    if "NARRATION_CONFIG" in content:
        print(f"  ⏭️  {os.path.basename(filepath)} already has NARRATION_CONFIG")
        return False

    modified = False

    # 1. Inject CSS link in <head>
    if 'narration_player.css' not in content:
        content = content.replace('</head>', '<link rel="stylesheet" href="narration_player.css">\n</head>')
        modified = True

    # 2. Inject NARRATION_CONFIG before </body>
    config_block = get_narration_config_block(chapter, segments)
    # Find the giscus block or </body> to inject before
    if '<div class="giscus-wrap"' in content:
        content = content.replace('<div class="giscus-wrap"', config_block + '\n<div class="giscus-wrap"')
    elif '</body>' in content:
        content = content.replace('</body>', config_block + '\n</body>')

    modified = True

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✅ Injected narration into {os.path.basename(filepath)}")

    return modified


# ─── Phase 1: Create narration JSONs ───

def phase1_create_jsons(chapters):
    """Create narration JSON files for chapters that don't have them."""
    os.makedirs(NARRATION_DIR, exist_ok=True)

    # First, copy any iOS narration JSONs that have real content
    if os.path.isdir(IOS_NARRATION_DIR):
        for f in os.listdir(IOS_NARRATION_DIR):
            if not f.endswith("_narration.json"):
                continue
            src = os.path.join(IOS_NARRATION_DIR, f)
            dst = os.path.join(NARRATION_DIR, f)
            if os.path.getsize(src) > 100 and not os.path.isfile(dst):
                import shutil
                shutil.copy2(src, dst)
                print(f"  📋 Copied from iOS: {f}")

    created = 0
    for chapter in chapters:
        json_path = os.path.join(NARRATION_DIR, f"{chapter}_narration.json")

        if os.path.isfile(json_path) and os.path.getsize(json_path) > 100:
            print(f"  ⏭️  {chapter}_narration.json already exists")
            continue

        en_path = os.path.join(SCRIPT_DIR, f"{chapter}.html")
        if not os.path.isfile(en_path):
            print(f"  ⚠️  {chapter}.html not found, skipping")
            continue

        print(f"  📝 Extracting sections from {chapter}...")
        en_sections = extract_sections_from_html(en_path)

        if not en_sections:
            print(f"  ⚠️  No sections found in {chapter}.html, skipping")
            continue

        ko_path = find_ko_file(chapter)
        ko_sections = []
        if ko_path:
            ko_sections = extract_sections_from_html(ko_path)

        narration = create_narration_json(chapter, en_sections, ko_sections)

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(narration, f, ensure_ascii=False, indent=2)

        print(f"  ✅ Created {chapter}_narration.json ({len(narration['segments'])} segments)")
        created += 1

    print(f"\n📊 Phase 1 complete: {created} new narration JSONs created")


# ─── Phase 2: Inject player into HTMLs ───

def phase2_inject_players(chapters):
    """Inject narration player into all chapter HTMLs."""
    injected = 0
    for chapter in chapters:
        json_path = os.path.join(NARRATION_DIR, f"{chapter}_narration.json")
        if not os.path.isfile(json_path) or os.path.getsize(json_path) < 100:
            print(f"  ⚠️  No narration JSON for {chapter}, skipping injection")
            continue

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        segments = data.get("segments", data if isinstance(data, list) else [])
        if not segments:
            continue

        # Inject into EN file
        en_path = os.path.join(SCRIPT_DIR, f"{chapter}.html")
        if os.path.isfile(en_path):
            if inject_narration_into_html(en_path, chapter, segments):
                injected += 1

        # Inject into KO file
        ko_path = find_ko_file(chapter)
        if ko_path:
            if inject_narration_into_html(ko_path, chapter, segments):
                injected += 1

    print(f"\n📊 Phase 2 complete: {injected} HTML files updated")


# ─── Phase 3: Generate TTS audio ───

def phase3_generate_tts(chapters, api_key, dry_run=False):
    """Run generate_narration.py for each chapter."""
    gen_script = os.path.join(SCRIPT_DIR, "generate_narration.py")

    total_generated = 0
    for chapter in chapters:
        json_path = os.path.join(NARRATION_DIR, f"{chapter}_narration.json")
        if not os.path.isfile(json_path) or os.path.getsize(json_path) < 100:
            continue

        print(f"\n{'='*50}")
        print(f"🎙️  Generating TTS for: {chapter}")
        print(f"{'='*50}")

        cmd = [
            sys.executable, gen_script,
            "--chapter", chapter,
            "--lang", "all",
            "--api-key", api_key,
        ]
        if dry_run:
            cmd.append("--dry-run")

        result = subprocess.run(cmd, cwd=SCRIPT_DIR)
        if result.returncode == 0:
            total_generated += 1
        else:
            print(f"  ❌ Failed for {chapter}")

    print(f"\n📊 Phase 3 complete: {total_generated} chapters processed")


# ─── Main ───

def main():
    parser = argparse.ArgumentParser(description="Master narration automation")
    parser.add_argument("--phase", required=True, choices=["1", "2", "3", "all"],
                        help="Which phase to run")
    parser.add_argument("--api-key", default=None,
                        help="ElevenLabs API key")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview without calling API (phase 3)")
    parser.add_argument("--chapter", default=None,
                        help="Process only a specific chapter")

    args = parser.parse_args()

    chapters = get_all_chapters()
    # Filter out already-done chapters for phases 1 & 2
    new_chapters = [c for c in chapters if c not in ALREADY_DONE]

    if args.chapter:
        new_chapters = [args.chapter]
        chapters = [args.chapter]

    print(f"📋 Total chapters to process: {len(new_chapters)}")
    print(f"   Already done: {', '.join(sorted(ALREADY_DONE))}")

    api_key = args.api_key or os.environ.get("ELEVENLABS_API_KEY", "")

    if args.phase in ("1", "all"):
        print(f"\n{'='*60}")
        print("🔨 PHASE 1: Creating narration JSON files")
        print(f"{'='*60}")
        phase1_create_jsons(new_chapters)

    if args.phase in ("2", "all"):
        print(f"\n{'='*60}")
        print("💉 PHASE 2: Injecting narration player into HTMLs")
        print(f"{'='*60}")
        phase2_inject_players(new_chapters)

    if args.phase in ("3", "all"):
        if not api_key and not args.dry_run:
            print("❌ No API key. Use --api-key or set ELEVENLABS_API_KEY")
            sys.exit(1)
        print(f"\n{'='*60}")
        print("🎙️  PHASE 3: Generating TTS audio via ElevenLabs")
        print(f"{'='*60}")
        # For phase 3, process ALL chapters (including already-done ones that might need regeneration)
        phase3_generate_tts(new_chapters, api_key, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
