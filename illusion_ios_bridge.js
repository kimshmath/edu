/* ═══════════════════════════════════════════════════════ */
/*  illusion_ios_bridge.js – iOS bridge for Illusion ch   */
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
  const hapticSuccess = () => haptic('success');

  function throttle(fn, delay) {
    let last = 0;
    return function(...args) { const now = Date.now(); if (now - last >= delay) { last = now; fn.apply(this, args); } };
  }

  // Audio overlay entry
  const aoStart = document.getElementById('ao-start');
  if (aoStart) aoStart.addEventListener('click', () => hapticMedium());

  // § 1 — Same Image / Reset
  const s1Same = document.getElementById('s1-same');
  if (s1Same) s1Same.addEventListener('click', () => hapticMedium());
  const s1Reset = document.getElementById('s1-reset');
  if (s1Reset) s1Reset.addEventListener('click', () => hapticLight());

  // § 2 — Vanishing point: reset, grid toggle
  const s2Reset = document.getElementById('s2-reset');
  if (s2Reset) s2Reset.addEventListener('click', () => hapticLight());
  const s2Grid = document.getElementById('s2-grid-toggle');
  if (s2Grid) s2Grid.addEventListener('click', () => hapticLight());

  // § 4 — Perspective / Ortho / Fog buttons
  ['s4-persp', 's4-ortho', 's4-fog'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => hapticMedium());
  });

  // § 5 — Color canvas interaction
  const s5Canvas = document.getElementById('s5-canvas');
  if (s5Canvas) s5Canvas.addEventListener('pointerdown', () => hapticLight());

  // § 6 — Bayesian canvas
  const s6Canvas = document.getElementById('s6-canvas');
  if (s6Canvas) s6Canvas.addEventListener('pointerdown', () => hapticLight());

  // § 7 — Ames room slider
  const s7Slider = document.getElementById('s7-slider');
  if (s7Slider) s7Slider.addEventListener('input', throttle(hapticLight, 100));

  // Hero canvas interaction
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas) heroCanvas.addEventListener('pointerdown', () => hapticLight());

  // Hero "found it" detection
  const heroFound = document.getElementById('hero-found');
  if (heroFound) {
    const obs = new MutationObserver(() => {
      if (heroFound.style.display !== 'none' || heroFound.style.opacity === '1') {
        hapticSuccess();
      }
    });
    obs.observe(heroFound, { attributes: true, attributeFilter: ['style', 'class'] });
  }

  // Section nav
  const secNav = document.getElementById('sec-nav');
  if (secNav) {
    secNav.addEventListener('click', function(e) {
      if (e.target.closest('a, button')) hapticLight();
    });
  }

  // Narration anchors
  window.illusion_sections = { hero:'#hero', eye:'#sec-eye', vp:'#sec-vp', light:'#sec-light', walk:'#sec-walk', color:'#sec-color', bayes:'#sec-bayes', ames:'#sec-ames' };

  console.log('[illusion_ios_bridge] iOS bridge loaded – haptics enabled');
})();
