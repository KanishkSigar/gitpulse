// ============================================
// GitPulse — Main Application
// ============================================

import { API } from './api.js';
import { UI } from './ui.js';
import { Heatmap } from './heatmap.js';
import { Stats } from './stats.js';
import { Charts } from './charts.js';
import { Patterns } from './patterns.js';
import { Repos } from './repos.js';
import { Compare } from './compare.js';

// ── DOM Helpers ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  // Header
  usernameInput: $('#username-input'),
  headerSearch: $('#header-search'),
  patToggle: $('#pat-toggle'),
  patPanel: $('#pat-panel'),
  patClose: $('#pat-close'),
  patInput: $('#pat-input'),
  patSave: $('#pat-save'),
  patClear: $('#pat-clear'),

  // Landing
  landingSection: $('#landing-section'),
  landingInput: $('#landing-username-input'),
  landingSearchBtn: $('#landing-search-btn'),
  landingExamples: $$('.landing__example-btn'),

  // Dashboard
  dashboard: $('#dashboard'),

  // Theme
  themeToggle: $('#theme-toggle'),
  themeDropdown: $('#theme-dropdown'),

  // Export
  exportBtn: $('#export-btn'),

  // Compare
  compareBtn: $('#compare-btn'),
  compareSection: $('#compare-section'),
  compareA: $('#compare-a'),
  compareB: $('#compare-b'),
  compareGo: $('#compare-go'),
  compareClose: $('#compare-close'),
};

// ── State ──
const state = {
  username: '',
  token: localStorage.getItem('gitpulse_pat') || '',
};

// ═══════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════
function init() {
  if (window.lucide) lucide.createIcons();

  if (state.token) {
    els.patToggle.classList.add('has-token');
  }

  const params = new URLSearchParams(window.location.search);
  const cmp = params.get('compare');
  const urlUser = params.get('user');
  if (cmp && cmp.includes(',')) {
    const [a, b] = cmp.split(',').map(s => s.trim());
    showCompare(a, b);
  } else if (urlUser) {
    state.username = urlUser;
    els.usernameInput.value = urlUser;
    showDashboard(urlUser);
  }

  bindEvents();
}

// ═══════════════════════════════════════
//  EVENT BINDINGS
// ═══════════════════════════════════════
function bindEvents() {
  bindTheme();

  // Header search (visible on the dashboard)
  els.usernameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Export dashboard as image
  if (els.exportBtn) els.exportBtn.addEventListener('click', exportDashboard);

  // Compare users (button toggles the view open/closed)
  if (els.compareBtn) els.compareBtn.addEventListener('click', toggleCompare);
  if (els.compareClose) els.compareClose.addEventListener('click', closeCompare);
  if (els.compareGo) els.compareGo.addEventListener('click', handleCompare);
  [els.compareA, els.compareB].forEach((inp) => {
    if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleCompare(); });
  });

  // Browser back/forward — sync the view with the URL
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const cmp = params.get('compare');
    const u = params.get('user');
    if (cmp && cmp.includes(',')) { const [a, b] = cmp.split(',').map(s => s.trim()); showCompare(a, b); }
    else if (u) { state.username = u; els.usernameInput.value = u; showDashboard(u); }
    else { showLanding(); }
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

  // PAT close
  if (els.patClose) els.patClose.addEventListener('click', () => els.patPanel.setAttribute('hidden', ''));

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
      const input = els.landingSection.hasAttribute('hidden')
        ? els.usernameInput
        : els.landingInput;
      input.focus();
    }
    // Escape to close open panels (innermost first)
    if (e.key === 'Escape') {
      if (!els.patPanel.hasAttribute('hidden')) { els.patPanel.setAttribute('hidden', ''); return; }
      if (!els.themeDropdown.hasAttribute('hidden')) { els.themeDropdown.setAttribute('hidden', ''); return; }
      if (compareIsOpen()) closeCompare();
    }
  });
}

function bindTheme() {
  const current = localStorage.getItem('gitpulse_theme') || '';
  markActiveTheme(current);

  els.themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    els.themeDropdown.toggleAttribute('hidden');
  });

  els.themeDropdown.querySelectorAll('.theme-opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme || '';
      if (theme) document.documentElement.setAttribute('data-theme', theme);
      else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('gitpulse_theme', theme);
      markActiveTheme(theme);
      els.themeDropdown.setAttribute('hidden', '');
      if (window.lucide) lucide.createIcons();
    });
  });

  // close on outside click / Escape
  document.addEventListener('click', (e) => {
    if (!els.themeDropdown.hasAttribute('hidden') && !e.target.closest('#theme-menu')) {
      els.themeDropdown.setAttribute('hidden', '');
    }
  });
}

