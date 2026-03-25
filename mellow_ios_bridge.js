/* ═══════════════════════════════════════════════════════ */
/*  mellow_ios_bridge.js – Generic iOS bridge             */
/*  Auto-attaches haptics to all buttons, sliders, canvases */
/* ═══════════════════════════════════════════════════════ */
(function() {
  'use strict';
  const isIOS = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge);
  if (!isIOS) return;

  function haptic(style) {
    try { window.webkit.messageHandlers.nativeBridge.postMessage({ action: 'hapticFeedback', style: style || 'medium' }); } catch(e) {}
  }
  const hapticLight = () => haptic('light');
  const hapticMedium = () => haptic('medium');

  function throttle(fn, delay) {
    let last = 0;
    return function(...args) { const now = Date.now(); if (now - last >= delay) { last = now; fn.apply(this, args); } };
  }
  const throttledLight = throttle(hapticLight, 80);

  // Auto-attach haptics to all buttons
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('button, .ctrl-btn, .btn, .btn-accent, .pill-btn, [role="button"]');
    if (btn) hapticMedium();
  }, true);

  // Auto-attach haptics to all sliders
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', throttledLight);
  });

  // Auto-attach haptics to canvas touches
  document.querySelectorAll('canvas').forEach(canvas => {
    canvas.addEventListener('pointerdown', () => hapticLight());
  });

  // Hide audio overlay/gate buttons with haptic
  const audioOverlay = document.getElementById('audio-overlay') || document.getElementById('audio-gate');
  if (audioOverlay) {
    const btn = audioOverlay.querySelector('button');
    if (btn) btn.addEventListener('click', () => hapticMedium());
  }

  // Hero scroll
  const heroScroll = document.querySelector('.hero-scroll, .hero-scroller');
  if (heroScroll) heroScroll.addEventListener('click', () => hapticLight());

  console.log('[mellow_ios_bridge] Generic iOS bridge loaded – auto-haptics enabled');
})();
