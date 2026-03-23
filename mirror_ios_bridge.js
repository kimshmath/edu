/* mirror_ios_bridge.js - iOS specific enhancements for Mirror Symmetry chapter */

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

// Throttler for continuous events
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
    
    // 1. Phase Canvas buttons (Hamiltonian selection)
    const hamBtns = document.querySelectorAll('#btnH1, #btnH2, #btnH3');
    hamBtns.forEach(btn => {
        btn.addEventListener('pointerdown', () => triggerHaptic('selection'));
    });
    
    // 2. Lagrangian canvas sliders
    const lagSliders = document.querySelectorAll('#slL1a, #slL1b, #slL2a, #slL2b');
    lagSliders.forEach(slider => {
        slider.addEventListener('input', throttledSelection);
    });

    // 3. Floer homology canvas (Clicking intersection points)
    const floerCanvas = document.getElementById('floerCanvas');
    if (floerCanvas) {
        floerCanvas.addEventListener('pointerdown', () => triggerHaptic('light'));
    }

    // 4. Fukaya category canvas buttons
    const fukBtns = document.querySelectorAll('#btnMu2, #btnMu3');
    fukBtns.forEach(btn => {
        btn.addEventListener('pointerdown', () => triggerHaptic('selection'));
    });

    // 5. Mirror elliptic curve sliders
    const mirrorSliders = document.querySelectorAll('#slMirA, #slMirB, #slMirXi');
    mirrorSliders.forEach(slider => {
        slider.addEventListener('input', throttledSelection);
    });

    // 6. SYZ canvas slider and buttons
    const syzSlider = document.getElementById('slSyz');
    if (syzSlider) {
        syzSlider.addEventListener('input', throttledSelection);
    }
    const syzBtns = document.querySelectorAll('#btnSyzX, #btnSyzY');
    syzBtns.forEach(btn => {
        btn.addEventListener('pointerdown', () => triggerHaptic('selection'));
    });

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
