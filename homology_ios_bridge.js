/* homology_ios_bridge.js - iOS specific enhancements for Homology chapter */

// Force dark mode meta tag for optimal iOS experience
const metaColors = document.createElement('meta');
metaColors.name = "color-scheme";
metaColors.content = "dark";
document.head.appendChild(metaColors);

// Haptic feedback utility
function triggerHaptic(style) {
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
        window.webkit.messageHandlers.nativeBridge.postMessage({
            type: 'haptic',
            style: style
        });
    }
}

// Throttler for continuous events (like canvas dragging)
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const throttledSelection = throttle(() => triggerHaptic('selection'), 150);
const throttledLight = throttle(() => triggerHaptic('light'), 100);

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Surface Gallery Buttons
    const galleryBtns = document.querySelectorAll('.surface-btn');
    galleryBtns.forEach(btn => {
        btn.addEventListener('pointerdown', () => triggerHaptic('selection'));
    });

    // 2. Surface View Canvas 3D Rotation
    const svCanvas = document.getElementById('surfaceViewCanvas');
    if (svCanvas) {
        svCanvas.addEventListener('pointermove', (e) => {
            if (e.buttons > 0) throttledSelection();
        });
    }

    // 3. Simplicial Complex Builder Buttons
    const simplexWrap = document.getElementById('simplexEditor');
    if (simplexWrap) {
        const btns = simplexWrap.querySelectorAll('.ctrl-btn');
        btns.forEach(btn => {
            btn.addEventListener('pointerdown', () => triggerHaptic('light'));
        });
    }
    
    const simplexCanvas = document.getElementById('simplexCanvas');
    if (simplexCanvas) {
        simplexCanvas.addEventListener('pointermove', (e) => {
             if (e.buttons > 0) throttledSelection();
        });
    }

    // 4. Dual Polyhedron controls
    const dualSelect = document.getElementById('dualSelect');
    if (dualSelect) dualSelect.addEventListener('change', () => triggerHaptic('selection'));
    
    const btnDualize = document.getElementById('btnDualize');
    if (btnDualize) btnDualize.addEventListener('pointerdown', () => triggerHaptic('medium'));

    // 5. Torus Dual Canvas (Dragging handles)
    const torusDualCanvas = document.getElementById('torusDualCanvas');
    if (torusDualCanvas) {
        torusDualCanvas.addEventListener('pointermove', (e) => {
             if (e.buttons > 0) throttledSelection();
        });
    }

    // 6. 3-Torus Canvas (Rotation)
    const t3Canvas = document.getElementById('t3Canvas');
    if (t3Canvas) {
        t3Canvas.addEventListener('pointermove', (e) => {
             if (e.buttons > 0) throttledSelection();
        });
    }

    // 7. Genus Slider
    const genusSlider = document.getElementById('genusSlider');
    if (genusSlider) {
        genusSlider.addEventListener('input', throttledSelection);
    }

    // 8. Homology Sphere Interactive Canvas
    const homSphereInteractive = document.getElementById('homSphereInteractive');
    if (homSphereInteractive) {
        homSphereInteractive.addEventListener('pointermove', (e) => {
             if (e.buttons > 0) throttledSelection();
        });
    }

    // Report scroll position for Narration engine syncing
    window.addEventListener("scroll", throttle(() => {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
            window.webkit.messageHandlers.nativeBridge.postMessage({
                type: 'scroll',
                y: window.scrollY
            });
        }
    }, 500));
});

// Expose Narration controls to Swift Native Bridge
window.mellowMath = {
    pauseNarration: function() {
        // Handled automatically by native side mostly, but useful for interactive overrides
    },
    resumeNarration: function() {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge) {
            window.webkit.messageHandlers.nativeBridge.postMessage({
                type: 'narrationResume'
            });
        }
    }
};
