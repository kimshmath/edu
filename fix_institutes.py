import os

files = ['banach_ko.html', 'drum_ko.html', 'sound_ko.html', 'hyperbolic_ko.html', 'clt_ko.html']

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            text = file.read()
        
        # Replace occurrences
        text = text.replace('한국고등연구원', '고등과학원')
        text = text.replace('고등연구원', '고등과학원')
        text = text.replace('Korea Institute for Advanced Study<br>AI4Math, KAIST', '고등과학원<br>AI4Math, KAIST')
        text = text.replace('Korea Institute for Advanced Study', '고등과학원')

        with open(f, 'w', encoding='utf-8') as file:
            file.write(text)
        print(f"Fixed {f}")
