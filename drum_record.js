/* ═══════════════════════════════════════════════════════════════
   drum_record.js — Recording-mode controller for cinematic capture
   
   Append ?record=1 to the drum.html URL to activate.
   
   Controls:
     → / Space / Enter   Next slide
     ←                   Previous slide
     1–9, 0              Jump to slide 1–10
     S                   Trigger a programmatic strike on the drum
     P                   Toggle phasor tones (one at a time)
     B                   Trigger beat playback
     W                   Replay Weyl animation
     T                   Advance timeline items (progressive reveal)
     N                   Cycle nodal modes
     D                   Play nodal domain tones
     F                   Toggle fullscreen
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!new URLSearchParams(window.location.search).has('record')) return;

  window.addEventListener('DOMContentLoaded', function () {
    // Give all scripts time to initialize their canvases
    setTimeout(initRecordMode, 1200);
  });

  /* ──────────────────────────────────────────────────────────── */
  /*  INIT                                                        */
  /* ──────────────────────────────────────────────────────────── */
  function initRecordMode() {

    // 1. Add class first so CSS hides chrome
    document.body.classList.add('record-mode');

    // 2. Load recording CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'drum_record.css';
    document.head.appendChild(link);

    // 3. Hide ALL original page content except scripts
    const origChildren = Array.from(document.body.children);
    const wrapper = document.createElement('div');
    wrapper.id = 'rec-original-content';
    wrapper.style.display = 'none';
    origChildren.forEach(child => {
      if (child.tagName !== 'SCRIPT' && child.tagName !== 'LINK' &&
          !child.classList.contains('rec-slide') &&
          child.id !== 'rec-original-content') {
        wrapper.appendChild(child);
      }
    });
    document.body.appendChild(wrapper);

    // 4. Build slides (these are new divs appended to body)
    const slides = buildSlides(wrapper);
    let currentSlide = 0;

    // 5. UI elements
    const counter = document.createElement('div');
    counter.className = 'rec-counter';
    document.body.appendChild(counter);

    const progressBar = document.createElement('div');
    progressBar.className = 'rec-progress';
    document.body.appendChild(progressBar);

    const hint = document.createElement('div');
    hint.className = 'rec-keys-hint';
    hint.textContent = '← → navigate · S strike · P phasor · W weyl · T timeline · F fullscreen';
    document.body.appendChild(hint);

    // Timeline reveal state
    let timelineRevealed = 0;

    function showSlide(idx) {
      idx = Math.max(0, Math.min(idx, slides.length - 1));
      slides.forEach(function (s, i) {
        if (i === idx) {
          s.el.classList.add('active');
        } else {
          s.el.classList.remove('active');
        }
      });
      currentSlide = idx;
      counter.textContent = (idx + 1) + ' / ' + slides.length;
      progressBar.style.width = (((idx + 1) / slides.length) * 100) + '%';

      // Reset timeline when entering that slide
      if (slides[idx].type === 'timeline') {
        timelineRevealed = 0;
        var items = slides[idx].el.querySelectorAll('.rec-tl-item');
        items.forEach(function (it) { it.classList.remove('visible'); });
      }
    }

    // 6. Keyboard
    document.addEventListener('keydown', function (e) {
      // Prevent default for all our keys
      var handled = true;
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          showSlide(currentSlide + 1);
          break;
        case 'ArrowLeft':
          showSlide(currentSlide - 1);
          break;
        case 'f': case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(function(){});
          } else {
            document.exitFullscreen();
          }
          break;
        case 's': case 'S':
          triggerStrike(wrapper);
          break;
        case 'p': case 'P':
          triggerPhasorToggle(wrapper);
          break;
        case 'b': case 'B':
          triggerBeat(wrapper);
          break;
        case 'w': case 'W':
          triggerWeylReplay(wrapper);
          break;
        case 't': case 'T':
          var tlSlide = slides[currentSlide];
          if (tlSlide && tlSlide.type === 'timeline') {
            var items = tlSlide.el.querySelectorAll('.rec-tl-item');
            if (timelineRevealed < items.length) {
              items[timelineRevealed].classList.add('visible');
              timelineRevealed++;
            }
          }
          break;
        case 'n': case 'N':
          cycleNodalMode(wrapper);
          break;
        case 'd': case 'D':
          triggerNodalTones(wrapper);
          break;
        default:
          var num = parseInt(e.key);
          if (!isNaN(num) && num >= 0 && num <= 9) {
            showSlide(num === 0 ? 9 : num - 1);
          } else {
            handled = false;
          }
      }
      if (handled) { e.preventDefault(); e.stopPropagation(); }
    }, true);  // capture phase!

    showSlide(0);
    console.log('[record] Recording mode active. ' + slides.length + ' slides built.');
  }

  /* ──────────────────────────────────────────────────────────── */
  /*  BUILD SLIDES                                                */
  /* ──────────────────────────────────────────────────────────── */
  function buildSlides(wrapper) {
    var slides = [];

    // Helper: query inside the hidden original DOM
    function q(sel) { return wrapper.querySelector(sel); }
    function qa(sel) { return wrapper.querySelectorAll(sel); }

    // ── 0: HERO ──────────────────────────────────
    var s0 = mkSlide('hero');
    s0.el.classList.add('rec-slide-hero');
    s0.el.innerHTML =
      '<div class="hero-kicker">Spectral Geometry · Fourier Analysis · Mathematical Physics</div>' +
      '<h1 class="hero-title">' +
        '<span class="title-line"><span class="title-word">Can You</span></span>' +
        '<span class="title-line"><span class="title-word hero-italic">Hear</span>&ensp;' +
        '<span class="title-word">the Shape</span></span>' +
        '<span class="title-line"><span class="title-word">of a Drum?</span></span>' +
      '</h1>' +
      '<div class="hero-sub">posed by <em>Mark Kac</em>, 1966 — answered by <em>Gordon, Webb &amp; Wolpert</em>, 1992</div>';
    slides.push(s0);

    // ── 1: STRIKE ────────────────────────────────
    var s1 = mkSlide('strike');
    addLabel(s1, '§ 01 — The Voice of a Drum');
    addTitle(s1, 'Strike, Listen, Decompose');
    // We clone the canvas reference — the original will keep rendering
    var strikeC = q('#strike-canvas');
    if (strikeC) {
      strikeC.style.width = 'min(70vw, 70vh)';
      strikeC.style.height = 'min(70vw, 70vh)';
      s1.el.appendChild(strikeC);
    }
    var barList = q('#bar-list');
    if (barList) {
      barList.style.marginTop = '1.5rem';
      barList.style.maxWidth = '600px';
      barList.style.width = '100%';
      s1.el.appendChild(barList);
    }
    slides.push(s1);

    // ── 2: PHASOR ────────────────────────────────
    var s2 = mkSlide('phasor');
    addLabel(s2, '§ 02 — Fourier as Rotating Vectors');
    addTitle(s2, 'The Phasor Constellation');
    var pRow = document.createElement('div');
    pRow.style.cssText = 'display:flex;gap:2rem;align-items:center;';
    var pCanvas = q('#phasor-canvas');
    if (pCanvas) {
      pCanvas.style.width = 'min(55vw, 55vh)';
      pCanvas.style.height = 'min(55vw, 55vh)';
      pRow.appendChild(pCanvas);
    }
    var pRight = document.createElement('div');
    pRight.style.cssText = 'display:flex;flex-direction:column;gap:1rem;';
    var wfCanvas = q('#waveform-canvas');
    if (wfCanvas) { wfCanvas.style.width = '460px'; pRight.appendChild(wfCanvas); }
    var pControls = q('#phasor-controls');
    if (pControls) pRight.appendChild(pControls);
    pRow.appendChild(pRight);
    s2.el.appendChild(pRow);
    slides.push(s2);

    // ── 3: MODE GALLERY ──────────────────────────
    var s3 = mkSlide('modes');
    addLabel(s3, '§ 03 — Eigenmodes of the Circular Drum');
    addTitle(s3, 'The Shapes of Pure Sound');
    var mg = q('#modes-grid');
    if (mg) {
      mg.style.maxWidth = '700px';
      s3.el.appendChild(mg);
    }
    slides.push(s3);

    // ── 4: BEATING ───────────────────────────────
    var s4 = mkSlide('beat');
    addLabel(s4, '§ 04 — Interference & Beating');
    addTitle(s4, 'When Two Modes Collide');
    var bp = q('#beat-picker');
    if (bp) s4.el.appendChild(bp);
    var bbtn = q('#beat-play-btn');
    if (bbtn) { bbtn.style.margin = '1rem auto'; s4.el.appendChild(bbtn); }
    var bRow = document.createElement('div');
    bRow.style.cssText = 'display:flex;gap:3rem;margin-top:1rem;';
    var bc1 = q('#beat-canvas');
    var bc2 = q('#beat-canvas2');
    if (bc1) {
      var d1 = document.createElement('div');
      d1.style.textAlign = 'center';
      d1.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.7rem;color:rgba(221,215,204,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.8rem">Mode A</div>';
      d1.appendChild(bc1);
      bRow.appendChild(d1);
    }
    if (bc2) {
      var d2 = document.createElement('div');
      d2.style.textAlign = 'center';
      d2.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.7rem;color:rgba(221,215,204,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.8rem">A + B (superposition)</div>';
      d2.appendChild(bc2);
      bRow.appendChild(d2);
    }
    s4.el.appendChild(bRow);
    slides.push(s4);

    // ── 5: WEYL ──────────────────────────────────
    var s5 = mkSlide('weyl');
    addLabel(s5, '§ 05 — The Spectrum Encodes Area');
    addTitle(s5, "Weyl's Law: You Can Hear the Area");
    var wc = q('#weyl-canvas');
    if (wc) {
      wc.style.width = 'min(70vw, 60vh)';
      wc.style.height = 'min(60vw, 50vh)';
      s5.el.appendChild(wc);
    }
    var weylEq = document.createElement('div');
    weylEq.className = 'rec-eq';
    weylEq.textContent = 'N(λ)  ∼  Area(Ω) · λ / (4π)    as λ → ∞';
    s5.el.appendChild(weylEq);
    var wrBtn = q('#weyl-replay');
    if (wrBtn) { wrBtn.style.marginTop = '1rem'; s5.el.appendChild(wrBtn); }
    slides.push(s5);

    // ── 6: ISOSPECTRAL ───────────────────────────
    var s6 = mkSlide('iso');
    addLabel(s6, '§ 06 — Gordon, Webb & Wolpert (1992)');
    addTitle(s6, 'You Cannot Always Hear the Shape');
    var isoRow = document.createElement('div');
    isoRow.className = 'rec-iso-pair';
    var d1c = q('#drum1');
    var d2c = q('#drum2');
    if (d1c) {
      var ip1 = document.createElement('div');
      ip1.style.textAlign = 'center';
      ip1.innerHTML = '<h3 style="font-family:Cormorant Garamond,serif;font-size:1.4rem;color:#f0e8d8;font-weight:300;margin-bottom:1rem">Drum Ω₁</h3>';
      d1c.style.width = '280px'; d1c.style.height = '280px';
      ip1.appendChild(d1c);
      isoRow.appendChild(ip1);
    }
    if (d2c) {
      var ip2 = document.createElement('div');
      ip2.style.textAlign = 'center';
      ip2.innerHTML = '<h3 style="font-family:Cormorant Garamond,serif;font-size:1.4rem;color:#f0e8d8;font-weight:300;margin-bottom:1rem">Drum Ω₂</h3>';
      d2c.style.width = '280px'; d2c.style.height = '280px';
      ip2.appendChild(d2c);
      isoRow.appendChild(ip2);
    }
    s6.el.appendChild(isoRow);
    slides.push(s6);

    // ── 7: TIMELINE ──────────────────────────────
    var s7 = mkSlide('timeline');
    s7.type = 'timeline';
    addLabel(s7, 'Historical Road to the Answer');
    var tlBox = document.createElement('div');
    tlBox.className = 'rec-timeline';
    var tlData = [
      ['1964', 'Milnor: isospectral non-isometric 16-dimensional flat tori — but not planar domains.'],
      ['1966', 'Mark Kac publishes "Can one hear the shape of a drum?" Conjectures the spectrum determines the domain.'],
      ['1985', "Sunada's Theorem: an abstract group-theoretic machine for manufacturing isospectrality."],
      ['1992', 'Gordon, Webb & Wolpert: the definitive answer is No. Seven triangles, two shapes, one spectrum. Four pages.'],
      ['1994', 'Buser, Conway, Doyle & Semmler: elementary transplantation by coloring, making the proof accessible.'],
      ['2000', 'Zelditch: analytic domains with mirror symmetry are spectrally determined. Counterexamples must break symmetry.']
    ];
    tlData.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'rec-tl-item';
      row.innerHTML = '<div class="rec-tl-year">' + item[0] + '</div><div class="rec-tl-body">' + item[1] + '</div>';
      tlBox.appendChild(row);
    });
    s7.el.appendChild(tlBox);
    slides.push(s7);

    // ── 8: NODAL ─────────────────────────────────
    var s8 = mkSlide('nodal');
    addLabel(s8, '§ 07 — Nodal Domains');
    addTitle(s8, 'Can You Count the Silence?');
    var nLayout = document.createElement('div');
    nLayout.style.cssText = 'display:flex;gap:3rem;align-items:center;';
    var nc = q('#nodal-canvas');
    if (nc) {
      nc.style.width = 'min(55vw, 55vh)';
      nc.style.height = 'min(55vw, 55vh)';
      nLayout.appendChild(nc);
    }
    var nRight = document.createElement('div');
    nRight.style.cssText = 'display:flex;flex-direction:column;gap:1rem;';
    var nmg = q('#nodal-mode-grid');
    if (nmg) nRight.appendChild(nmg);
    var nap = q('.nodal-audio-panel');
    if (nap) nRight.appendChild(nap);
    var cb = q('.courant-box');
    if (cb) nRight.appendChild(cb);
    nLayout.appendChild(nRight);
    s8.el.appendChild(nLayout);
    slides.push(s8);

    // ── 9: FRONTIERS ─────────────────────────────
    var s9 = mkSlide('frontiers');
    addLabel(s9, 'Frontiers & Open Problems');
    var fg = q('.future-grid');
    if (fg) {
      fg.style.maxWidth = '1100px';
      s9.el.appendChild(fg);
    }
    slides.push(s9);

    // ── 10: EPILOGUE ─────────────────────────────
    var s10 = mkSlide('epilogue');
    s10.el.classList.add('rec-slide-hero');
    s10.el.innerHTML =
      '<div class="rec-quote">' +
        'You cannot always hear the shape of a drum.<br><br>' +
        'But the spectrum remembers the area, the perimeter, and the corners.<br>' +
        'It remembers almost everything — except the shape.' +
        '<cite>— Kac\'s Question, resolved 1992</cite>' +
      '</div>';
    slides.push(s10);

    return slides;
  }

  function mkSlide(id) {
    var el = document.createElement('div');
    el.className = 'rec-slide';
    el.id = 'rec-' + id;
    document.body.appendChild(el);
    return { el: el, type: id };
  }

  function addLabel(slide, text) {
    var el = document.createElement('div');
    el.className = 'rec-label';
    el.textContent = text;
    slide.el.appendChild(el);
  }

  function addTitle(slide, text) {
    var el = document.createElement('div');
    el.className = 'rec-title';
    el.textContent = text;
    slide.el.appendChild(el);
  }

  /* ──────────────────────────────────────────────── */
  /*  CHOREOGRAPHY ACTIONS                            */
  /* ──────────────────────────────────────────────── */

  var _phasorIdx = 0;
  var _nodalIdx = 0;

  function triggerStrike(wrapper) {
    var canvas = document.getElementById('strike-canvas');
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var ox = (Math.random() - 0.5) * rect.width * 0.5;
    var oy = (Math.random() - 0.5) * rect.height * 0.5;
    canvas.dispatchEvent(new PointerEvent('pointerdown', {
      clientX: cx + ox, clientY: cy + oy, bubbles: true, pointerId: 1
    }));
    setTimeout(function () {
      canvas.dispatchEvent(new PointerEvent('pointerup', {
        clientX: cx + ox, clientY: cy + oy, bubbles: true, pointerId: 1
      }));
    }, 50);
    // Also try click
    canvas.dispatchEvent(new MouseEvent('click', {
      clientX: cx + ox, clientY: cy + oy, bubbles: true
    }));
  }

  function triggerPhasorToggle() {
    var btns = document.querySelectorAll('#phasor-controls button, #phasor-controls .phasor-toggle, #phasor-controls label');
    if (btns.length > 0) {
      btns[_phasorIdx % btns.length].click();
      _phasorIdx++;
    }
  }

  function triggerBeat() {
    var btn = document.getElementById('beat-play-btn');
    if (btn) btn.click();
  }

  function triggerWeylReplay() {
    var btn = document.getElementById('weyl-replay');
    if (btn) btn.click();
  }

  function cycleNodalMode() {
    var btns = document.querySelectorAll('#nodal-mode-grid button, #nodal-mode-grid .nodal-mode-btn');
    if (btns.length > 0) {
      btns[_nodalIdx % btns.length].click();
      _nodalIdx++;
    }
  }

  function triggerNodalTones() {
    var btn = document.getElementById('nap-domains');
    if (btn) btn.click();
  }

})();