function markActiveTheme(theme) {
  els.themeDropdown.querySelectorAll('.theme-opt').forEach((opt) => {
    opt.setAttribute('aria-current', (opt.dataset.theme || '') === theme ? 'true' : 'false');
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
  document.title = `GitPulse | ${username}`;

  // Update URL without reload
  const url = new URL(window.location);
  url.searchParams.delete('compare');
  url.searchParams.set('user', username);
  window.history.pushState({}, '', url);

  showDashboard(username);
}

// ═══════════════════════════════════════
//  DASHBOARD TOGGLE
// ═══════════════════════════════════════
async function exportDashboard() {
  if (typeof html2canvas === 'undefined') { alert('Export library still loading — try again in a moment.'); return; }
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#111014';
  const prev = els.exportBtn.innerHTML;
  els.exportBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;"></span>';
  try {
    const canvas = await html2canvas(els.dashboard, { backgroundColor: bg, scale: 2, useCORS: true, logging: false });
    const link = document.createElement('a');
    link.download = `${state.username || 'gitpulse'}-gitpulse.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    console.error(e);
    alert('Could not export the image.');
  } finally {
    els.exportBtn.innerHTML = prev;
    if (window.lucide) lucide.createIcons();
  }
}

const compareIsOpen = () => !els.compareSection.hasAttribute('hidden');

// Close the compare view and return to wherever you came from.
function closeCompare() {
  if (!compareIsOpen()) return;
  const url = new URL(window.location);
  url.searchParams.delete('compare');
  if (state.username) {
    url.searchParams.set('user', state.username);
    window.history.pushState({}, '', url);
    showDashboard(state.username);
  } else {
    url.searchParams.delete('user');
    window.history.pushState({}, '', url);
    showLanding();
  }
}

// Clicking the header compare icon opens the view, or closes it when open.
function toggleCompare() {
  if (compareIsOpen()) closeCompare();
  else showCompare();
}

function showCompare(a, b) {
  els.landingSection.setAttribute('hidden', '');
  els.dashboard.setAttribute('hidden', '');
  els.headerSearch.setAttribute('hidden', '');
  if (els.exportBtn) els.exportBtn.setAttribute('hidden', '');
  els.compareSection.removeAttribute('hidden');
  if (els.compareBtn) { els.compareBtn.classList.add('active'); els.compareBtn.setAttribute('aria-pressed', 'true'); }
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (a) els.compareA.value = a;
  if (b) els.compareB.value = b;
  if (a && b) Compare.render(a, b);
  else els.compareA.focus();
}

function clearCompareActive() {
  els.compareSection.setAttribute('hidden', '');
  if (els.compareBtn) { els.compareBtn.classList.remove('active'); els.compareBtn.setAttribute('aria-pressed', 'false'); }
}

function handleCompare() {
  const a = els.compareA.value.trim();
  const b = els.compareB.value.trim();
  if (!a || !b) { els.compareA.focus(); return; }
  const url = new URL(window.location);
  url.searchParams.delete('user');
  url.searchParams.set('compare', `${a},${b}`);
  window.history.pushState({}, '', url);
  Compare.render(a, b);
}

function showLanding() {
  els.dashboard.setAttribute('hidden', '');
  clearCompareActive();
  els.landingSection.removeAttribute('hidden');
  els.headerSearch.setAttribute('hidden', '');
  if (els.exportBtn) els.exportBtn.setAttribute('hidden', '');
  // clear both search fields so the previous name doesn't linger
  if (els.usernameInput) els.usernameInput.value = '';
  if (els.landingInput) els.landingInput.value = '';
  window.scrollTo({ top: 0, behavior: 'auto' });
}

async function showDashboard(username) {
  clearCompareActive();
  els.landingSection.setAttribute('hidden', '');
  els.headerSearch.removeAttribute('hidden');   // reveal header search on the dashboard
  if (els.exportBtn) els.exportBtn.removeAttribute('hidden');
  window.scrollTo({ top: 0, behavior: 'auto' });
  UI.showLoading();

  try {
    // 1. Fetch user data (REST) + linked social accounts
    const user = await API.getUser(username);
    let socials = [];
    try { socials = await API.getSocials(username); } catch (e) { /* best-effort */ }
    UI.renderProfile(user, socials);
    UI.renderStats(user);
    
    // 2. Fetch repos (REST) for languages and highlights
    const repos = await API.getRepos(username);
    Charts.render(username, repos);

    // Prefer the user's pinned repos (GraphQL); fall back to top-by-stars.
    const pinned = await API.getPinned(username);
    if (pinned && pinned.length) {
      const normalized = pinned.map(n => ({
        name: n.name,
        description: n.description,
        html_url: n.url,
        language: n.primaryLanguage ? n.primaryLanguage.name : null,
        stargazers_count: n.stargazerCount,
        forks_count: n.forkCount,
        updated_at: n.updatedAt,
        fork: false,
      }));
      Repos.render(username, normalized, { pinned: true });
    } else {
      Repos.render(username, repos);
    }

    // 3. Fetch contributions (GraphQL) for heatmap and streaks
    try {
      const contributionsData = await API.getContributions(username);
      Heatmap.render(username, contributionsData);
      Stats.render(username, contributionsData);
    } catch (graphqlErr) {
      console.warn("Contributions unavailable:", graphqlErr);
      const heatmapCard = document.getElementById('heatmap-card');
      if (heatmapCard) {
        heatmapCard.innerHTML = `
          <div class="locked-state">
            <i data-lucide="lock-keyhole"></i>
            <p>Contribution graph needs a GitHub token.</p>
            <span>Add one in Settings (top right) - it stays in your browser. Or run the proxy so visitors need nothing.</span>
            <button class="btn btn-secondary btn-sm" id="unlock-pat">Add a token</button>
          </div>`;
      }
      const streakCards = document.getElementById('streak-cards');
      if (streakCards) streakCards.innerHTML = `<div class="locked-note" style="grid-column: 1/-1;">Streaks unlock with a token.</div>`;
      if (window.lucide) lucide.createIcons();
      const unlock = document.getElementById('unlock-pat');
      if (unlock) unlock.addEventListener('click', () => els.patToggle.click());
    }

    // 4. Fetch events for coding patterns
    try {
      const events = await API.getEvents(username);
      Patterns.render(username, events);
    } catch (eventsErr) {
      console.warn("Events error, skipping patterns:", eventsErr);
      const patternsCards = document.getElementById('patterns-cards');
      if (patternsCards) patternsCards.innerHTML = `<div class="error-msg" style="grid-column: 1/-1;">${eventsErr.message}</div>`;
    }

  } catch (error) {
    UI.showError(error.message);
  }
}

// ═══════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
