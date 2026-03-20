import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

titles = ['banach', 'drum', 'sound', 'hyperbolic', 'clt']
for base in titles:
    # Replace the dropdown block with the simple 2-button block
    pattern = re.compile(rf'<div class="proj-langs">\s*<select id="sel-{base}".*?</select>\s*</div>', re.DOTALL)
    
    new_html = f'''<div class="proj-langs">
          <a href="{base}.html" class="lang-btn">EN</a>
          <a href="{base}_ko.html" class="lang-btn">한국어</a>
        </div>'''
    
    text = pattern.sub(new_html, text)

    # Revert the title link back to just a span without onclick
    # Earlier we replaced <span class="proj-title">...</span> with an <a> tag
    # Let's find `<a href="javascript:void(0)" class="proj-title-link" onclick="...">...</a>`
    pattern2 = re.compile(rf'<a href="javascript:void\(0\)" class="proj-title-link" onclick="[^"]*"><span class="proj-title">(.*?)</span></a>')
    
    text = pattern2.sub(r'<span class="proj-title">\1</span>', text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Restored index.html to 2 buttons.")
