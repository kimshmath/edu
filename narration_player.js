/* ═══════════════════════════════════════════════════════════════
   narration_player.js — Voice narration for Mellow Math chapters
   
   Single "Narrate" button → floating mini-player with play/pause,
   ±15 s skip, progress bar, and auto-advance through segments.

   Usage: Include this script + narration_player.css in any chapter.
   Before this script, define:
   
   window.NARRATION_CONFIG = {
     chapter: 'sound',
     basePath: 'assets/narration/sound/',
     segments: [
       { id: 1, section: '#hero', label: 'Introduction' },
       { id: 2, section: '#sec-wave', label: 'Physics of Sound' },
       ...
     ]
   };
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const config = window.NARRATION_CONFIG;
  if (!config || !config.segments || !config.segments.length) return;

  // ── Detect language ──
  const lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  const langLabel = lang === 'ko' ? '한국어' : 'EN';

  // ── State ──
  let currentAudio = null;
  let currentIdx = 0;          // index into config.segments
  let isPlaying = false;
  let miniplayerEl = null;
  let triggerBtn = null;

  // ── SVG Icons ──
  const ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  const ICON_PAUSE = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  const ICON_RW = '<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/><text x="12" y="16.5" text-anchor="middle" font-size="7.5" font-family="sans-serif" fill="currentColor">15</text></svg>';
  const ICON_FF = '<svg viewBox="0 0 24 24"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/><text x="12" y="16.5" text-anchor="middle" font-size="7.5" font-family="sans-serif" fill="currentColor">15</text></svg>';
  const ICON_HEADPHONES = '<svg viewBox="0 0 24 24"><path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h1c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2H5v-2a7 7 0 1 1 14 0v2h-2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"/></svg>';

  // ── Audio file URL ──
  function getAudioUrl(segmentId) {
    const base = config.basePath || `assets/narration/${config.chapter}/`;
    return `${base}${lang}_${String(segmentId).padStart(2, '0')}.mp3`;
  }

  // ── Format time ──
  function fmtTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ════════════════════════════════════════════════
  //  FLOATING MINI-PLAYER
  // ════════════════════════════════════════════════
  function createMiniplayer() {
    const mp = document.createElement('div');
    mp.className = 'narration-miniplayer';
    mp.innerHTML = `
      <div class="mp-row-top">
        <div class="mp-info">
          <div class="mp-section-name"></div>
          <div class="mp-lang">${langLabel} · <span class="mp-seg-counter"></span></div>
        </div>
        <button class="mp-close" aria-label="Close narration">✕</button>
      </div>
      <div class="mp-progress-wrap">
        <div class="mp-progress-bar"></div>
      </div>
      <div class="mp-controls">
        <div class="mp-time mp-time-current">0:00</div>
        <button class="mp-rw" aria-label="Rewind 15 seconds">${ICON_RW}</button>
        <button class="mp-play-btn" aria-label="Play/Pause narration">
          <span class="mp-icon-play">${ICON_PLAY}</span>
          <span class="mp-icon-pause" style="display:none">${ICON_PAUSE}</span>
        </button>
        <button class="mp-ff" aria-label="Forward 15 seconds">${ICON_FF}</button>
        <div class="mp-time mp-time-total">0:00</div>
      </div>
    `;

    document.body.appendChild(mp);

    // Events
    mp.querySelector('.mp-play-btn').addEventListener('click', togglePlayPause);
    mp.querySelector('.mp-close').addEventListener('click', stopNarration);
    mp.querySelector('.mp-rw').addEventListener('click', () => skip(-15));
    mp.querySelector('.mp-ff').addEventListener('click', () => skip(15));

    // Clickable progress bar
    const pw = mp.querySelector('.mp-progress-wrap');
    pw.addEventListener('click', (e) => {
      if (!currentAudio || !currentAudio.duration) return;
      const rect = pw.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      currentAudio.currentTime = pct * currentAudio.duration;
    });

    // ── Drag-to-move ──
    let dragState = { active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 };
    let mpPos = { x: 0, y: 0, initialized: false };

    function setMpTransform(x, y) {
      mp.style.transform = `translate(${x}px, ${y}px)`;
    }

    mp.addEventListener('pointerdown', (e) => {
      // Don't drag when clicking buttons or progress bar
      if (e.target.closest('button, .mp-progress-wrap')) return;
      dragState.active = true;
      dragState.startX = e.clientX;
      dragState.startY = e.clientY;
      dragState.offsetX = mpPos.x;
      dragState.offsetY = mpPos.y;
      mp.classList.add('dragging');
      mp.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    mp.addEventListener('pointermove', (e) => {
      if (!dragState.active) return;
      mpPos.x = dragState.offsetX + (e.clientX - dragState.startX);
      mpPos.y = dragState.offsetY + (e.clientY - dragState.startY);
      setMpTransform(mpPos.x, mpPos.y);
    });

    mp.addEventListener('pointerup', () => {
      dragState.active = false;
      mp.classList.remove('dragging');
    });

    mp.addEventListener('pointercancel', () => {
      dragState.active = false;
      mp.classList.remove('dragging');
    });

    // Store drag-related state on the element for show/hide
    mp._mpPos = mpPos;
    mp._setTransform = setMpTransform;

    return mp;
  }

  function showMiniplayer(label) {
    if (!miniplayerEl) miniplayerEl = createMiniplayer();
    miniplayerEl.querySelector('.mp-section-name').textContent = label || '';
    updateSegCounter();
    // Set initial centered position if not yet dragged
    if (!miniplayerEl._mpPos.initialized) {
      const w = miniplayerEl.offsetWidth || 340;
      miniplayerEl._mpPos.x = -w / 2;
      miniplayerEl._mpPos.y = 0;
      miniplayerEl._mpPos.initialized = true;
    }
    miniplayerEl._setTransform(miniplayerEl._mpPos.x, miniplayerEl._mpPos.y);
    miniplayerEl.classList.add('visible');
  }

  function hideMiniplayer() {
    if (miniplayerEl) miniplayerEl.classList.remove('visible');
  }

  function updatePlayPauseIcon(playing) {
    if (!miniplayerEl) return;
    miniplayerEl.querySelector('.mp-icon-play').style.display = playing ? 'none' : 'flex';
    miniplayerEl.querySelector('.mp-icon-pause').style.display = playing ? 'flex' : 'none';
  }

  function updateSegCounter() {
    if (!miniplayerEl) return;
    const el = miniplayerEl.querySelector('.mp-seg-counter');
    if (el) el.textContent = `${currentIdx + 1} / ${config.segments.length}`;
  }

  function updateProgress() {
    if (!miniplayerEl || !currentAudio) return;
    const pct = currentAudio.duration ? (currentAudio.currentTime / currentAudio.duration * 100) : 0;
    const bar = miniplayerEl.querySelector('.mp-progress-bar');
    const tCur = miniplayerEl.querySelector('.mp-time-current');
    const tTot = miniplayerEl.querySelector('.mp-time-total');
    if (bar) bar.style.width = pct + '%';
    if (tCur) tCur.textContent = fmtTime(currentAudio.currentTime);
    if (tTot) tTot.textContent = fmtTime(currentAudio.duration);
  }

  // ════════════════════════════════════════════════
  //  PLAYBACK CONTROLS
  // ════════════════════════════════════════════════
  function togglePlayPause() {
    if (!currentAudio) {
      // Start from beginning
      playSegment(0);
      return;
    }
    if (currentAudio.paused) {
      currentAudio.play();
      isPlaying = true;
      updatePlayPauseIcon(true);
      updateTriggerBtn(true);
    } else {
      currentAudio.pause();
      isPlaying = false;
      updatePlayPauseIcon(false);
      updateTriggerBtn(false);
    }
  }

  function skip(seconds) {
    if (!currentAudio) return;
    const newTime = currentAudio.currentTime + seconds;

    if (seconds > 0 && newTime >= currentAudio.duration) {
      // Skip forward past end → go to next segment
      if (currentIdx < config.segments.length - 1) {
        playSegment(currentIdx + 1);
      }
    } else if (seconds < 0 && newTime < 0) {
      // Rewind past start → go to previous segment (from the end)
      if (currentIdx > 0) {
        playSegment(currentIdx - 1);
      } else {
        currentAudio.currentTime = 0;
      }
    } else {
      currentAudio.currentTime = Math.max(0, newTime);
    }
  }

  function stopNarration() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeEventListener('timeupdate', updateProgress);
      currentAudio.removeEventListener('ended', onEnded);
      currentAudio = null;
    }
    isPlaying = false;
    updateTriggerBtn(false);
    hideMiniplayer();
  }

  function onEnded() {
    // Auto-advance to next segment
    if (currentIdx < config.segments.length - 1) {
      setTimeout(() => playSegment(currentIdx + 1), 600);
    } else {
      // Finished all segments
      isPlaying = false;
      updatePlayPauseIcon(false);
      updateTriggerBtn(false);
      setTimeout(() => {
        hideMiniplayer();
        currentAudio = null;
      }, 2000);
    }
  }

  function playSegment(idx) {
    if (idx < 0 || idx >= config.segments.length) return;

    // Cleanup previous
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.removeEventListener('timeupdate', updateProgress);
      currentAudio.removeEventListener('ended', onEnded);
    }

    currentIdx = idx;
    const seg = config.segments[idx];

    // Scroll to the section
    const sectionEl = document.querySelector(seg.section);
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const url = getAudioUrl(seg.id);
    currentAudio = new Audio(url);
    currentAudio.addEventListener('timeupdate', updateProgress);
    currentAudio.addEventListener('ended', onEnded);
    currentAudio.addEventListener('error', function () {
      console.warn(`Narration audio not found: ${url}`);
      // Try next segment
      if (currentIdx < config.segments.length - 1) {
        setTimeout(() => playSegment(currentIdx + 1), 500);
      } else {
        stopNarration();
      }
    });

    const label = seg.label || seg.section.replace('#sec-', '§ ').replace('#', '');
    currentAudio.play().then(() => {
      isPlaying = true;
      showMiniplayer(label);
      updatePlayPauseIcon(true);
      updateTriggerBtn(true);
    }).catch(err => {
      console.warn('Narration play failed:', err);
    });
  }

  // ════════════════════════════════════════════════
  //  FLOATING TRIGGER BUTTON
  // ════════════════════════════════════════════════
  function updateTriggerBtn(playing) {
    if (!triggerBtn) return;
    triggerBtn.classList.toggle('playing', playing);
  }

  function createTriggerButton() {
    const btn = document.createElement('button');
    btn.className = 'narration-trigger';
    btn.setAttribute('aria-label', lang === 'ko' ? '나레이션 듣기' : 'Listen to narration');
    btn.innerHTML = `
      <span class="nt-icon">${ICON_HEADPHONES}</span>
      <span class="nt-label">${lang === 'ko' ? '나레이션' : 'Narrate'}</span>
    `;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isPlaying) {
        togglePlayPause();
      } else if (currentAudio && currentAudio.paused) {
        togglePlayPause();
      } else {
        playSegment(0);
      }
    });
    document.body.appendChild(btn);
    return btn;
  }

  // ── Initialize ──
  function init() {
    triggerBtn = createTriggerButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
