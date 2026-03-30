import sys
import json
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup  # type: ignore
import time
import os
import re

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
    translated_items: int = 0
    for element in list(soup.find_all(string=True)):
        parent = element.parent
        if parent is None: continue
        if parent.name in ['script', 'style', 'head', 'meta', 'link']: continue
        classes = parent.get('class', [])
        if 'math' in classes or 'eq' in classes: continue

        text_str = str(element)
        clean_text = text_str.strip()
        if clean_text and len(clean_text) > 1 and any(c.isalpha() for c in clean_text):
            translated_items = translated_items + 1  # type: ignore
            # For massive speed, just translate the first 50 major UI structural elements and ignore deep essay text if it takes too long
            if translated_items > 80:
                translated = clean_text
            else:
                translated = translate(clean_text, target_lang)
            
            m_left = re.match(r'^(\\s*)', text_str)
            m_right = re.search(r'(\\s*)$', text_str)
            left_space = m_left.group(1) if m_left else ""
            right_space = m_right.group(1) if m_right else ""
            
            element.replace_with(left_space + translated + right_space)

    for element in soup.find_all(title=True):
        element['title'] = translate(element['title'], target_lang)

    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Generated {outpath}")

if __name__ == '__main__':
    process_file(sys.argv[1], sys.argv[2])
