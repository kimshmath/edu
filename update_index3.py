import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

titles_map = {
    'banach': 'Banach–Tarski: F₂ on S²',
    'drum': 'Can You Hear the Shape of a Drum?',
    'sound': 'The Mathematics of Sound',
    'hyperbolic': 'Living in a Hyperbolic Space',
    'clt': 'Why do the polls look the same??'
}

for base, ttext in titles_map.items():
    # Because of slightly varying whitespace, let's use regex
    pattern = re.compile(
        rf'<span class="proj-title">{re.escape(ttext)}</span>\s*<div class="proj-langs">\s*<select class="lang-select" aria-label="Language selection" onchange="window\.location\.href=this\.value">',
        re.DOTALL
    )
    
    replacement = f'''<a href="javascript:void(0)" class="proj-title-link" onclick="window.location.href=document.getElementById('sel-{base}').value"><span class="proj-title">{ttext}</span></a>
        <div class="proj-langs">
          <select id="sel-{base}" class="lang-select" aria-label="Language selection">'''
          
    text = pattern.sub(replacement, text)

# Add CSS for .proj-title-link
css = """
.proj-title-link {
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  display: inline-block;
}
.proj-title-link:hover .proj-title {
  color: var(--gold);
  text-shadow: 0 0 12px var(--glow-gold);
}
.proj-title-link .proj-title {
  transition: color 0.2s, text-shadow 0.2s;
}
"""
if '.proj-title-link {' not in text:
    text = text.replace('</style>', css + '</style>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated index.html to separate language selection and navigation.")
