import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Add flex-wrap to .proj-langs style
text = text.replace('.proj-langs {\n  display: flex;', '.proj-langs {\n  display: flex;\n  flex-wrap: wrap;')

titles = {
    '01': 'banach',
    '02': 'drum',
    '03': 'sound',
    '04': 'hyperbolic'
}

for num, base in titles.items():
    if num == '01':
        # banach handles slightly differently as it only has EN initially
        lang_html = f'''        <div class="proj-langs">
          <a href="{base}.html" class="lang-btn">EN</a>
          <a href="{base}_zh.html" class="lang-btn">ZH</a>
          <a href="{base}_fr.html" class="lang-btn">FR</a>
          <a href="{base}_de.html" class="lang-btn">DE</a>
          <a href="{base}_it.html" class="lang-btn">IT</a>
          <a href="{base}_ja.html" class="lang-btn">日本語</a>
          <a href="{base}_es.html" class="lang-btn">ES</a>
          <a href="{base}_th.html" class="lang-btn">TH</a>
          <a href="{base}_vi.html" class="lang-btn">VI</a>
        </div>'''
        text = re.sub(r'<div class="proj-langs">\s*<a href="banach\.html" class="lang-btn">EN.*?</div>', lang_html, text, flags=re.DOTALL)
    else:
        lang_html = f'''        <div class="proj-langs">
          <a href="{base}.html" class="lang-btn">EN</a>
          <a href="{base}_ko.html" class="lang-btn">한국어</a>
          <a href="{base}_zh.html" class="lang-btn">ZH</a>
          <a href="{base}_fr.html" class="lang-btn">FR</a>
          <a href="{base}_de.html" class="lang-btn">DE</a>
          <a href="{base}_it.html" class="lang-btn">IT</a>
          <a href="{base}_ja.html" class="lang-btn">日本語</a>
          <a href="{base}_es.html" class="lang-btn">ES</a>
          <a href="{base}_th.html" class="lang-btn">TH</a>
          <a href="{base}_vi.html" class="lang-btn">VI</a>
        </div>'''
        text = re.sub(rf'<div class="proj-langs">\s*<a href="{base}\.html" class="lang-btn">EN.*?</div>', lang_html, text, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated index.html")
