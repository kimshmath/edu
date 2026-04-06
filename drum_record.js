/* ═══════════════════════════════════════════════════════════════
   drum_record.js — Recording-mode controller for cinematic capture
   
   Append ?record=1 to the drum.html URL to activate.
   
   Controls:
     → / Space / Enter   Next slide
     ←                   Previous slide
     1–9, 0              Jump to slide 1–10
     A                   AUTO-PLAY with narration audio + choreography
     Esc                 Stop auto-play
     S                   Trigger a programmatic strike on the drum
     P                   Toggle phasor tones (one at a time)
     B                   Trigger beat playback
     W                   Replay Weyl animation
     T                   Advance timeline items (progressive reveal)
     N                   Cycle nodal modes
     D                   Play nodal domain tones
     F                   Toggle fullscreen
   
   URL params:
     ?record=1           Activate recording mode
     ?record=1&lang=ko   Use Korean narration for auto-play
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  if (!new URLSearchParams(window.location.search).has('record')) return;

  window.addEventListener('DOMContentLoaded', function () {
    setTimeout(initRecordMode, 1200);
  });

  /* ──── shared state ──── */
  var _phasorIdx = 0;
  var _nodalIdx = 0;

  /* ──────────────────────────────────────────────────────────── */
  /*  INIT                                                        */
  /* ──────────────────────────────────────────────────────────── */
  function initRecordMode() {

    document.body.classList.add('record-mode');

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'drum_record.css';
    document.head.appendChild(link);

    // Hide original content
    var origChildren = Array.from(document.body.children);
    var wrapper = document.createElement('div');
    wrapper.id = 'rec-original-content';
    wrapper.style.display = 'none';
    origChildren.forEach(function (child) {
      if (child.tagName !== 'SCRIPT' && child.tagName !== 'LINK' &&
          !child.classList.contains('rec-slide') &&
          child.id !== 'rec-original-content') {
        wrapper.appendChild(child);
      }
    });
    document.body.appendChild(wrapper);

    var slides = buildSlides(wrapper);
    var currentSlide = 0;
    var timelineRevealed = 0;

    // UI
    var counter = document.createElement('div');
    counter.className = 'rec-counter';
    document.body.appendChild(counter);

    var progressBar = document.createElement('div');
    progressBar.className = 'rec-progress';
    document.body.appendChild(progressBar);

    var hint = document.createElement('div');
    hint.className = 'rec-keys-hint';
    hint.textContent = '← → navigate · A auto-play · S strike · P phasor · W weyl · F fullscreen';
    document.body.appendChild(hint);

    function showSlide(idx) {
      idx = Math.max(0, Math.min(idx, slides.length - 1));
      slides.forEach(function (s, i) {
        s.el.classList.toggle('active', i === idx);
      });
      currentSlide = idx;
      counter.textContent = (idx + 1) + ' / ' + slides.length;
      progressBar.style.width = (((idx + 1) / slides.length) * 100) + '%';
      if (slides[idx].type === 'timeline') {
        timelineRevealed = 0;
        slides[idx].el.querySelectorAll('.rec-tl-item').forEach(function (it) {
          it.classList.remove('visible');
        });
      }
    }

    /* ──────────────────────────────────────────── */
    /*  AUTO-PLAY ENGINE                            */
    /* ──────────────────────────────────────────── */
    var lang = new URLSearchParams(window.location.search).get('lang') || 'en';
    var autoPlaying = false;
    var autoTimeout = null;
    var currentAudio = null;
    var NARRATION_BASE = 'assets/narration/drum_cinematic/';

    var CHOREOGRAPHY = [
      // 0: Hero — silent cold open
      { slide: 0, audio: null, holdAfter: 6000, preCue: function () {} },
      // 1: Strike
      { slide: 1, audio: 1, holdAfter: 3000, preCue: function () {
        setTimeout(triggerStrike, 2000);
        setTimeout(triggerStrike, 8000);
        setTimeout(triggerStrike, 20000);
      }},
      // 2: Phasor
      { slide: 2, audio: 2, holdAfter: 3000, preCue: function () {
        setTimeout(triggerPhasorToggle, 3000);
        setTimeout(triggerPhasorToggle, 8000);
        setTimeout(triggerPhasorToggle, 14000);
        setTimeout(triggerPhasorToggle, 20000);
      }},
      // 3: Modes
      { slide: 3, audio: 3, holdAfter: 3000, preCue: function () {
        var cards = document.querySelectorAll('#modes-grid .mode-card, #modes-grid canvas, #modes-grid > div');
        for (var i = 0; i < Math.min(cards.length, 6); i++) {
          (function (idx) {
            setTimeout(function () { cards[idx].click(); }, 3000 + idx * 4000);
          })(i);
        }
      }},
      // 4: Beating
      { slide: 4, audio: 4, holdAfter: 3000, preCue: function () {
        setTimeout(triggerBeat, 3000);
      }},
      // 5: Weyl
      { slide: 5, audio: 5, holdAfter: 3000, preCue: function () {
        setTimeout(triggerWeylReplay, 2000);
      }},
      // 6: Isospectral
      { slide: 6, audio: 6, holdAfter: 3000, preCue: function () {
        var d1 = document.getElementById('drum1');
        var d2 = document.getElementById('drum2');
        if (d1) setTimeout(function () { d1.click(); }, 5000);
        if (d2) setTimeout(function () { d2.click(); }, 15000);
      }},
      // 7: Timeline + beat 7
      { slide: 7, audio: 7, holdAfter: 3000, preCue: function () {
        var items = slides[7].el.querySelectorAll('.rec-tl-item');
        for (var i = 0; i < items.length; i++) {
          (function (idx, it) {
            setTimeout(function () { it.classList.add('visible'); }, 3000 + idx * 8000);
          })(i, items[i]);
        }
      }},
      // 8: Construction (stays on timeline slide)
      { slide: 7, audio: 8, holdAfter: 3000, preCue: function () {} },
      // 9: Nodal
      { slide: 8, audio: 9, holdAfter: 3000, preCue: function () {
        setTimeout(cycleNodalMode, 4000);
        setTimeout(cycleNodalMode, 12000);
        setTimeout(cycleNodalMode, 20000);
        setTimeout(triggerNodalTones, 30000);
      }},
      // 10: Frontiers
      { slide: 9, audio: 10, holdAfter: 3000, preCue: function () {} },
      // 11: Epilogue
      { slide: 10, audio: 11, holdAfter: 5000, preCue: function () {} }
    ];

    function startAutoPlay() {
      if (autoPlaying) return;
      autoPlaying = true;
      hint.textContent = '▶ AUTO-PLAYING · press Esc to stop';
      hint.style.color = 'rgba(201, 167, 72, 0.5)';
      console.log('[record] Auto-play started (lang=' + lang + ')');
      playBeat(0);
    }

    function stopAutoPlay() {
      autoPlaying = false;
      if (currentAudio) { currentAudio.pause(); currentAudio = null; }
      if (autoTimeout) { clearTimeout(autoTimeout); autoTimeout = null; }
      hint.textContent = '← → navigate · A auto-play · F fullscreen';
      hint.style.color = '';
      console.log('[record] Auto-play stopped.');
    }

    function playBeat(beatIdx) {
      if (!autoPlaying || beatIdx >= CHOREOGRAPHY.length) {
        console.log('[record] Auto-play complete.');
        stopAutoPlay();
        return;
      }

      var beat = CHOREOGRAPHY[beatIdx];
      showSlide(beat.slide);
      if (beat.preCue) beat.preCue();

      if (beat.audio) {
        var audioFile = NARRATION_BASE + lang + '_' + String(beat.audio).padStart(2, '0') + '.mp3';
        currentAudio = new Audio(audioFile);
        currentAudio.volume = 1.0;

        currentAudio.addEventListener('ended', function () {
          currentAudio = null;
          autoTimeout = setTimeout(function () { playBeat(beatIdx + 1); }, beat.holdAfter || 2000);
        });

        currentAudio.addEventListener('error', function () {
          console.warn('[record] Audio error: ' + audioFile);
          autoTimeout = setTimeout(function () { playBeat(beatIdx + 1); }, 5000);
        });

        setTimeout(function () {
          currentAudio.play().catch(function (err) {
            console.warn('[record] Autoplay blocked:', err.message);
            autoTimeout = setTimeout(function () { playBeat(beatIdx + 1); }, 5000);
          });
        }, 800);
      } else {
        autoTimeout = setTimeout(function () { playBeat(beatIdx + 1); }, beat.holdAfter || 5000);
      }
    }

    /* ──────────────────────────────────────────── */
    /*  KEYBOARD                                    */
    /* ──────────────────────────────────────────── */
    document.addEventListener('keydown', function (e) {
      var handled = true;
      switch (e.key) {
        case 'ArrowRight': case ' ': case 'Enter':
          if (!autoPlaying) showSlide(currentSlide + 1);
          break;
        case 'ArrowLeft':
          if (!autoPlaying) showSlide(currentSlide - 1);
          break;
        case 'a': case 'A':
          if (!autoPlaying) startAutoPlay();
          break;
        case 'Escape':
          if (autoPlaying) stopAutoPlay();
          break;
        case 'f': case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(function(){});
          } else {
            document.exitFullscreen();
          }
          break;
        case 's': case 'S': triggerStrike(); break;
        case 'p': case 'P': triggerPhasorToggle(); break;
        case 'b': case 'B': triggerBeat(); break;
        case 'w': case 'W': triggerWeylReplay(); break;
        case 't': case 'T':
          if (slides[currentSlide] && slides[currentSlide].type === 'timeline') {
            var items = slides[currentSlide].el.querySelectorAll('.rec-tl-item');
            if (timelineRevealed < items.length) {
              items[timelineRevealed].classList.add('visible');
              timelineRevealed++;
            }
          }
          break;
        case 'n': case 'N': cycleNodalMode(); break;
        case 'd': case 'D': triggerNodalTones(); break;
        default:
          var num = parseInt(e.key);
          if (!isNaN(num) && num >= 0 && num <= 9) {
            showSlide(num === 0 ? 9 : num - 1);
          } else { handled = false; }
      }
      if (handled) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    showSlide(0);
    console.log('[record] Recording mode active. ' + slides.length + ' slides. Press A to auto-play.');
  }

  /* ──────────────────────────────────────────────────────────── */
  /*  BUILD SLIDES                                                */
  /* ──────────────────────────────────────────────────────────── */
  function buildSlides(wrapper) {
    var slides = [];
    function q(sel) { return wrapper.querySelector(sel); }

    // 0: HERO
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

    // 1: STRIKE
    var s1 = mkSlide('strike');
    addLabel(s1, '§ 01 — The Voice of a Drum');
    addTitle(s1, 'Strike, Listen, Decompose');
    var sc = q('#strike-canvas');
    if (sc) { sc.style.width = sc.style.height = 'min(70vw, 70vh)'; s1.el.appendChild(sc); }
    var bl = q('#bar-list');
    if (bl) { bl.style.cssText = 'margin-top:1.5rem;max-width:600px;width:100%'; s1.el.appendChild(bl); }
    slides.push(s1);

    // 2: PHASOR
    var s2 = mkSlide('phasor');
    addLabel(s2, '§ 02 — Fourier as Rotating Vectors');
    addTitle(s2, 'The Phasor Constellation');
    var pRow = document.createElement('div');
    pRow.style.cssText = 'display:flex;gap:2rem;align-items:center';
    var pc = q('#phasor-canvas');
    if (pc) { pc.style.width = pc.style.height = 'min(55vw, 55vh)'; pRow.appendChild(pc); }
    var pR = document.createElement('div');
    pR.style.cssText = 'display:flex;flex-direction:column;gap:1rem';
    var wf = q('#waveform-canvas');
    if (wf) { wf.style.width = '460px'; pR.appendChild(wf); }
    var pCtrl = q('#phasor-controls');
    if (pCtrl) pR.appendChild(pCtrl);
    pRow.appendChild(pR);
    s2.el.appendChild(pRow);
    slides.push(s2);

    // 3: MODES
    var s3 = mkSlide('modes');
    addLabel(s3, '§ 03 — Eigenmodes of the Circular Drum');
    addTitle(s3, 'The Shapes of Pure Sound');
    var mg = q('#modes-grid');
    if (mg) { mg.style.maxWidth = '700px'; s3.el.appendChild(mg); }
    slides.push(s3);

    // 4: BEATING
    var s4 = mkSlide('beat');
    addLabel(s4, '§ 04 — Interference & Beating');
    addTitle(s4, 'When Two Modes Collide');
    var bp = q('#beat-picker');
    if (bp) s4.el.appendChild(bp);
    var bbtn = q('#beat-play-btn');
    if (bbtn) { bbtn.style.margin = '1rem auto'; s4.el.appendChild(bbtn); }
    var bR = document.createElement('div');
    bR.style.cssText = 'display:flex;gap:3rem;margin-top:1rem';
    var bc1 = q('#beat-canvas');
    var bc2 = q('#beat-canvas2');
    if (bc1) {
      var b1 = document.createElement('div');
      b1.style.textAlign = 'center';
      b1.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.7rem;color:rgba(221,215,204,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.8rem">Mode A</div>';
      b1.appendChild(bc1); bR.appendChild(b1);
    }
    if (bc2) {
      var b2 = document.createElement('div');
      b2.style.textAlign = 'center';
      b2.innerHTML = '<div style="font-family:Space Mono,monospace;font-size:.7rem;color:rgba(221,215,204,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:.8rem">A + B (superposition)</div>';
      b2.appendChild(bc2); bR.appendChild(b2);
    }
    s4.el.appendChild(bR);
    slides.push(s4);

    // 5: WEYL
    var s5 = mkSlide('weyl');
    addLabel(s5, '§ 05 — The Spectrum Encodes Area');
    addTitle(s5, "Weyl's Law: You Can Hear the Area");
    var wc = q('#weyl-canvas');
    if (wc) { wc.style.width = 'min(70vw, 60vh)'; wc.style.height = 'min(60vw, 50vh)'; s5.el.appendChild(wc); }
    var weq = document.createElement('div');
    weq.className = 'rec-eq';
    weq.textContent = 'N(λ)  ∼  Area(Ω) · λ / (4π)    as λ → ∞';
    s5.el.appendChild(weq);
    var wrB = q('#weyl-replay');
    if (wrB) { wrB.style.marginTop = '1rem'; s5.el.appendChild(wrB); }
    slides.push(s5);

    // 6: ISOSPECTRAL
    var s6 = mkSlide('iso');
    addLabel(s6, '§ 06 — Gordon, Webb & Wolpert (1992)');
    addTitle(s6, 'You Cannot Always Hear the Shape');
    var iR = document.createElement('div');
    iR.className = 'rec-iso-pair';
    var d1 = q('#drum1'), d2 = q('#drum2');
    if (d1) {
      var ip1 = document.createElement('div');
      ip1.style.textAlign = 'center';
      ip1.innerHTML = '<h3 style="font-family:Cormorant Garamond,serif;font-size:1.4rem;color:#f0e8d8;font-weight:300;margin-bottom:1rem">Drum Ω₁</h3>';
      d1.style.width = d1.style.height = '280px';
      ip1.appendChild(d1); iR.appendChild(ip1);
    }
    if (d2) {
      var ip2 = document.createElement('div');
      ip2.style.textAlign = 'center';
      ip2.innerHTML = '<h3 style="font-family:Cormorant Garamond,serif;font-size:1.4rem;color:#f0e8d8;font-weight:300;margin-bottom:1rem">Drum Ω₂</h3>';
      d2.style.width = d2.style.height = '280px';
      ip2.appendChild(d2); iR.appendChild(ip2);
    }
    s6.el.appendChild(iR);
    slides.push(s6);

    // 7: TIMELINE
    var s7 = mkSlide('timeline');
    s7.type = 'timeline';
    addLabel(s7, 'Historical Road to the Answer');
    var tlBox = document.createElement('div');
    tlBox.className = 'rec-timeline';
    [
      ['1964', 'Milnor: isospectral non-isometric 16-dimensional flat tori — but not planar domains.'],
      ['1966', 'Mark Kac publishes "Can one hear the shape of a drum?" Conjectures yes.'],
      ['1985', "Sunada's Theorem: an algebraic machine for isospectrality."],
      ['1992', 'Gordon, Webb & Wolpert: the definitive No. Seven triangles, two shapes, one spectrum.'],
      ['1994', 'Buser, Conway, Doyle & Semmler: elementary transplantation proof.'],
      ['2000', 'Zelditch: analytic + symmetric domains are determined. Counterexamples must break symmetry.']
    ].forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'rec-tl-item';
      row.innerHTML = '<div class="rec-tl-year">' + item[0] + '</div><div class="rec-tl-body">' + item[1] + '</div>';
      tlBox.appendChild(row);
    });
    s7.el.appendChild(tlBox);
    slides.push(s7);

    // 8: NODAL
    var s8 = mkSlide('nodal');
    addLabel(s8, '§ 07 — Nodal Domains');
    addTitle(s8, 'Can You Count the Silence?');
    var nL = document.createElement('div');
    nL.style.cssText = 'display:flex;gap:3rem;align-items:center';
    var nc = q('#nodal-canvas');
    if (nc) { nc.style.width = nc.style.height = 'min(55vw, 55vh)'; nL.appendChild(nc); }
    var nR = document.createElement('div');
    nR.style.cssText = 'display:flex;flex-direction:column;gap:1rem';
    var nmg = q('#nodal-mode-grid'); if (nmg) nR.appendChild(nmg);
    var nap = q('.nodal-audio-panel'); if (nap) nR.appendChild(nap);
    var cb = q('.courant-box'); if (cb) nR.appendChild(cb);
    nL.appendChild(nR);
    s8.el.appendChild(nL);
    slides.push(s8);

    // 9: FRONTIERS
    var s9 = mkSlide('frontiers');
    addLabel(s9, 'Frontiers & Open Problems');
    var fg = q('.future-grid');
    if (fg) { fg.style.maxWidth = '1100px'; s9.el.appendChild(fg); }
    slides.push(s9);

    // 10: EPILOGUE
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

  function addLabel(s, t) {
    var el = document.createElement('div');
    el.className = 'rec-label'; el.textContent = t;
    s.el.appendChild(el);
  }

  function addTitle(s, t) {
    var el = document.createElement('div');
    el.className = 'rec-title'; el.textContent = t;
    s.el.appendChild(el);
  }

  /* ──────────────────────────────────────────────── */
  /*  CHOREOGRAPHY ACTIONS                            */
  /* ──────────────────────────────────────────────── */

  function triggerStrike() {
    var c = document.getElementById('strike-canvas');
    if (!c) return;
    var r = c.getBoundingClientRect();
    var cx = r.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.5;
    var cy = r.top + r.height / 2 + (Math.random() - 0.5) * r.height * 0.5;
    c.dispatchEvent(new PointerEvent('pointerdown', { clientX: cx, clientY: cy, bubbles: true, pointerId: 1 }));
    setTimeout(function () {
      c.dispatchEvent(new PointerEvent('pointerup', { clientX: cx, clientY: cy, bubbles: true, pointerId: 1 }));
    }, 50);
    c.dispatchEvent(new MouseEvent('click', { clientX: cx, clientY: cy, bubbles: true }));
  }

  function triggerPhasorToggle() {
    var btns = document.querySelectorAll('#phasor-controls button, #phasor-controls .phasor-toggle, #phasor-controls label');
    if (btns.length > 0) { btns[_phasorIdx % btns.length].click(); _phasorIdx++; }
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
    if (btns.length > 0) { btns[_nodalIdx % btns.length].click(); _nodalIdx++; }
  }

  function triggerNodalTones() {
    var btn = document.getElementById('nap-domains');
    if (btn) btn.click();
  }

})();
