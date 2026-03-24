import os

html_dirs = [
    "/Users/kimsh/.gemini/antigravity/playground/icy-armstrong/BedtimeStories/BedtimeStories/Resources/html",
    "/Users/kimsh/.gemini/antigravity/playground/icy-armstrong/edu"
]

count = 0
for html_dir in html_dirs:
    for f in os.listdir(html_dir):
        if f.endswith('.html'):
            path = os.path.join(html_dir, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            if '􀯶' in content:
                content = content.replace('􀯶', '✨')
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                count += 1

print(f"Replaced missing icon in {count} HTML files.")
