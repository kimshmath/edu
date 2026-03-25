/* ═══════════════════════════════════════════════════════ */
/*  ghost_ios_bridge.js – iOS bridge for Ghost chapter    */
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
  const hapticWarning = () => haptic('warning');

  function throttle(fn, delay) {
    let last = 0;
    return function(...args) { const now = Date.now(); if (now - last >= delay) { last = now; fn.apply(this, args); } };
  }

  // § 0 — A/B listening test
  const abA = document.getElementById('ab-a');
  const abB = document.getElementById('ab-b');
  if (abA) abA.addEventListener('click', () => hapticMedium());
  if (abB) abB.addEventListener('click', () => hapticMedium());

  const abReveal = document.getElementById('ab-reveal-btn');
  if (abReveal) abReveal.addEventListener('click', () => hapticHeavy());

  // Monitor A/B result
  const abResult = document.getElementById('ab-result-text');
  if (abResult) {
    const obs = new MutationObserver(() => {
      const txt = abResult.textContent.toLowerCase();
      if (txt.includes('correct')) hapticSuccess();
      else if (txt.length > 0) hapticWarning();
    });
    obs.observe(abResult, { childList: true, characterData: true, subtree: true });
  }

  // Play buttons
  ['btn-play-a', 'btn-play-b'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => hapticLight());
  });

  // § 0b — Real vs synth comparison
  const rvsReal = document.getElementById('rvs-real-btn');
  const rvsSynth = document.getElementById('rvs-synth-btn');
  if (rvsReal) rvsReal.addEventListener('click', () => hapticMedium());
  if (rvsSynth) rvsSynth.addEventListener('click', () => hapticMedium());

  // Instrument grid items
  const instGrid = document.getElementById('realvsynth-grid') || document.getElementById('instrument-grid');
  if (instGrid) {
    instGrid.addEventListener('click', function(e) {
      const item = e.target.closest('.instrument-card, .instrument-item');
      if (item) hapticLight();
    });
  }

  // § 2 — Anatomy instrument grid
  const anatGrid = document.getElementById('instrument-grid');
  if (anatGrid) {
    anatGrid.addEventListener('click', function(e) {
      const item = e.target.closest('.instrument-card, .instrument-item');
      if (item) hapticLight();
    });
  }
  const anatomyPlay = document.getElementById('anatomy-play');
  if (anatomyPlay) anatomyPlay.addEventListener('click', () => hapticMedium());

  // § 3 — Fourier harmonics slider
  const fourierN = document.getElementById('fourier-n');
  if (fourierN) fourierN.addEventListener('input', throttle(hapticLight, 100));
  const fourierPlay = document.getElementById('fourier-play');
  if (fourierPlay) fourierPlay.addEventListener('click', () => hapticMedium());

  // § 4 — Synth method buttons
  const synthBtns = document.getElementById('synth-method-btns');
  if (synthBtns) {
    synthBtns.addEventListener('click', function(e) {
      if (e.target.closest('button')) hapticMedium();
    });
  }

  // § 4 — Karplus-Strong sliders
  const ksFreq = document.getElementById('ks-freq');
  if (ksFreq) ksFreq.addEventListener('input', throttle(hapticLight, 100));
  const ksDamp = document.getElementById('ks-damp');
  if (ksDamp) ksDamp.addEventListener('input', throttle(hapticLight, 100));

  // Audio gate button
  const audioGate = document.querySelector('#audio-gate button');
  if (audioGate) audioGate.addEventListener('click', () => hapticMedium());

  // Narration anchors
  window.ghost_sections = { hero:'#hero', abtest:'#s0', realvsynth:'#s0b', history:'#s1', anatomy:'#s2', fourier:'#s3', synthesis:'#s4' };

  console.log('[ghost_ios_bridge] iOS bridge loaded – haptics enabled');
})();
