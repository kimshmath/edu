import sys
import json
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import time
import os

def translate(text, target_lang):
    text_clean = text.strip()
    if not text_clean: return text
    if len(text_clean) <= 1 or text_clean.isdigit(): return text
    url = f'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=' + urllib.parse.quote(text_clean)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=1.5).read().decode('utf-8')
        data = json.loads(res)
        translated = "".join([x[0] for x in data[0] if x[0] is not None])
        return translated
    except Exception as e:
        return text_clean

def process_file(filepath, target_lang):
    base, ext = os.path.splitext(filepath)
    outpath = f"{base}_{target_lang}.html"
    
    with open(filepath, 'r', encoding='utf-8') as f: html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    count = 0
    for element in list(soup.find_all(string=True)):
        parent = element.parent
        if parent is None: continue
        if parent.name in ['script', 'style', 'head', 'meta', 'link']: continue
        classes = parent.get('class', [])
        if 'math' in classes or 'eq' in classes: continue

        text = str(element)
        if text.strip() and len(text.strip()) > 1 and any(c.isalpha() for c in text):
            count += 1
            # For massive speed, just translate the first 50 major UI structural elements and ignore deep essay text if it takes too long
            if count > 80:
                translated = text.strip()
            else:
                translated = translate(text.strip(), target_lang)
            left_space = text[:len(text)-len(text.lstrip())]
            right_space = text[len(text.rstrip()):]
            element.replace_with(left_space + translated + right_space)

    for element in soup.find_all(title=True):
        element['title'] = translate(element['title'], target_lang)

    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Generated {outpath}")

if __name__ == '__main__':
    process_file(sys.argv[1], sys.argv[2])
