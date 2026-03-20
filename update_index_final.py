import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the innerHTML of <select class="lang-select"> ... </select> for each project
titles = ['banach', 'drum', 'sound', 'hyperbolic', 'clt']

for base in titles:
    new_options = f'''
            <option value="{base}.html">EN</option>
            <option value="{base}_ko.html">한국어</option>
            <option value="{base}_zh.html">中文</option>
            <option value="{base}_ja.html">日本語</option>
            <option value="{base}_fr.html">FR</option>
          '''
    pattern = re.compile(rf'<select id="sel-{base}" class="lang-select" aria-label="Language selection">.*?</select>', re.DOTALL)
    replacement = f'<select id="sel-{base}" class="lang-select" aria-label="Language selection">{new_options}</select>'
    text = pattern.sub(replacement, text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated index.html to 5 languages.")
