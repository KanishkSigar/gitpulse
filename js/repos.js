// ============================================
// GitPulse — Repository Highlights
// ============================================

import { getLangColor } from './langColors.js';

export const Repos = {
  element: document.getElementById('repos-container'),

  async render(username, repos, opts = {}) {
    if (!this.element) return;

    const heading = document.getElementById('repos-heading');
    if (heading) heading.textContent = opts.pinned ? 'Pinned Repositories' : 'Top Repositories';

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
      <div class="grid-2">
        ${list.map(repo => this.createRepoCard(repo)).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  },

  createRepoCard(repo) {
    const language = repo.language || 'Unknown';
    const updatedDate = new Date(repo.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const description = repo.description || 'No description provided.';
    
    // We could reuse the color logic from charts, but for simplicity here we just use the name
    
    return `
      <div class="repo-card" style="display: flex; flex-direction: column; background: rgba(255,255,255,0.02); border: 1px solid var(--bento-border); border-radius: var(--radius-md); padding: var(--space-4); transition: all 0.2s;">
        <h3 class="repo-card__name" style="margin-top: 0; margin-bottom: var(--space-2); display: flex; align-items: center; gap: 8px;">
          <i data-lucide="book-marked" style="color: var(--text-tertiary);"></i>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary); text-decoration: none;">${repo.name}</a>
        </h3>
        <p class="repo-card__desc" style="color: var(--text-secondary); font-size: 0.9em; flex-grow: 1; margin-bottom: var(--space-4);">
          ${description}
        </p>
        <div class="repo-card__meta" style="display: flex; gap: var(--space-4); font-size: 0.85em; color: var(--text-tertiary);">
          ${repo.language ? `
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${getLangColor(repo.language)};"></span>
              ${language}
            </div>
          ` : ''}
          <div style="display: flex; align-items: center; gap: 4px;">
            <i data-lucide="star" style="width: 14px; height: 14px;"></i>
            ${repo.stargazers_count}
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <i data-lucide="git-fork" style="width: 14px; height: 14px;"></i>
            ${repo.forks_count}
          </div>
          <div style="display: flex; align-items: center; gap: 4px; margin-left: auto;">
            Updated ${updatedDate}
          </div>
        </div>
      </div>
    `;
  }
};
