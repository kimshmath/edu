import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Add styles for the dropdown
select_css = """
.lang-select {
  background: transparent;
  color: var(--teal);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  cursor: pointer;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2322b5aa%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right .5rem top 50%;
  background-size: .45rem auto;
  padding-right: 1.4rem;
}
.lang-select:hover {
  border-color: var(--teal);
}
.lang-select option {
  background: var(--surface);
  color: var(--cream);
}
"""
if '.lang-select {' not in text:
    text = text.replace('</style>', select_css + '</style>')

titles = ['banach', 'drum', 'sound', 'hyperbolic', 'clt']
for base in titles:
    lang_html = f'''        <div class="proj-langs">
          <select class="lang-select" aria-label="Language selection" onchange="window.location.href=this.value">
            <option value="{base}.html">EN</option>
            <option value="{base}_ko.html">한국어</option>
            <option value="{base}_zh.html">中文</option>
            <option value="{base}_fr.html">FR</option>
            <option value="{base}_de.html">DE</option>
            <option value="{base}_it.html">IT</option>
            <option value="{base}_ja.html">日本語</option>
            <option value="{base}_es.html">ES</option>
            <option value="{base}_th.html">TH</option>
            <option value="{base}_vi.html">VI</option>
          </select>
        </div>'''
    
    # Replace existing proj-langs div with new dropdown
    text = re.sub(rf'<div class="proj-langs">\s*<a href="{base}\.html" class="lang-btn">EN.*?</div>', lang_html, text, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated index.html to use dropdowns.")
