/* ═══════════════════════════════════════════════════════ */
/*  universe_ios_bridge.js – iOS bridge for Universe ch   */
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
  const hapticHeavy = () => haptic('heavy');
  const hapticSuccess = () => haptic('success');

  function throttle(fn, delay) {
    let last = 0;
    return function(...args) { const now = Date.now(); if (now - last >= delay) { last = now; fn.apply(this, args); } };
  }
  const throttledLight = throttle(hapticLight, 80);

  // § 1 — Eratosthenes slider
  const eSlider = document.getElementById('eSlider');
  if (eSlider) {
    let lastVal = 0;
    eSlider.addEventListener('input', function() {
      throttledLight();
      const v = parseInt(this.value);
      if (v > 95 && lastVal <= 95) hapticSuccess(); // measurement complete
      lastVal = v;
    });
  }

  // § 2 — Zoom surface buttons
  document.querySelectorAll('[data-surface]').forEach(btn => {
    btn.addEventListener('click', () => hapticMedium());
  });

  // § 3 — Surface Factory buttons
  const addHandle = document.getElementById('addHandle');
  if (addHandle) addHandle.addEventListener('click', () => hapticMedium());
  const addCrosscap = document.getElementById('addCrosscap');
  if (addCrosscap) addCrosscap.addEventListener('click', () => hapticHeavy());
  const resetFactory = document.getElementById('resetFactory');
  if (resetFactory) resetFactory.addEventListener('click', () => hapticLight());

  // § 4 — Slope slider
  const slopeSlider = document.getElementById('slopeSlider');
  if (slopeSlider) slopeSlider.addEventListener('input', throttle(hapticLight, 100));

  // Slope preset buttons
  ['slopeRational', 'slopeGolden', 'slopeSqrt2', 'slopePi', 'slopeClear'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => hapticMedium());
  });

  // § 4 — Flat torus flight: haptic on edge crossing
  const flightFlash = document.getElementById('flightFlash');
  if (flightFlash) {
    const obs = new MutationObserver(() => {
      if (parseFloat(flightFlash.style.opacity) > 0) hapticLight();
    });
    obs.observe(flightFlash, { attributes: true, attributeFilter: ['style'] });
  }

  // § 5 — Orientability play/reset
  const orientPlay = document.getElementById('orientPlay');
  if (orientPlay) orientPlay.addEventListener('click', () => hapticMedium());
  const orientReset = document.getElementById('orientReset');
  if (orientReset) orientReset.addEventListener('click', () => hapticLight());

  // Monitor orientability status for flip haptic
  const orientStatus = document.getElementById('orientStatus');
  if (orientStatus) {
    const sobs = new MutationObserver(() => {
      const txt = orientStatus.textContent.toLowerCase();
      if (txt.includes('flipped')) hapticHeavy();
      else if (txt.includes('unchanged')) hapticSuccess();
    });
    sobs.observe(orientStatus, { childList: true, characterData: true, subtree: true });
  }

  // § 6 — Klein bottle 4D lift slider
  const kleinSlider = document.getElementById('kleinSlider');
  if (kleinSlider) {
    kleinSlider.addEventListener('input', throttle(hapticLight, 100));
    let lastKlein = 0;
    kleinSlider.addEventListener('input', function() {
      const v = parseInt(this.value);
      if (v >= 95 && lastKlein < 95) hapticSuccess(); // fully lifted to 4D
      lastKlein = v;
    });
  }

  // § 6 — Möbius cut
  const mobiusCut = document.getElementById('mobiusCut');
  if (mobiusCut) mobiusCut.addEventListener('click', () => hapticHeavy());
  const mobiusReset = document.getElementById('mobiusReset');
  if (mobiusReset) mobiusReset.addEventListener('click', () => hapticLight());

  // Hero scroll
  const heroScroll = document.querySelector('.hero-scroll');
  if (heroScroll) heroScroll.addEventListener('click', () => hapticLight());

  // Narration anchors
  window.universe_sections = { hero:'#hero', eratosthenes:'#s1', manifold:'#s2', surfaces:'#s3', flatTorus:'#s4', orient:'#s5', klein:'#s6' };
  window.addEventListener('scrollToSection', function(e) {
    const id = e.detail && e.detail.section;
    if (id && window.universe_sections[id]) {
      const el = document.querySelector(window.universe_sections[id]);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  console.log('[universe_ios_bridge] iOS bridge loaded – haptics enabled');
})();
