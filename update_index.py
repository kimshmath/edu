import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS Wrapper
content = content.replace('.pentagon-wrapper', '.hexagon-wrapper')
content = content.replace('PENTAGONAL LAYOUT', 'HEXAGONAL LAYOUT')
content = content.replace('Pentagon vertex positions', 'Hexagon vertex positions')
content = content.replace('pentagon-lines', 'hexagon-lines')

# 2. Add 'mechanics' hover state CSS
mechanics_css = """
    .category-card[data-cat="mechanics"]:hover {
      border-color: rgba(255, 69, 58, 0.3);
      background: rgba(255, 69, 58, 0.05);
      box-shadow: 0 0 30px rgba(255, 69, 58, 0.08);
    }
"""
content = re.sub(r'(\.category-card\[data-cat="machine"\]:hover \{.*?\})', r'\1\n' + mechanics_css, content, flags=re.DOTALL)

# 3. Hexagon vertex positions replacement
old_positions = """    .category-card[data-cat="space"] {
      left: 50%; top: 12%;
      animation-delay: 0.1s;
    }
    .category-card[data-cat="flow"] {
      left: 14%; top: 38%;
      animation-delay: 0.18s;
    }
    .category-card[data-cat="quantum"] {
      left: 86%; top: 38%;
      animation-delay: 0.26s;
    }
    .category-card[data-cat="sense"] {
      left: 26%; top: 78%;
      animation-delay: 0.34s;
    }
    .category-card[data-cat="machine"] {
      left: 74%; top: 78%;
      animation-delay: 0.42s;
    }"""
new_positions = """    .category-card[data-cat="space"] {
      left: 50%; top: 5%;
      animation-delay: 0.1s;
    }
    .category-card[data-cat="quantum"] {
      left: 90%; top: 28%;
      animation-delay: 0.18s;
    }
    .category-card[data-cat="machine"] {
      left: 90%; top: 72%;
      animation-delay: 0.26s;
    }
    .category-card[data-cat="mechanics"] {
      left: 50%; top: 95%;
      animation-delay: 0.34s;
    }
    .category-card[data-cat="sense"] {
      left: 10%; top: 72%;
      animation-delay: 0.42s;
    }
    .category-card[data-cat="flow"] {
      left: 10%; top: 28%;
      animation-delay: 0.50s;
    }"""
content = content.replace(old_positions, new_positions)

# 4. Mobile media query fix
old_mobile = """      .category-card[data-cat="space"] { left: 50%; top: 10%; }
      .category-card[data-cat="flow"] { left: 10%; top: 38%; }
      .category-card[data-cat="quantum"] { left: 90%; top: 38%; }
      .category-card[data-cat="sense"] { left: 22%; top: 82%; }
      .category-card[data-cat="machine"] { left: 78%; top: 82%; }"""
new_mobile = """      .category-card[data-cat="space"] { left: 50%; top: 3%; }
      .category-card[data-cat="quantum"] { left: 93%; top: 26%; }
      .category-card[data-cat="machine"] { left: 93%; top: 74%; }
      .category-card[data-cat="mechanics"] { left: 50%; top: 97%; }
      .category-card[data-cat="sense"] { left: 7%; top: 74%; }
      .category-card[data-cat="flow"] { left: 7%; top: 26%; }"""
content = content.replace(old_mobile, new_mobile)

# 5. Insert DOM Card
mechanics_card = """      <!-- Mechanics - bottom vertex -->
      <div class="category-card" data-cat="mechanics" onclick="showCategory('mechanics')">
        <svg class="cat-icon" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="16" stroke="#FF453A" stroke-width="1.4" fill="rgba(255, 69, 58, 0.05)" />
          <path d="M12 20 L28 20" stroke="#FF453A" stroke-width="1" stroke-dasharray="2 2" />
          <path d="M20 12 L20 28" stroke="#FF453A" stroke-width="1" stroke-dasharray="2 2" />
          <circle cx="28" cy="12" r="3" fill="#FF453A" opacity="0.8" />
          <path d="M28 12 Q20 16 12 28" stroke="#FF453A" stroke-width="1.2" fill="none" />
        </svg>
        <div class="cat-label">Mechanics</div>
        <div class="cat-label-ko" style="color:rgba(255, 69, 58, 0.6)">역학</div>
        <div class="cat-desc">Energy, motion, and the physical laws of the universe</div>
        <div class="cat-count" style="color:rgba(255, 69, 58, 0.45)">3 chapters</div>
      </div>
"""
# insert before the center hub
content = content.replace('      <div class="suggest-center"', mechanics_card + '\n      <div class="suggest-center"')

# 6. Add JS Data
mechanics_js = """      mechanics: {
        label: 'Mechanics', labelKo: '역학', color: '#FF453A',
        desc: 'Energy, motion, and the physical laws of the universe',
        descKo: '에너지, 운동, 그리고 우주의 물리 법칙들',
        icon: document.querySelector('[data-cat="mechanics"] .cat-icon').outerHTML,
        chapters: [
          {
            title: 'Conservation of Energy', titleKo: '에너지 보존', tagline: 'Dennis the Menace and the blocks', taglineKo: '데니스의 장난감 블록', difficulty: 1, en: 'energy.html', ko: 'energy_ko.html',
            icon: '<svg viewBox="0 0 56 56" fill="none"><rect x="14" y="24" width="28" height="8" rx="1" stroke="#FF453A" stroke-width="1.2" fill="none"/><line x1="28" y1="24" x2="28" y2="32" stroke="#FF453A" stroke-width="1.2"/><rect x="14" y="24" width="14" height="8" fill="#FF453A" opacity="0.4"/></svg>'
          },
          {
            title: 'Vectors and Motion', titleKo: '벡터와 운동', tagline: 'The arrows that guide the stars', taglineKo: '별을 이끄는 화살표', difficulty: 2, en: 'vectors.html', ko: 'vectors_ko.html',
            icon: '<svg viewBox="0 0 56 56" fill="none"><path d="M16 40 Q28 20 40 16" stroke="#FF453A" stroke-width="1.4" fill="none"/><path d="M34 16 L40 16 L38 22" stroke="#FF453A" stroke-width="1.4" fill="none"/><line x1="16" y1="40" x2="28" y2="28" stroke="#FF453A" stroke-width="1.2" stroke-dasharray="2 2" /><path d="M22 28 L28 28 L26 34" stroke="#FF453A" stroke-width="1.2" fill="none"/></svg>'
          },
          {
            title: 'Harmonic Oscillators', titleKo: '조화 진동자', tagline: 'The universal rhythm', taglineKo: '우주적 리듬', difficulty: 3, en: 'oscillator.html', ko: 'oscillator_ko.html',
            icon: '<svg viewBox="0 0 56 56" fill="none"><path d="M10 28 Q16 12 28 28 T46 28" stroke="#FF453A" stroke-width="1.4" fill="none"/><line x1="10" y1="28" x2="46" y2="28" stroke="#FF453A" stroke-width="0.8" opacity="0.3"/></svg>'
          }
        ]
      },
"""
content = re.sub(r'(      machine: \{.*?\},\n)', r'\1' + mechanics_js, content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
