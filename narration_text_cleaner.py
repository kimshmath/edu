#!/usr/bin/env python3
"""
narration_text_cleaner.py — Post-processing module for narration text.

Applies 8 rules:
1. Proper name pronunciation by nationality
2. Korean narration reads actual Korean text
3. Skip complex math notation
4. § → "Section" (EN) / "섹션" (KO)
5. Pause after titles
6. Handle bilingual text without duplication
7. Skip references
8. 15-second pause at interactive modules
"""

import re

# ─── Rule 1: Name pronunciation dictionary ───────────────────────

# Maps Western names → Korean pronunciation for TTS
# Only used in Korean text; English text keeps original spelling
NAME_KO_PRONUNCIATIONS = {
    # German
    "Weyl": "바일",
    "Gauss": "가우스",
    "Riemann": "리만",
    "Hilbert": "힐베르트",
    "Heisenberg": "하이젠베르크",
    "Schrödinger": "슈뢰딩거",
    "Schrodinger": "슈뢰딩거",
    "Hausdorff": "하우스도르프",
    "Leibniz": "라이프니츠",
    "Euler": "오일러",
    "Cantor": "칸토르",
    "Planck": "플랑크",
    "Born": "보른",
    "Minkowski": "민코프스키",
    "Schwarzschild": "슈바르츠실트",
    "Klein": "클라인",
    "Möbius": "뫼비우스",
    "Mobius": "뫼비우스",
    "Koch": "코흐",
    "Dedekind": "데데킨트",
    "Weierstrass": "바이어슈트라스",
    "Helmholtz": "헬름홀츠",
    "Kirchhoff": "키르히호프",
    "Noether": "뇌터",
    "Gödel": "괴델",
    "Godel": "괴델",
    "Hahn": "한",
    "Banach": "바나흐",

    # French
    "Fourier": "푸리에",
    "Poincaré": "푸앵카레",
    "Poincare": "푸앵카레",
    "Galois": "갈루아",
    "Cauchy": "코시",
    "Laplace": "라플라스",
    "Lagrange": "라그랑주",
    "Lebesgue": "르베그",
    "Mandelbrot": "만델브로",
    "Dirichlet": "디리클레",
    "Bézout": "베주",
    "Bezout": "베주",
    "Navier": "나비에",
    "Stokes": "스토크스",
    "Julia": "줄리아",
    "Fatou": "파투",
    "Borel": "보렐",
    "Hermite": "에르미트",

    # British / American / English-speaking
    "Newton": "뉴턴",
    "Hamilton": "해밀턴",
    "Maxwell": "맥스웰",
    "Dirac": "디랙",
    "Feynman": "파인만",
    "Turing": "튜링",
    "Shannon": "섀넌",
    "Boltzmann": "볼츠만",
    "Bohr": "보어",
    "Hardy": "하디",
    "Ramanujan": "라마누잔",
    "Euclid": "유클리드",
    "Pythagoras": "피타고라스",
    "Archimedes": "아르키메데스",
    "Bernoulli": "베르누이",
    "Fermat": "페르마",

    # Russian / Polish / Eastern European
    "Kolmogorov": "콜모고로프",
    "Perelman": "페렐만",
    "Tarski": "타르스키",
    "Lyapunov": "랴푸노프",
    "Lobachevsky": "로바체프스키",
    "Chebyshev": "체비셰프",
    "Polya": "폴리아",
    "Pólya": "폴리아",

    # Italian
    "Fibonacci": "피보나치",

    # Dutch
    "Huygens": "호이겐스",

    # Hungarian
    "von Neumann": "폰 노이만",
    "Neumann": "노이만",

    # Norwegian
    "Abel": "아벨",

    # Chinese
    "Shor": "쇼어",

    # Japanese
    "Taniyama": "타니야마",
    "Shimura": "시무라",

    # Modern
    "Wiles": "와일즈",
    "Langlands": "랭글랜즈",
    "Thurston": "서스턴",
    "Witten": "위튼",
}


# ─── Rule 3: Math notation handling ──────────────────────────────

# Simple formulas that CAN be read aloud
READABLE_FORMULAS_EN = {
    r"E\s*=\s*mc\^?2": "E equals m c squared",
    r"E\s*=\s*mc²": "E equals m c squared",
    r"F\s*=\s*ma": "F equals m a",
    r"a\^2\s*\+\s*b\^2\s*=\s*c\^2": "a squared plus b squared equals c squared",
    r"e\^{?i\\?pi}?\s*\+\s*1\s*=\s*0": "e to the i pi plus one equals zero",
    r"z²\s*\+\s*c": "z squared plus c",
}

READABLE_FORMULAS_KO = {
    r"E\s*=\s*mc\^?2": "E는 m c 제곱",
    r"E\s*=\s*mc²": "E는 m c 제곱",
    r"F\s*=\s*ma": "F는 m a",
    r"a\^2\s*\+\s*b\^2\s*=\s*c\^2": "a 제곱 더하기 b 제곱은 c 제곱",
    r"e\^{?i\\?pi}?\s*\+\s*1\s*=\s*0": "e의 i 파이 제곱 더하기 1은 0",
    r"z²\s*\+\s*c": "z 제곱 더하기 c",
}


