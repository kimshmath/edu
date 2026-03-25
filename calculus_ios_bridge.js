/* ═══════════════════════════════════════════════════════ */
/*  calculus_ios_bridge.js – Native iOS bridge for calc   */
/*  Haptic feedback, narration anchors, touch enhancement */
/* ═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Check if running inside iOS WKWebView ──
  const isIOS = !!(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge);
  if (!isIOS) return;

  // ── Haptic helpers ──
  function haptic(style) {
    try {
      window.webkit.messageHandlers.nativeBridge.postMessage({
        action: 'hapticFeedback',
        style: style || 'medium'
      });
    } catch (e) {}
  }

  const hapticLight   = () => haptic('light');
  const hapticMedium  = () => haptic('medium');
  const hapticHeavy   = () => haptic('heavy');
  const hapticSuccess = () => haptic('success');
  const hapticWarning = () => haptic('warning');

  // ── Throttle helper (avoid haptic spam) ──
  function throttle(fn, delay) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  const throttledLight = throttle(hapticLight, 80);

  // ══════════════════════════════════════════
  //  § 1 — Zeno's Arrow: Δt slider
  // ══════════════════════════════════════════
  const zenoSlider = document.getElementById('zenoSlider');
  if (zenoSlider) {
    let lastVal = parseFloat(zenoSlider.value);
    
    zenoSlider.addEventListener('input', function() {
      const val = parseFloat(this.value);
      // Light haptic as user drags
      throttledLight();
      
      // Special haptics at key thresholds
      if (lastVal > 0.01 && val <= 0.01) {
        // Reached the limit! Arrow unfreezes
        hapticSuccess();
      }
      lastVal = val;
    });
  }

  // ══════════════════════════════════════════
  //  § 2 — Draw a Hill
  // ══════════════════════════════════════════
  const hillCanvas = document.getElementById('hillCanvas');
  if (hillCanvas) {
    // Haptic on dot placement (click/touch)
    hillCanvas.addEventListener('pointerdown', function(e) {
      hapticLight();
    });
  }

  // Hill buttons
  const hillRoll = document.getElementById('hillRoll');
  if (hillRoll) {
    hillRoll.addEventListener('click', () => hapticMedium());
  }
  const hillReset = document.getElementById('hillReset');
  if (hillReset) {
    hillReset.addEventListener('click', () => hapticLight());
  }
  const hillUndo = document.getElementById('hillUndo');
  if (hillUndo) {
    hillUndo.addEventListener('click', () => hapticLight());
  }
  const hillPlace = document.getElementById('hillPlace');
  if (hillPlace) {
    hillPlace.addEventListener('click', () => hapticLight());
  }

  // Gravity slider
  const hillGrav = document.getElementById('hillGrav');
  if (hillGrav) {
    hillGrav.addEventListener('input', throttle(hapticLight, 100));
  }

  // ══════════════════════════════════════════
  //  § 3 — Brachistochrone Race
  // ══════════════════════════════════════════
  const brachCanvas = document.getElementById('brachCanvas');
  if (brachCanvas) {
    brachCanvas.addEventListener('pointerdown', function() {
      hapticLight();
    });
  }

  const brachRace = document.getElementById('brachRace');
  if (brachRace) {
    brachRace.addEventListener('click', () => hapticHeavy());
  }
  const brachReset = document.getElementById('brachReset');
  if (brachReset) {
    brachReset.addEventListener('click', () => hapticLight());
  }
  const brachUndo = document.getElementById('brachUndo');
  if (brachUndo) {
    brachUndo.addEventListener('click', () => hapticLight());
  }

  // Monitor race verdict for win/loss haptic
  const brachVerdict = document.getElementById('brachVerdict');
  if (brachVerdict) {
    const verdictObs = new MutationObserver(function() {
      const txt = brachVerdict.textContent.toLowerCase();
      if (txt.includes('you win') || txt.includes('beat')) {
        hapticSuccess();
      } else if (txt.includes('cycloid wins') || txt.includes('loses')) {
        hapticWarning();
      }
    });
    verdictObs.observe(brachVerdict, { childList: true, characterData: true, subtree: true });
  }

  // ══════════════════════════════════════════
  //  § 4 — Riemann Sums
  // ══════════════════════════════════════════
  const riemannSlider = document.getElementById('riemannSlider');
  if (riemannSlider) {
    let lastN = parseInt(riemannSlider.value);
    
    riemannSlider.addEventListener('input', function() {
      const n = parseInt(this.value);
      throttledLight();
      
      // Snap haptics at key values
      if ((n >= 50 && lastN < 50) || (n >= 100 && lastN < 100) || (n >= 200 && lastN < 200)) {
        hapticMedium();
      }
      // Convergence: sum matches exact at high n
      if (n >= 280 && lastN < 280) {
        hapticSuccess();
      }
      lastN = n;
    });
  }

  // Function selector buttons
  ['rFn1', 'rFn2', 'rFn3', 'rFn4'].forEach(function(id) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => hapticMedium());
  });

  // ══════════════════════════════════════════
  //  § 5 — Infinite Staircase (Series)
  // ══════════════════════════════════════════
  const serStep = document.getElementById('serStep');
  if (serStep) {
    serStep.addEventListener('click', () => hapticLight());
  }
  const serRun = document.getElementById('serRun');
  if (serRun) {
    serRun.addEventListener('click', () => hapticMedium());
  }
  const serReset = document.getElementById('serReset');
  if (serReset) {
    serReset.addEventListener('click', () => hapticLight());
  }

  // Series type selector buttons
  ['serHarmonic', 'serBasel', 'serGeometric', 'serAlternating'].forEach(function(id) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => hapticMedium());
  });

  // Monitor series sum for convergence haptic
  const seriesSum = document.getElementById('seriesSum');
  if (seriesSum) {
    let lastSum = 0;
    const sumObs = new MutationObserver(function() {
      const val = parseFloat(seriesSum.textContent);
      if (!isNaN(val) && Math.abs(val - lastSum) < 0.0001 && val > 0) {
        // Series has converged
        hapticSuccess();
      }
      lastSum = val;
    });
    sumObs.observe(seriesSum, { childList: true, characterData: true, subtree: true });
  }

  // ══════════════════════════════════════════
  //  Hero scroll CTA
  // ══════════════════════════════════════════
  const heroScroller = document.querySelector('.hero-scroller');
  if (heroScroller) {
    heroScroller.addEventListener('click', () => hapticLight());
  }

  // ══════════════════════════════════════════
  //  Narration scroll anchors
  // ══════════════════════════════════════════
  // Expose sections for Swift-driven narration scrolling
  window.calculus_sections = {
    hero: '#hero',
    zeno: '#s1',
    hill: '#s2',
    brachistochrone: '#s3',
    riemann: '#s4',
    series: '#s5'
  };

  // Listen for narration scroll events from Swift
  window.addEventListener('scrollToSection', function(e) {
    const sectionId = e.detail && e.detail.section;
    if (sectionId && window.calculus_sections[sectionId]) {
      const el = document.querySelector(window.calculus_sections[sectionId]);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  // ══════════════════════════════════════════
  //  Canvas DPR fix for Retina displays
  // ══════════════════════════════════════════
  // Already handled in each canvas setup, but ensure devicePixelRatio is correct
  if (window.devicePixelRatio > 2) {
    // On 3x devices, cap at 2x for performance
    document.querySelectorAll('canvas').forEach(function(c) {
      if (!c._dprFixed) {
        c._dprFixed = true;
        // Canvas already handles DPR internally
      }
    });
  }

  console.log('[calculus_ios_bridge] iOS bridge loaded – haptics enabled for 5 sections');
})();
