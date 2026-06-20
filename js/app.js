// ============================================
// GitPulse — Main Application
// ============================================

(function() {
  'use strict';

  // ── DOM Helpers ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    // Header
    usernameInput: $('#username-input'),
    searchBtn: $('#search-btn'),
    patToggle: $('#pat-toggle'),
    patPanel: $('#pat-panel'),
    patInput: $('#pat-input'),
    patSave: $('#pat-save'),
    patClear: $('#pat-clear'),

    // Landing
    landingSection: $('#landing-section'),
    landingInput: $('#landing-username-input'),
    landingSearchBtn: $('#landing-search-btn'),
    landingExamples: $$('.landing__example-btn'),
    gridCanvas: $('#grid-canvas'),

    // Dashboard
    dashboard: $('#dashboard'),
  };

  // ── State ──
  const state = {
    username: '',
    token: localStorage.getItem('gitpulse_pat') || '',
  };

  // ═══════════════════════════════════════
  //  ANIMATED DOT GRID BACKGROUND
  // ═══════════════════════════════════════
  function initGridCanvas() {
    const canvas = els.gridCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;
    let mouseX = -1000, mouseY = -1000;
    const DOT_SPACING = 35;
    const DOT_RADIUS = 1;
    const MOUSE_RADIUS = 150;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / DOT_SPACING) + 1;
      const rows = Math.ceil(h / DOT_SPACING) + 1;
      const offsetX = (w - (cols - 1) * DOT_SPACING) / 2;
      const offsetY = (h - (rows - 1) * DOT_SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * DOT_SPACING;
          const y = offsetY + r * DOT_SPACING;

          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let alpha = 0.12;
          let radius = DOT_RADIUS;
          let color = '240, 246, 252'; // white-ish

          if (dist < MOUSE_RADIUS) {
            const t = 1 - (dist / MOUSE_RADIUS);
            alpha = 0.12 + t * 0.55;
            radius = DOT_RADIUS + t * 1.8;
            // Shift color toward blue when close
            const blueT = t * 0.8;
            color = `${Math.round(240 - blueT * 152)}, ${Math.round(246 - blueT * 80)}, 252`;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${alpha})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouseX = -1000;
      mouseY = -1000;
    }

    resize();
    draw();

    window.addEventListener('resize', () => {
      resize();
    });

    canvas.parentElement.addEventListener('mousemove', onMouseMove);
    canvas.parentElement.addEventListener('mouseleave', onMouseLeave);
  }


  // ═══════════════════════════════════════
  //  INITIALIZATION
  // ═══════════════════════════════════════
  function init() {
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Restore PAT indicator
    if (state.token) {
      els.patToggle.classList.add('has-token');
    }

    // Check URL params for username
    const params = new URLSearchParams(window.location.search);
    const urlUser = params.get('user');
    if (urlUser) {
      state.username = urlUser;
      els.usernameInput.value = urlUser;
      showDashboard(urlUser);
    }

    initGridCanvas();
    bindEvents();
  }


  // ═══════════════════════════════════════
  //  EVENT BINDINGS
  // ═══════════════════════════════════════
  function bindEvents() {
    // Header search
    els.searchBtn.addEventListener('click', handleSearch);
    els.usernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch();
    });

    // Landing search
    els.landingSearchBtn.addEventListener('click', handleLandingSearch);
    els.landingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLandingSearch();
    });

    // Example usernames
    els.landingExamples.forEach((btn) => {
      btn.addEventListener('click', () => {
        const username = btn.dataset.username;
        els.landingInput.value = username;
        triggerSearch(username);
      });
    });

    // PAT panel toggle
    els.patToggle.addEventListener('click', () => {
      const panel = els.patPanel;
      const isHidden = panel.hasAttribute('hidden');
      if (isHidden) {
        panel.removeAttribute('hidden');
        els.patInput.value = state.token;
        els.patInput.focus();
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    // PAT save
    els.patSave.addEventListener('click', () => {
      const token = els.patInput.value.trim();
      if (token) {
        state.token = token;
        localStorage.setItem('gitpulse_pat', token);
        els.patToggle.classList.add('has-token');
        els.patPanel.setAttribute('hidden', '');
      }
    });

    // PAT clear
    els.patClear.addEventListener('click', () => {
      state.token = '';
      els.patInput.value = '';
      localStorage.removeItem('gitpulse_pat');
      els.patToggle.classList.remove('has-token');
    });

    // Keyboard shortcut: "/" to focus landing search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !isInputFocused()) {
        e.preventDefault();
        const input = els.landingSection.style.display === 'none'
          ? els.usernameInput
          : els.landingInput;
        input.focus();
      }
      // Escape to close PAT panel
      if (e.key === 'Escape') {
        if (!els.patPanel.hasAttribute('hidden')) {
          els.patPanel.setAttribute('hidden', '');
        }
      }
    });
  }

  function isInputFocused() {
    const tag = document.activeElement?.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
  }


  // ═══════════════════════════════════════
  //  SEARCH HANDLERS
  // ═══════════════════════════════════════
  function handleSearch() {
    const username = els.usernameInput.value.trim();
    if (username) triggerSearch(username);
  }

  function handleLandingSearch() {
    const username = els.landingInput.value.trim();
    if (username) triggerSearch(username);
  }

  function triggerSearch(username) {
    state.username = username;
    els.usernameInput.value = username;

    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('user', username);
    window.history.pushState({}, '', url);

    showDashboard(username);
  }


  // ═══════════════════════════════════════
  //  DASHBOARD TOGGLE
  // ═══════════════════════════════════════
  function showDashboard(username) {
    // Hide landing, show dashboard
    els.landingSection.style.display = 'none';
    els.dashboard.removeAttribute('hidden');

    // TODO: Task 2+ will wire up actual data fetching here
    console.log(`[GitPulse] Loading data for: ${username}`);
    console.log(`[GitPulse] Token available: ${!!state.token}`);
  }


  // ═══════════════════════════════════════
  //  BOOT
  // ═══════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
