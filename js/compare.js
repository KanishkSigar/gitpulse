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

const dayMs = 86_400_000;

function activity(eventsA, eventsB, loginA, loginB) {
  if (!eventsA || !eventsB) {
    return '<section class="compare-activity"><h3>Public push activity</h3><p class="report-note">GitHub activity was unavailable for one or both profiles.</p></section>';
  }
  const end = Math.floor(Date.now() / dayMs);
  // Drop the oldest day of a full sample because its event count can be incomplete.
  const firstCompleteDay = events => events.length >= 100
    ? Math.floor(Math.min(...events.map(event => Date.parse(event.created_at))) / dayMs) + 1
    : end - 27;
  const start = Math.max(end - 27, firstCompleteDay(eventsA), firstCompleteDay(eventsB));
  if (start > end) {
    return '<section class="compare-activity"><h3>Public push activity</h3><p class="report-note">The latest event samples do not cover a shared full day.</p></section>';
  }
  const countPushes = events => {
    const counts = new Map();
    for (const event of events) {
      if (event.type !== 'PushEvent') continue;
      const day = Math.floor(Date.parse(event.created_at) / dayMs);
      counts.set(day, (counts.get(day) || 0) + 1);
    }
    return counts;
  };
  const a = countPushes(eventsA);
  const b = countPushes(eventsB);
  const pairs = Array.from({ length: end - start + 1 }, (_, i) => [a.get(start + i) || 0, b.get(start + i) || 0]);
  const scale = Math.max(1, ...pairs.flat());
  const format = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const total = column => pairs.reduce((sum, pair) => sum + pair[column], 0);
  const bars = pairs.map(([left, right], i) => {
    const day = format.format((start + i) * dayMs);
    return `<span class="compare-day" title="${day} · ${left} / ${right} pushes">
      <i style="height:${left / scale * 100}%"></i><i style="height:${right / scale * 100}%"></i>
    </span>`;
  }).join('');
  return `<section class="compare-activity">
    <h3>Public push activity</h3>
    <p class="report-note">${format.format(start * dayMs)} – ${format.format(end * dayMs)} UTC · Shared scale 0–${scale} pushes/day · Up to 100 recent public events per profile</p>
    <div role="img" aria-label="Daily push events. ${loginA}: ${total(0)} pushes. ${loginB}: ${total(1)} pushes." style="--days:${pairs.length}">${bars}</div>
    <div class="compare-legend"><span>@${loginA} · ${total(0)}</span><span>@${loginB} · ${total(1)}</span></div>
  </section>`;
}

export const Compare = {
  async render(aName, bName) {
    const el = document.getElementById('compare-results');
    if (!el) return;
    el.innerHTML = '<div class="loading-state"><span class="spinner"></span> Comparing…</div>';

    try {
      const events = name => API.getEvents(name).catch(() => null);
      const [ua, ra, ub, rb, ea, eb] = await Promise.all([
        API.getUser(aName), API.getRepos(aName),
        API.getUser(bName), API.getRepos(bName),
        events(aName), events(bName),
      ]);
      const ma = metrics(ua, ra);
      const mb = metrics(ub, rb);

      const rows = [
        { label: 'Followers', a: ma.followers, b: mb.followers, cmp: true },
        { label: 'Following', a: ma.following, b: mb.following, cmp: true },
        { label: 'Public Repos', a: ma.repos, b: mb.repos, cmp: true },
        { label: 'Stars in sample', a: ma.stars, b: mb.stars, cmp: true },
        { label: 'Forks in sample', a: ma.forks, b: mb.forks, cmp: true },
        { label: 'Account Age', a: ma.ageYears ? `${ma.ageYears}y` : '—', b: mb.ageYears ? `${mb.ageYears}y` : '—', cmp: false },
        { label: 'Top sampled language', a: ma.topLang, b: mb.topLang, cmp: false, lang: true },
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
        <div class="compare-grid card">
          ${head(ua)}<div class="cvs">VS</div>${head(ub)}
          <div class="cspacer"></div>
          ${activity(ea, eb, ua.login, ub.login)}
          ${rowHtml}
          <p class="compare-activity report-note">Repository metrics use up to 100 public repositories per profile, ordered by last push.</p>
        </div>`;

      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      el.innerHTML = `<div class="error-msg">${e.message || 'Could not compare these users.'}</div>`;
    }
  },
};
