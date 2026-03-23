/* 
   drum_ios_bridge.js — iOS native bridge for Mellow Math "Shape of a Drum"
   Only activates when running inside WKWebView
*/

(function() {
  'use strict';

  const isWebView = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge;
  if (!isWebView) return;

  console.log('🥁 Mellow Math Drum iOS bridge active');

  function postNative(action, data) {
    try {
      window.webkit.messageHandlers.nativeBridge.postMessage(
        Object.assign({ action: action }, data || {})
      );
    } catch (e) {
      console.warn('Native bridge error:', e);
    }
  }

  function haptic(style) {
    postNative('hapticFeedback', { style: style || 'medium' });
  }

  // 1. AUTO-INITIALIZE AUDIO CONTEXT
  document.addEventListener('DOMContentLoaded', function() {
    let audioInitialized = false;
    document.addEventListener('touchstart', function initOnTouch() {
      // In drum.html, audio contexts are usually initialized inside specific classes (e.g. StrikeCtx, PlayBeat),
      // we just try to resume the global AudioContext if it exists globally, or let the local scripts handle it.
      // Usually the first touch is enough for Safari to unlock audio.
      if (!audioInitialized) {
        audioInitialized = true;
        haptic('light');
      }
    }, { once: true, passive: true });
  });

  // 2. HAPTIC FEEDBACK
  document.addEventListener('click', function(e) {
    // Canvas impacts (heavy haptic to feel like a drum strike)
    if (e.target.id === 'strike-canvas' || e.target.id === 'hero-canvas' || e.target.closest('#sec-iso canvas')) {
      haptic('heavy');
      return;
    }
    
    // Mode selection cards
    if (e.target.closest('.mode-card') || e.target.closest('.bp')) {
      haptic('selection');
      return;
    }

    // Play buttons
    if (e.target.closest('.beat-play-btn') || e.target.closest('#weyl-replay') || e.target.closest('.action-btn')) {
      haptic('medium');
      return;
    }

    // Toggle Phase
    if (e.target.closest('.phasor-toggle')) {
      haptic('selection');
      return;
    }

  }, { passive: true });

  // 3. NARRATION RESUME (Auto-resume when user interacts)
  const interactiveSelectors = [
    '#strike-canvas',
    '.phasor-toggle',
    '.mode-card',
    '.bp',
    '.beat-play-btn',
    '#three-play-btn',
    '#weyl-replay',
    '#iso-canvas', /* actual id might just be inside #sec-iso */
    '#sec-iso canvas',
    '.action-btn'
  ];

  document.addEventListener('click', function(e) {
    for (const sel of interactiveSelectors) {
      if (e.target.closest(sel)) {
        postNative('narrationResume');
        return;
      }
    }
  }, { passive: true });

  // 4. PREVENT DOUBLE-TAP ZOOM ON CANVASES
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('canvas').forEach(function(canvas) {
      canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) return; // allow pinch but prevent double tap to zoom
      }, { passive: true });
    });
  });

})();
