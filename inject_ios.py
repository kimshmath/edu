import os

html_dir = "../BedtimeStories/BedtimeStories/Resources/html"
chapters = ['volume', 'banach-tarski', 'think', 'see', 'speak', 'imagine', 'judge', 'suffer']

for ch in chapters:
    for lang in ["", "-ko", "_ko"]:
        # Handle different naming conventions like volume-ko.html vs think_ko.html
        suffix = lang
        if ch == 'volume' and lang == '_ko': continue
        if ch == 'banach-tarski' and lang == '_ko': continue
        if ch != 'volume' and ch != 'banach-tarski' and lang == '-ko': continue

        fname = f"{ch}{suffix}.html"
        fpath = os.path.join(html_dir, fname)
        if not os.path.exists(fpath):
            continue
            
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if f"{ch}_ios.css" not in content:
            # inject before </head>
            injection = f'\\n    <link rel="stylesheet" href="{ch}_ios.css">\\n    <script src="{ch}_ios_bridge.js"></script>\\n'
            content = content.replace("</head>", injection + "</head>")
            
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Injected into {fname}")
        else:
            print(f"Already injected in {fname}")
