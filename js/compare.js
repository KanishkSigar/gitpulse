// ============================================
// GitPulse — Compare two users side by side
// ============================================

import { API } from './api.js';
import { getLangColor } from './langColors.js';

function metrics(user, repos) {
  let stars = 0, forks = 0;
  const langBytes = {};
  (repos || []).forEach(r => {
    stars += r.stargazers_count || 0;
    forks += r.forks_count || 0;
    if (r.language) langBytes[r.language] = (langBytes[r.language] || 0) + (r.size || 1);
  });
  const topLang = Object.keys(langBytes).sort((a, b) => langBytes[b] - langBytes[a])[0] || null;
  const ageYears = user.created_at
    ? ((Date.now() - new Date(user.created_at)) / (365.25 * 24 * 3600 * 1000)).toFixed(1)
    : null;
  return {
    followers: user.followers || 0,
    following: user.following || 0,
    repos: user.public_repos || 0,
    stars,
    forks,
    topLang,
    ageYears,
  };
}

const num = (n) => (n ?? 0).toLocaleString();

export const Compare = {
  async render(aName, bName) {
    const el = document.getElementById('compare-results');
    if (!el) return;
    el.innerHTML = '<div class="loading-state"><span class="spinner"></span> Comparing…</div>';

    try {
      const [ua, ra, ub, rb] = await Promise.all([
        API.getUser(aName), API.getRepos(aName),
        API.getUser(bName), API.getRepos(bName),
      ]);
      const ma = metrics(ua, ra);
      const mb = metrics(ub, rb);

      const rows = [
        { label: 'Followers', a: ma.followers, b: mb.followers, cmp: true },
        { label: 'Following', a: ma.following, b: mb.following, cmp: true },
        { label: 'Public Repos', a: ma.repos, b: mb.repos, cmp: true },
        { label: 'Total Stars', a: ma.stars, b: mb.stars, cmp: true },
        { label: 'Total Forks', a: ma.forks, b: mb.forks, cmp: true },
        { label: 'Account Age', a: ma.ageYears ? `${ma.ageYears}y` : '—', b: mb.ageYears ? `${mb.ageYears}y` : '—', cmp: false },
        { label: 'Top Language', a: ma.topLang, b: mb.topLang, cmp: false, lang: true },
      ];

      const head = (u) => `
        <div class="chead">
          <img src="${u.avatar_url}&size=144" alt="" crossorigin="anonymous">
          <a href="${u.html_url}" target="_blank" rel="noopener" class="chead__name">${u.name || u.login}</a>
          <span class="chead__login">@${u.login}</span>
        </div>`;

      const rowHtml = rows.map(r => {
        let aw = '', bw = '';
        if (r.cmp) {
          if (r.a > r.b) aw = 'win';
          else if (r.b > r.a) bw = 'win';
        }
        const cell = (v, w, lang) => {
          if (lang) {
            return v
              ? `<div class="cval"><span class="cdot" style="background:${getLangColor(v)}"></span>${v}</div>`
              : `<div class="cval">—</div>`;
          }
          return `<div class="cval ${w}">${typeof v === 'number' ? num(v) : v}</div>`;
        };
        return `${cell(r.a, aw, r.lang)}<div class="crow-label">${r.label}</div>${cell(r.b, bw, r.lang)}`;
      }).join('<div class="cspacer"></div>');

      el.innerHTML = `
        <div class="compare-grid card" style="padding: var(--space-6);">
          ${head(ua)}<div class="cvs">VS</div>${head(ub)}
          <div class="cspacer"></div>
          ${rowHtml}
        </div>`;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      el.innerHTML = `<div class="error-msg">${e.message || 'Could not compare these users.'}</div>`;
    }
  },
};
