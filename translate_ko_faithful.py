import sys, json, urllib.request, urllib.parse, os
from bs4 import BeautifulSoup

def translate(text):
    text_clean = text.strip()
    if not text_clean or len(text_clean) <= 1 or text_clean.isdigit(): return text
    url = f'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=' + urllib.parse.quote(text_clean)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=3).read().decode('utf-8')
        data = json.loads(res)
        translated = "".join([x[0] for x in data[0] if x[0] is not None])
        return translated
    except Exception as e:
        print(f"Error on {text_clean[:20]}")
        return text_clean

def process_file():
    with open('clt.html', 'r', encoding='utf-8') as f: html = f.read()
    soup = BeautifulSoup(html, 'html.parser')
    for element in list(soup.find_all(string=True)):
        parent = element.parent
        if parent is None or parent.name in ['script', 'style', 'head', 'meta', 'link']: continue
        classes = parent.get('class', [])
        if 'math' in classes or 'eq' in classes: continue

        text = str(element)
        if text.strip() and len(text.strip()) > 1 and any(c.isalpha() for c in text):
            translated = translate(text.strip())
            # Replace "Korean Institute for Advanced Study" explicitly
            if "Korea Institute for Advanced Study" in text:
                translated = "고등과학원"
            elif "고등연구원" in translated:
                translated = translated.replace("고등연구원", "고등과학원")
            
            left_space = text[:len(text)-len(text.lstrip())]
            right_space = text[len(text.rstrip()):]
            element.replace_with(left_space + translated + right_space)

    for element in soup.find_all(title=True):
        element['title'] = translate(element['title'])

    with open('clt_ko.html', 'w', encoding='utf-8') as f:
        f.write(str(soup))
    print("Generated faithful clt_ko.html")

if __name__ == '__main__':
    process_file()
