import sys
import json
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import time
import os

LANGUAGES = ['zh', 'fr', 'de', 'it', 'ja', 'es', 'th', 'vi']
FILES = ['banach.html', 'drum.html', 'sound.html', 'hyperbolic.html']

def translate(text, target_lang):
    text_clean = text.strip()
    if not text_clean:
        return text
    if len(text_clean) <= 1 or text_clean.isdigit():
        return text
    url = f'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q=' + urllib.parse.quote(text_clean)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req).read().decode('utf-8')
        data = json.loads(res)
        translated = "".join([x[0] for x in data[0] if x[0] is not None])
        return translated
    except Exception as e:
        print(f"Error translating '{text_clean[:20]}': {e}")
        return text_clean

def process_file(filepath, outpath, target_lang):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    soup = BeautifulSoup(html, 'html.parser')
    
    for element in list(soup.find_all(string=True)):
        parent = element.parent
        if parent is None:
            continue
        if parent.name in ['script', 'style', 'head', 'meta', 'link']:
            continue
            
        classes = parent.get('class', [])
        if 'math' in classes or 'eq' in classes:
            continue

        text = str(element)
        if text.strip() and len(text.strip()) > 1:
            if any(c.isalpha() for c in text): # Has letters
                translated = translate(text.strip(), target_lang)
                left_space = text[:len(text)-len(text.lstrip())]
                right_space = text[len(text.rstrip()):]
                element.replace_with(left_space + translated + right_space)
                time.sleep(0.02) # gentle delay

    # some attributes
    for element in soup.find_all(title=True):
        element['title'] = translate(element['title'], target_lang)

    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Generated {outpath}")

def main():
    for f in FILES:
        for lang in LANGUAGES:
            base, ext = os.path.splitext(f)
            outpath = f"{base}_{lang}.html"
            # skip if already exists and is mostly done, or re-run
            # for safety we just write over everything except pre-existing Korean versions etc (already skipped since we iterate only over missing langs explicitly)
            process_file(f, outpath, lang)
            
if __name__ == '__main__':
    main()