# ─── Rule 7: Reference section detection ─────────────────────────

REFERENCE_KEYWORDS = [
    "reference", "bibliography", "참고문헌", "참고 문헌",
    "further reading", "sources", "citations",
]


# ─── Rule 8: Interactive module detection ─────────────────────────

INTERACTIVE_TAGS = ["canvas", "input", "button"]
INTERACTIVE_CLASSES = [
    "demo-card", "interactive", "playground", "simulator",
    "ibox", "experiment", "controls",
]


# ─── Core cleaning functions ─────────────────────────────────────

def clean_narration_text(text, lang="en"):
    """Apply all cleaning rules to narration text."""
    if not text:
        return text

    # Rule 4: § → "Section" / "섹션"
    text = apply_section_symbol(text, lang)

    # Rule 3: Strip complex math, keep simple formulas
    text = clean_math_notation(text, lang)

    # Rule 6: Handle bilingual duplication
    text = fix_bilingual_duplication(text, lang)

    # Rule 1: Fix name pronunciations (KO only)
    if lang == "ko":
        text = fix_name_pronunciations(text)

    # Strip "Mellow Math" remnants
    text = text.replace("Mellow Math", "").strip()

    # Clean up excessive whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # Remove UI elements that shouldn't be read
    text = remove_ui_elements(text, lang)

    return text


def apply_section_symbol(text, lang):
    """Rule 4: Replace § with spoken word."""
    word = "섹션" if lang == "ko" else "Section"
    # "§ 1" → "Section 1" / "섹션 1"
    text = re.sub(r'§\s*(\d+)', rf'{word} \1', text)
    # Standalone §
    text = text.replace("§", word)
    return text


def clean_math_notation(text, lang):
    """Rule 3: Remove complex math, keep simple readable formulas."""
    formulas = READABLE_FORMULAS_KO if lang == "ko" else READABLE_FORMULAS_EN

    # First, replace known readable formulas with spoken versions
    for pattern, spoken in formulas.items():
        text = re.sub(pattern, spoken, text)

    # Remove LaTeX inline math: \( ... \) or $ ... $
    text = re.sub(r'\\\(.*?\\\)', '', text)
    text = re.sub(r'\$\$.*?\$\$', '', text, flags=re.DOTALL)
    text = re.sub(r'\$[^$]+\$', '', text)

    # Remove MathJax/KaTeX remnants
    text = re.sub(r'\\[a-zA-Z]+\{[^}]*\}', '', text)
    text = re.sub(r'\\[a-zA-Z]+', '', text)

    # Remove complex Unicode math symbols that TTS can't read well
    # Keep basic operators (+, -, =, ×, ÷) but remove complex ones
    text = re.sub(r'[∫∑∏∂∇∆∞≈≠≤≥∈∉⊂⊃⊆⊇∪∩∧∨¬∀∃⟨⟩⟶⟵⟹⟸‖⊗⊕⊥∥]+', '', text)

    # Remove formula-like expressions: fₖ = f₀ × 2 k/12, aₙ · sin(...), etc.
    text = re.sub(r'[a-zA-Z][₀₁₂₃₄₅₆₇₈₉ₙₖ]+\s*[=×·]\s*[^.]*?(?=[.!?]|\s{2,}|$)', '', text)
    
    # Remove subscript/superscript Unicode characters
    text = re.sub(r'[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼ⁿₒ₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₕₖₗₘₙₚₛₜ]+', '', text)
    
    # Remove fraction-like expressions: ¹²√2, 3/2, 531441/4096, etc.
    text = re.sub(r'[¹²³⁴⁵⁶⁷⁸⁹]+√\d+', '', text)
    text = re.sub(r'\b\d{3,}/\d{3,}\b', '', text)  # Large fractions
    
    # Remove cent values like "386.3센트", "701.96센트", "23.46센트" 
    # but keep them in prose context — actually let's keep these, they're readable
    
    # Remove orphaned mathematical fragments (single variables with operators)
    text = re.sub(r'\b[a-z]\s*[=<>]\s*[a-z0-9]+\b', '', text)

    return text


