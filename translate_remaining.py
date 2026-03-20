import sys
import json
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import time
import os

def translate(text, target_lang):
    text_clean = text.strip()
    if not text_clean:
        return text
    if len(text_clean) <= 1 or text_clean.isdigit():
        return text
    # mapping zh to zh-CN for google translate if needed, but zh works well too
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
                time.sleep(0.01) # gentle delay

    for element in soup.find_all(title=True):
        element['title'] = translate(element['title'], target_lang)

    with open(outpath, 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print(f"Generated {outpath}")

def main():
    print("Translating Banach to KO")
    process_file('banach.html', 'banach_ko.html', 'ko')

    print("Translating CLT to all 9 languages")
    langs = ['ko', 'zh-CN', 'fr', 'de', 'it', 'ja', 'es', 'th', 'vi']
    # Wait, the filenames use 'zh', not 'zh-CN'
    for tgt in langs:
        file_lang = 'zh' if tgt == 'zh-CN' else tgt
        process_file('clt.html', f'clt_{file_lang}.html', tgt)

if __name__ == '__main__':
    main()
