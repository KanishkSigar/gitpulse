// ============================================
// GitPulse — Repository Highlights
// ============================================

import { getLangColor } from './langColors.js';

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);
}

export const Repos = {
  element: document.getElementById('repos-container'),

  async render(username, repos, opts = {}) {
    if (!this.element) return;

    const heading = document.getElementById('repos-heading');
    if (heading) heading.textContent = opts.pinned ? 'Pinned Repositories' : 'Top public repositories by stars';

    if (!repos || repos.length === 0) {
      this.element.innerHTML = '<div class="error-msg">No repositories found.</div>';
      return;
    }

    let list;
    if (opts.pinned) {
      // Pinned repos are already curated and ordered by the user — show as-is.
      list = repos;
    } else {
      // Sort by stars descending, then get top 6 (skipping forks).
      list = [...repos]
        .filter(repo => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6);

      if (list.length === 0) {
        this.element.innerHTML = '<div class="error-msg">No original repositories found (only forks).</div>';
        return;
      }
    }

    this.element.innerHTML = `
      <div class="report-repo-list">
        ${list.slice(0, 3).map(repo => this.createRepoCard(repo)).join('')}
      </div>
      ${list.length > 3 ? `<details class="more-repos"><summary>Show ${list.length - 3} more repositories</summary>
        <div class="report-repo-list">${list.slice(3).map(repo => this.createRepoCard(repo)).join('')}</div>
      </details>` : ''}
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  createRepoCard(repo) {
    const description = escapeText(repo.description);
    const language = escapeText(repo.language);
    const link = new URL(repo.html_url);
    const href = link.origin === 'https://github.com' ? escapeText(link.href) : '#';
    return `
      <article class="report-repo">
        <h3><a href="${href}" target="_blank" rel="noopener noreferrer">${escapeText(repo.name)}</a></h3>
        ${description ? `<p>${description}</p>` : ''}
        <div class="report-repo-meta">
          ${language ? `<span><span class="cdot" style="background:${getLangColor(repo.language)}"></span>${language}</span>` : ''}
          <span>★ ${Number(repo.stargazers_count || 0).toLocaleString()}</span>
          <span>⑂ ${Number(repo.forks_count || 0).toLocaleString()} forks</span>
        </div>
      </article>`;
  },
};
