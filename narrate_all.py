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
  python3 narrate_all.py --phase 1 --force  # Overwrite existing JSONs
"""

import argparse
import json
import os
import re
import sys
import subprocess
from html.parser import HTMLParser

# Import the text cleaner
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from narration_text_cleaner import (
    clean_narration_text, is_reference_section, has_interactive_content,
    format_for_tts
)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
NARRATION_DIR = os.path.join(SCRIPT_DIR, "narration")
IOS_NARRATION_DIR = os.path.join(SCRIPT_DIR, "..", "BedtimeStories", "BedtimeStories", "Resources", "narration")

# No chapters are skipped for narration regeneration — all get rebuilt
ALREADY_DONE = set()  # Empty — regenerate everything

# Chapters to skip entirely (placeholders, index, etc.)
SKIP_CHAPTERS = {"index", "skimmath", "energy", "vectors", "oscillator",
                 "falling", "harmonic", "jiggling", "ledger"}


def get_all_chapters():
    """Get list of all English chapter base names."""
    chapters = []
    for f in sorted(os.listdir(SCRIPT_DIR)):
        if not f.endswith(".html"):
            continue
        if any(f.endswith(suf) for suf in ["_ko.html", "_kr.html", "-ko.html", "-kr.html"]):
            continue
        base = f.replace(".html", "")
        if base in SKIP_CHAPTERS:
            continue
        chapters.append(base)
    return chapters


class SectionExtractor(HTMLParser):
    """Extract section IDs and text content from HTML.
    
    Improved to:
    - Track headings separately for pause insertion
    - Detect interactive elements
    - Skip reference sections
    - Preserve raw HTML for interactive detection
    """
    def __init__(self):
        super().__init__()
        self.sections = []
        self.current_section_id = None
        self.current_text = []
        self.current_html = []  # Raw HTML for interactive detection
        self.current_headings = []  # Track headings for pause markers
        self.in_section = False
        self.in_script = False
        self.in_style = False
        self.in_footer = False
        self.in_nav = False
        self.depth = 0
        self.section_depth = 0
        self.in_header = False
        self.header_text = ""
        self.in_button = False
        self.in_label = False  # For UI labels like slider labels
        # Track interactive elements per section
        self.section_has_interactive = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "")

        if tag == "script":
            self.in_script = True
            return
        if tag == "style":
            self.in_style = True
            return
        if tag == "footer":
            self.in_footer = True
            return
        if tag == "nav":
            self.in_nav = True
            return
        if tag == "button":
            self.in_button = True
            return
        if tag == "label":
            self.in_label = True
            return

        # Track raw HTML for interactive detection
        if self.in_section:
            self.current_html.append(f"<{tag} class=\"{cls}\">")

        # Detect interactive elements
        if self.in_section and tag in ("canvas", "input"):
            self.section_has_interactive = True
        if self.in_section and any(ic in cls for ic in
                ["demo-card", "interactive", "playground", "simulator",
                 "ibox", "experiment", "controls", "slider"]):
            self.section_has_interactive = True

        if tag == "section":
            self.depth += 1
            sec_id = attrs_dict.get("id", "")
            if self.depth == 1:
                # Auto-generate ID if missing
                if not sec_id:
                    self._auto_id_counter = getattr(self, '_auto_id_counter', 0) + 1
                    sec_id = f"auto-sec-{self._auto_id_counter}"
                # Save previous section
                self._save_current_section()
                self.current_section_id = sec_id
                self.current_text = []
                self.current_html = []
                self.current_headings = []
                self.in_section = True
                self.section_depth = self.depth
                self.section_has_interactive = False

        if tag in ("h1", "h2", "h3"):
            self.in_header = True
            self.header_text = ""

    def handle_endtag(self, tag):
        if tag == "script":
            self.in_script = False
        if tag == "style":
            self.in_style = False
        if tag == "footer":
            self.in_footer = False
        if tag == "nav":
            self.in_nav = False
        if tag == "button":
            self.in_button = False
        if tag == "label":
            self.in_label = False
        if tag == "section":
            if self.depth == self.section_depth:
                self._save_current_section()
                self.in_section = False
            self.depth -= 1
        if tag in ("h1", "h2", "h3"):
            if self.in_header and self.header_text.strip():
                self.current_headings.append(self.header_text.strip())
            self.in_header = False

    def handle_data(self, data):
        if self.in_script or self.in_style or self.in_footer or self.in_nav:
            return
        if self.in_button or self.in_label:
            return  # Skip button/label text
        text = data.strip()
        if not text:
            return
        if self.in_header:
            self.header_text += " " + text
        if self.in_section and self.current_section_id:
            self.current_text.append(text)

    def _save_current_section(self):
        if self.current_section_id and self.current_text:
            full_text = " ".join(self.current_text).strip()
            self.sections.append({
                "id": self.current_section_id,
                "text": full_text,
                "headings": list(self.current_headings),
                "has_interactive": self.section_has_interactive,
                "raw_html": " ".join(self.current_html),
            })
        self.current_section_id = None
        self.current_text = []
        self.current_html = []
        self.current_headings = []
        self.section_has_interactive = False


def extract_sections_from_html(filepath):
    """Parse HTML and extract section IDs + text."""
    with open(filepath, "r", encoding="utf-8") as f:
        html = f.read()

    parser = SectionExtractor()
    try:
        parser.feed(html)
    except Exception:
        pass

    # Catch the last section
    parser._save_current_section()

    return parser.sections


def build_narration_text(section, lang, max_chars=800):
    """Build narration-ready text from a section.
    
    Applies all 8 rules:
    1. Name pronunciation (KO only)
    2. Read actual document text
    3. Skip complex math
    4. § → Section/섹션
    5. Pause after titles
    6. Handle bilingual duplication
    7. Skip references
    8. Pause at interactive modules
    """
    text = section["text"]
    headings = section.get("headings", [])
    has_interactive = section.get("has_interactive", False)
    sec_id = section.get("id", "")

    # Rule 7: Skip reference sections entirely
    if is_reference_section(sec_id, text):
        return ""

    # Clean the text with all rules
    text = format_for_tts(text, lang)

    # Rule 5: Insert pause after titles
    # Build text with heading ... pause ... body
    if headings:
        heading_text = ". ".join(headings)
        heading_text = format_for_tts(heading_text, lang)
        # Remove the heading text from the body to avoid duplication
        body = text
        for h in headings:
            clean_h = format_for_tts(h, lang)
            body = body.replace(clean_h, "", 1).strip()
        # Reconstruct with pause
        if body:
            text = f"{heading_text}.\n\n{body}"
        else:
            text = heading_text

    # Condense to max length (end at sentence boundary)
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) > max_chars:
        truncated = text[:max_chars]
        last_period = max(truncated.rfind(". "), truncated.rfind("。"),
                         truncated.rfind("다. "), truncated.rfind("요. "))
        if last_period > max_chars // 2:
            text = truncated[:last_period + 1]
        else:
            text = truncated.rstrip() + "..."

    return text.strip()


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


def create_narration_json(chapter, en_sections, ko_sections):
    """Create narration JSON for a chapter with clean text."""
    segments = []

    for i, en_sec in enumerate(en_sections):
        # Build English narration text
        text_en = build_narration_text(en_sec, "en")
        if not text_en:
            continue  # Skip empty/reference sections

        seg = {
            "id": len(segments),
            "text_en": text_en,
            "text_ko": "",
            "scroll_to": f"#{en_sec['id']}",
            "pause_after": True,
        }

        # Rule 8: Add interactive pause
        if en_sec.get("has_interactive", False):
            seg["interactive_pause"] = 15  # seconds

        # Try to find matching KO section
        if i < len(ko_sections):
            text_ko = build_narration_text(ko_sections[i], "ko")
            seg["text_ko"] = text_ko

        segments.append(seg)

    return {
        "chapter": chapter,
        "segments": segments
    }


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

    if "NARRATION_CONFIG" in content:
        print(f"  ⏭️  {os.path.basename(filepath)} already has NARRATION_CONFIG")
        return False

    modified = False

    if 'narration_player.css' not in content:
        content = content.replace('</head>', '<link rel="stylesheet" href="narration_player.css">\n</head>')
        modified = True

    config_block = get_narration_config_block(chapter, segments)
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

def phase1_create_jsons(chapters, force=False):
    """Create narration JSON files for all chapters."""
    os.makedirs(NARRATION_DIR, exist_ok=True)

    created = 0
    for chapter in chapters:
        json_path = os.path.join(NARRATION_DIR, f"{chapter}_narration.json")

        if not force and os.path.isfile(json_path) and os.path.getsize(json_path) > 100:
            print(f"  ⏭️  {chapter}_narration.json already exists (use --force to overwrite)")
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
            print(f"  📝 Found KO file: {os.path.basename(ko_path)} ({len(ko_sections)} sections)")

        narration = create_narration_json(chapter, en_sections, ko_sections)

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(narration, f, ensure_ascii=False, indent=2)

        seg_count = len(narration['segments'])
        print(f"  ✅ Created {chapter}_narration.json ({seg_count} segments)")
        created += 1

    print(f"\n📊 Phase 1 complete: {created} narration JSONs created")


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

        en_path = os.path.join(SCRIPT_DIR, f"{chapter}.html")
        if os.path.isfile(en_path):
            if inject_narration_into_html(en_path, chapter, segments):
                injected += 1

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
            "--force",  # Always regenerate
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
    parser.add_argument("--force", action="store_true",
                        help="Force overwrite existing files")

    args = parser.parse_args()

    chapters = get_all_chapters()
    # No longer skip "already done" chapters — regenerate all
    all_chapters = chapters

    if args.chapter:
        all_chapters = [args.chapter]

    print(f"📋 Total chapters to process: {len(all_chapters)}")

    api_key = args.api_key or os.environ.get("ELEVENLABS_API_KEY", "")

    if args.phase in ("1", "all"):
        print(f"\n{'='*60}")
        print("🔨 PHASE 1: Creating narration JSON files")
        print(f"{'='*60}")
        phase1_create_jsons(all_chapters, force=args.force)

    if args.phase in ("2", "all"):
        print(f"\n{'='*60}")
        print("💉 PHASE 2: Injecting narration player into HTMLs")
        print(f"{'='*60}")
        phase2_inject_players(all_chapters)

    if args.phase in ("3", "all"):
        if not api_key and not args.dry_run:
            print("❌ No API key. Use --api-key or set ELEVENLABS_API_KEY")
            sys.exit(1)
        print(f"\n{'='*60}")
        print("🎙️  PHASE 3: Generating TTS audio via ElevenLabs")
        print(f"{'='*60}")
        phase3_generate_tts(all_chapters, api_key, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