def fix_bilingual_duplication(text, lang):
    """Rule 6: Handle bilingual text to avoid duplication."""
    if lang == "ko":
        # Remove purely English sentences/phrases that appear alongside Korean
        # But keep English terms in parentheses like 한국어(English)
        
        # Remove standalone English-only sentences (3+ English words with no Korean)
        # Pattern: sequence of English words not followed by Korean
        sentences = re.split(r'(?<=[.!?])\s+', text)
        cleaned = []
        for s in sentences:
            s = s.strip()
            if not s:
                continue
            # If sentence has Korean characters, keep it
            if re.search(r'[\uac00-\ud7a3]', s):
                cleaned.append(s)
            # If short English phrase (like a label), skip it  
            elif len(s.split()) <= 3:
                continue
            # If longer English-only sentence in a Korean context, skip
            else:
                continue
        text = ' '.join(cleaned)
        
        # Remove English-only title remnants like "The Mathematics of Sound"
        text = re.sub(r'\bThe\s+[A-Z][a-z]+(?:\s+(?:of|and|the|in|for|a|an|is|to|on|at|by)\s+[A-Za-z]+)*\b', '', text)
        
        # Remove English section numbers like "01 —" at start if followed by Korean
        text = re.sub(r'^\d{2}\s*[—–-]\s*', '', text.strip())
        
    elif lang == "en":
        # Remove any Korean characters from English text
        text = re.sub(r'[\uac00-\ud7a3]+', '', text)

    return text


def fix_name_pronunciations(text):
    """Rule 1: Replace Western names with Korean pronunciations."""
    for name, korean in sorted(NAME_KO_PRONUNCIATIONS.items(), key=lambda x: -len(x[0])):
        # Only replace whole-word matches to avoid partial replacements
        text = re.sub(rf'\b{re.escape(name)}\b', korean, text)
    return text


def remove_ui_elements(text, lang):
    """Remove UI element text that shouldn't be narrated."""
    # Remove numeric values from sliders/displays (e.g., "440 Hz", "0.60")
    text = re.sub(r'\b\d+(\.\d+)?\s*Hz\b', '', text)
    text = re.sub(r'\b\d+(\.\d+)?\s*dB\b', '', text)
    text = re.sub(r'\b[0-9]+\.[0-9]+\b', '', text)  # bare decimals like "0.60"
    
    # Remove note names used as UI labels (C4, E4, G4, A4, C5 etc.)
    text = re.sub(r'\b[A-G]#?[0-9]\b', '', text)
    
    # Remove button labels and UI text
    ui_patterns = [
        r'▶[^.]*?(?=[.!?\n]|$)',  # Play button text
        r'⏸[^.]*?(?=[.!?\n]|$)',  # Pause button text
        r'⟲[^.]*?(?=[.!?\n]|$)',  # Reset button text
        r'🔊[^.]*?(?=[.!?\n]|$)',  # Speaker button text
        r'⟷[^.]*?(?=[.!?\n]|$)',  # Compare button text
    ]
    for p in ui_patterns:
        text = re.sub(p, '', text)
    
    # Remove common UI action words
    if lang == "en":
        for w in ['Begin', 'Start Exploring', 'Enter', 'Scroll', 'found it',
                  'Reset', 'Play', 'Pause', 'Stop']:
            text = re.sub(rf'\b{re.escape(w)}\b', '', text)
    else:
        for w in ['입장', '스크롤']:
            text = text.replace(w, '')
    
    # Remove "Just" and "Equal" as standalone UI labels (not in prose)
    text = re.sub(r'\bJust Intonation\b', '', text) if lang != "en" else text
    text = re.sub(r'\bEqual Temperament\b', '', text) if lang != "en" else text
    
    return text


def is_reference_section(section_id, section_text):
    """Rule 7: Check if a section is a reference/bibliography."""
    check = (section_id + " " + section_text[:200]).lower()
    return any(kw in check for kw in REFERENCE_KEYWORDS)


def has_interactive_content(section_html):
    """Rule 8: Check if section contains interactive elements."""
    html_lower = section_html.lower()
    for tag in INTERACTIVE_TAGS:
        if f"<{tag}" in html_lower:
            return True
    for cls in INTERACTIVE_CLASSES:
        if cls in html_lower:
            return True
    return False


def add_title_pause(text):
    """Rule 5: Insert SSML-style pause after what looks like a title."""
    # ElevenLabs supports ... or — for natural pauses
    # We add a period and line break after short title-like text at the start
    # This is best handled at segment creation time
    return text


# ─── Utility ─────────────────────────────────────────────────────

def format_for_tts(text, lang="en"):
    """Final formatting pass for TTS-ready text."""
    text = clean_narration_text(text, lang)

    # Ensure sentences end properly for natural TTS pacing
    text = re.sub(r'\s+', ' ', text).strip()

    # Add slight pause markers (ElevenLabs respects "..." for pauses)
    # After section headings, we want a pause
    # This is done at the segment level, not here

    return text


if __name__ == "__main__":
    # Quick test
    test_en = "§ 3 — Weyl's Law. The eigenvalues λ_n of the Laplacian satisfy \\(\\lambda_n \\sim \\frac{4\\pi n}{A}\\). E = mc². References: See Kac 1966."
    test_ko = "§ 3 — 바일의 법칙. 라플라시안의 고유값 λ_n은 \\(\\lambda_n \\sim \\frac{4\\pi n}{A}\\)를 만족합니다. E = mc². Weyl은 이를 증명했습니다."

    print("EN:", format_for_tts(test_en, "en"))
    print("KO:", format_for_tts(test_ko, "ko"))
