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

// ── DOM Helpers ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  // Header
  usernameInput: $('#username-input'),
  searchBtn: $('#search-btn'),
  searchToggle: $('#search-toggle'),
  searchClose: $('#search-close'),
  headerSearch: $('#header-search'),
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

  // Dashboard
  dashboard: $('#dashboard'),
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
  const urlUser = params.get('user');
  if (urlUser) {
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
  // Search toggle (click icon to open search bar)
  els.searchToggle.addEventListener('click', () => {
    els.headerSearch.removeAttribute('hidden');
    els.searchToggle.setAttribute('hidden', '');
    els.usernameInput.focus();
  });

  // Search close
  els.searchClose.addEventListener('click', () => {
    els.headerSearch.setAttribute('hidden', '');
    els.searchToggle.removeAttribute('hidden');
  });

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
async function showDashboard(username) {
  UI.showLoading();

  try {
    // 1. Fetch user data (REST)
    const user = await API.getUser(username);
    UI.renderProfile(user);
    UI.renderStats(user);
    
    // 2. Fetch repos (REST) for languages and highlights
    const repos = await API.getRepos(username);
    Charts.render(username, repos);
    Repos.render(username, repos);

    // 3. Fetch contributions (GraphQL) for heatmap and streaks
    try {
      const contributionsData = await API.getContributions(username);
      Heatmap.render(username, contributionsData);
      Stats.render(username, contributionsData);
    } catch (graphqlErr) {
      console.warn("GraphQL error, skipping heatmap/streaks:", graphqlErr);
      const heatmapCard = document.getElementById('heatmap-card');
      if (heatmapCard) heatmapCard.innerHTML = `<div class="error-msg">${graphqlErr.message}</div>`;
      const streakCards = document.getElementById('streak-cards');
      if (streakCards) streakCards.innerHTML = `<div class="error-msg" style="grid-column: 1/-1;">${graphqlErr.message}</div>`;
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
