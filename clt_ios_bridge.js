/* 
   clt_ios_bridge.js — iOS native bridge for Mellow Math "The Bell Curve"
   Reacts to interactions to provide haptic feedback and resume narration.
*/

(function() {
  'use strict';

  const isWebView = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge;
  if (!isWebView) return;

  console.log('📊 Mellow Math CLT iOS bridge active');

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

  // 1. HAPTIC FEEDBACK FOR CLICKS
  document.addEventListener('click', function(e) {
    // Buttons that do heavy/significant work
    if (e.target.id === 'btn-galton' || e.target.id === 'btn-drop') {
      haptic('heavy');
      return;
    }

    // Standard action buttons
    if (e.target.id === 'btn-stock-run' || e.target.id === 'btn-stock-reset' || e.target.id === 'btn-clear') {
      haptic('medium');
      return;
    }

    // Toggle buttons
    if (e.target.closest('.ptoggle-btn')) {
      haptic('selection');
      return;
    }
  }, { passive: true });

  // 2. SLIDER HAPTICS & RESUME
  const pollSlider = document.getElementById('poll-slider');
  if (pollSlider) {
    let lastSliderVal = pollSlider.value;
    pollSlider.addEventListener('input', function() {
      // Light haptic only when the value noticeably changes to avoid spamming
      if (Math.abs(parseInt(this.value) - lastSliderVal) > 50) {
        haptic('selection');
        lastSliderVal = this.value;
      }
    }, { passive: true });
    
    pollSlider.addEventListener('change', function() {
      postNative('narrationResume');
    }, { passive: true });
  }

  // 3. DRAW PDF CANVAS HAPTICS
  const drawCv = document.getElementById('draw-pdf');
  if (drawCv) {
    let lastDrawTs = 0;
    drawCv.addEventListener('touchmove', function(e) {
      const now = Date.now();
      if (now - lastDrawTs > 100) { // Throttle light haptics while drawing
        haptic('selection');
        lastDrawTs = now;
      }
    }, { passive: false });
    
    // Resume narration after finishing a drawing stroke
    drawCv.addEventListener('touchend', function() {
      postNative('narrationResume');
    }, { passive: true });
  }

  // 4. NARRATION RESUME ON CLICKS
  const interactiveSelectors = [
    '#btn-galton',
    '#btn-stock-run',
    '.ptoggle-btn',
    '#btn-drop'
  ];

  document.addEventListener('click', function(e) {
    for (const sel of interactiveSelectors) {
      if (e.target.closest(sel)) {
        postNative('narrationResume');
        return;
      }
    }
  }, { passive: true });

  // 5. PREVENT DOUBLE-TAP ZOOM ON ALL CANVASES
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('canvas').forEach(function(canvas) {
      canvas.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches.length > 1) return; 
      }, { passive: true });
    });
  });

})();
