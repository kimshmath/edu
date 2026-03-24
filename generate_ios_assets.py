import os
import json

chapters = ['volume', 'banach-tarski', 'think', 'see', 'speak', 'imagine', 'judge', 'suffer']

base_css = """
body {
    background-color: var(--bg);
    color: var(--text);
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
}
.start-btn, .btn, .nav-dot, .point-chip, .vitali-step, .rosetta-simple th, .rosetta-simple td {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
}
.start-btn {
    min-height: 44px;
    padding: 12px 24px;
}
.floating-badge {
    display: none !important;
}
input[type="range"]::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
}
"""

base_js = """
// Connect interactive elements to iOS haptics
document.addEventListener('DOMContentLoaded', () => {
    const postHaptic = (style) => {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
            window.webkit.messageHandlers.nativeBridge.postMessage({ action: 'hapticFeedback', style: style });
        }
    };

    document.querySelectorAll('.btn, .start-btn, button, .nav-dot, .point-chip').forEach(el => {
        el.addEventListener('pointerdown', () => postHaptic('light'));
    });

    document.querySelectorAll('input[type="range"]').forEach(el => {
        el.addEventListener('input', () => postHaptic('light'));
    });
});
"""

base_json = {
    "segments": []
}

html_dir = "../BedtimeStories/BedtimeStories/Resources/html"
narration_dir = "../BedtimeStories/BedtimeStories/Resources/narration"

os.makedirs(html_dir, exist_ok=True)
os.makedirs(narration_dir, exist_ok=True)

for ch in chapters:
    # write CSS
    with open(os.path.join(html_dir, f"{ch}_ios.css"), "w") as f:
        f.write(base_css)
    
    # write JS
    with open(os.path.join(html_dir, f"{ch}_ios_bridge.js"), "w") as f:
        f.write(base_js)
    
    # write JSON
    with open(os.path.join(narration_dir, f"{ch}_narration.json"), "w") as f:
        json.dump(base_json, f)

print("Generated iOS assets for:", chapters)
