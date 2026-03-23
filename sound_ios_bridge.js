/* ═══════════════════════════════════════════════
   sound_ios_bridge.js — iOS native bridge for Mellow Math
   Only activates when running inside WKWebView
   ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  // ── Guard: only run in WKWebView ──
  const isWebView = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeBridge;
  if (!isWebView) return;

  console.log('🎵 Mellow Math iOS bridge active');

  // ── Helper: send message to Swift ──
  function postNative(action, data) {
    try {
      window.webkit.messageHandlers.nativeBridge.postMessage(
        Object.assign({ action: action }, data || {})
      );
    } catch (e) {
      console.warn('Native bridge error:', e);
    }
  }

  // ═══════════════════════════════════════════════
  // 1. AUTO-INITIALIZE AUDIO CONTEXT
  // ═══════════════════════════════════════════════

  // Dismiss the audio notice overlay automatically
  document.addEventListener('DOMContentLoaded', function() {
    // Remove audio notice if it exists
    const notice = document.getElementById('audio-notice');
    if (notice) {
      notice.style.display = 'none';
    }

    // Auto-init audio on first touch anywhere
    let audioInitialized = false;
    document.addEventListener('touchstart', function initOnTouch() {
      if (!audioInitialized && typeof initAudio === 'function') {
        initAudio();
        audioInitialized = true;
        postNative('hapticFeedback', { style: 'light' });
      }
    }, { once: true, passive: true });

    // Also try to call it if the function exists
    setTimeout(function() {
      if (!audioInitialized && typeof initAudio === 'function') {
        try { initAudio(); audioInitialized = true; } catch(e) {}
      }
    }, 500);
  });

  // ═══════════════════════════════════════════════
  // 2. HAPTIC FEEDBACK INTEGRATION
  // ═══════════════════════════════════════════════

  function haptic(style) {
    postNative('hapticFeedback', { style: style || 'medium' });
  }

  // ── Sine wave play/stop ──
  function wrapButton(id, hapticStyle) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function() {
        haptic(hapticStyle || 'light');
      }, { passive: true });
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Play buttons
    wrapButton('play-sine-btn', 'light');
    wrapButton('play-fourier-btn', 'light');

    // Interval buttons — haptic on tap
    document.addEventListener('click', function(e) {
      const intervalBtn = e.target.closest('.interval-btn');
      if (intervalBtn) {
        haptic('medium');
        return;
      }

      const instTab = e.target.closest('.inst-tab');
      if (instTab) {
        haptic('light');
        return;
      }

      const chordPill = e.target.closest('.chord-pill');
      if (chordPill) {
        haptic('light');
        return;
      }

      const keyPill = e.target.closest('.key-pill');
      if (keyPill) {
        haptic('selection');
        return;
      }

      const keyColor = e.target.closest('.key-color-cell');
      if (keyColor) {
        haptic('light');
        return;
      }

      const tuningPlay = e.target.closest('.play-tuning-btn');
      if (tuningPlay) {
        haptic('medium');
        return;
      }

      const wolfPlay = e.target.closest('.wolf-play');
      if (wolfPlay) {
        // Wolf fifth = heavy haptic!
        const isPyth = wolfPlay.classList.contains('pyth-p');
        haptic(isPyth ? 'heavy' : 'medium');
        return;
      }

      const twPlay = e.target.closest('.tw-play');
      if (twPlay) {
        haptic('medium');
        return;
      }

      const compareBtn = e.target.closest('.compare-btn');
      if (compareBtn) {
        haptic('medium');
        return;
      }

      const extremePreset = e.target.closest('.extreme-preset');
      if (extremePreset) {
        haptic('light');
        return;
      }

      // Generic button
      const btn = e.target.closest('.btn');
      if (btn) {
        haptic('light');
        return;
      }
    }, { passive: true });

    // ── Frequency slider — haptic tick on change ──
    const freqSlider = document.getElementById('freq-slider');
    if (freqSlider) {
      let lastTick = 0;
      freqSlider.addEventListener('input', function() {
        const now = Date.now();
        if (now - lastTick > 80) { // throttle to ~12 ticks/sec
          haptic('selection');
          lastTick = now;
        }
      }, { passive: true });
    }

    // ── Harmonic sliders ──
    const harmonicContainer = document.getElementById('harmonic-sliders');
    if (harmonicContainer) {
      harmonicContainer.addEventListener('input', function(e) {
        if (e.target.type === 'range') {
          haptic('selection');
        }
      }, { passive: true });
    }
  });

  // ═══════════════════════════════════════════════
  // 3. NARRATION INTEGRATION
  // ═══════════════════════════════════════════════

  // Listen for narration events from Swift
  window.addEventListener('mellowmath_scrollTo', function(e) {
    const selector = e.detail && e.detail.selector;
    if (selector) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // Report significant user interactions back to Swift for narration resume
  const interactiveSelectors = [
    '#play-sine-btn',
    '.interval-btn',
    '.play-tuning-btn',
    '#play-fourier-btn',
    '.wolf-play',
    '.tw-play',
    '.compare-btn'
  ];

  document.addEventListener('click', function(e) {
    for (const sel of interactiveSelectors) {
      if (e.target.closest(sel)) {
        postNative('narrationResume');
        return;
      }
    }
  }, { passive: true });

  // ═══════════════════════════════════════════════
  // 4. SCROLL POSITION REPORTING
  // ═══════════════════════════════════════════════

  const sectionIds = [
    'hero', 'sec-wave', 'sec-pythagoras', 'sec-temperament',
    'sec-instruments', 'sec-extreme', 'sec-wolf', 'sec-bach',
    'sec-fourier', 'sec-timbre', 'sec-brain', 'sec-digital', 'sec-closing'
  ];

  let lastReportedSection = '';
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && entry.target.id !== lastReportedSection) {
        lastReportedSection = entry.target.id;
        postNative('sectionVisible', { sectionId: entry.target.id });
      }
    });
  }, { threshold: 0.3 });

  document.addEventListener('DOMContentLoaded', function() {
    sectionIds.forEach(function(id) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  });

  // ═══════════════════════════════════════════════
  // 5. PREVENT DOUBLE-TAP ZOOM ON CANVASES
  // ═══════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('canvas').forEach(function(canvas) {
      canvas.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) return; // allow pinch
      }, { passive: true });
    });

    // Add viewport meta for iOS
    let viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover';
    }
  });

})();
