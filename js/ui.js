// ============================================
// GitPulse — UI Helpers (Editorial Redesign)
// ============================================

// Inline brand SVGs — Lucide dropped brand logos, so we ship our own (always render).
const SVG = {
  github: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  twitter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  linkedin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>',
  youtube: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  instagram: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.332 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.668-.072-4.948-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
  mastodon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.504 2.962 1.51l.638 1.07.638-1.07c.66-1.006 1.65-1.51 2.96-1.51 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/></svg>',
  bluesky: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364q.207-.03.415-.056-.207.033-.415.056c-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a9 9 0 0 1-.415-.056q.207.026.415.056c2.67.297 5.568-.628 6.383-3.364C23.622 9.418 24 4.458 24 3.768c0-.69-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>',
  generic: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
};
function socialIcon(p) {
  p = (p || '').toLowerCase();
  if (p === 'x' || p === 'twitter') return SVG.twitter;
  return SVG[p] || SVG.generic;
}
function socialLabel(provider, url) {
  const p = (provider || '').toLowerCase();
  if (p === 'twitter' || p === 'x') return '@' + url.split('/').filter(Boolean).pop();
  if (p === 'generic' || !p) return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export const UI = {
  elements: {
    landing: document.getElementById('landing-section'),
    dashboard: document.getElementById('dashboard'),
    profileCard: document.getElementById('profile-card'),
    statsBar: document.getElementById('stats-bar'),
    searchInput: document.getElementById('landing-username-input'),
    searchBtn: document.getElementById('landing-search-btn')
  },

  showDashboard() {
    this.elements.landing.setAttribute('hidden', 'true');
    this.elements.dashboard.removeAttribute('hidden');
  },

  showLoading() {
    this.elements.profileCard.innerHTML = `
      <div style="display: flex; gap: 24px; align-items: center; padding: 20px;">
        <div style="width: 88px; height: 88px; border-radius: 50%; background: var(--bg-surface); flex-shrink: 0;"></div>
        <div style="flex: 1;">
          <div style="height: 24px; width: 180px; background: var(--bg-surface); border-radius: 8px; margin-bottom: 12px;"></div>
          <div style="height: 14px; width: 120px; background: var(--bg-surface); border-radius: 6px;"></div>
        </div>
      </div>
    `;
    this.elements.statsBar.innerHTML = Array(4).fill(`
      <div class="stat-card">
        <div style="height: 32px; width: 50px; background: var(--bg-surface); border-radius: 8px; margin-bottom: 8px;"></div>
        <div style="height: 12px; width: 70px; background: var(--bg-surface); border-radius: 6px;"></div>
      </div>
    `).join('');
    this.showDashboard();
  },

  showError(message) {
    this.elements.profileCard.innerHTML = `
      <div style="color: var(--accent-coral); padding: var(--space-10); text-align: center; width: 100%;">
        <i data-lucide="alert-circle" style="width: 40px; height: 40px; margin-bottom: var(--space-4);"></i>
        <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 8px;">Something went wrong</h3>
        <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 20px;">${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
    this.elements.statsBar.innerHTML = '';
    if (window.lucide) window.lucide.createIcons();
  },

  renderProfile(user, socials = []) {
    const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const metaItems = [
      `<span style="display:inline-flex; align-items:center; gap:5px;"><i data-lucide="calendar" style="width:13px;height:13px;"></i> ${joinedDate}</span>`,
      user.location ? `<span style="display:inline-flex; align-items:center; gap:5px;"><i data-lucide="map-pin" style="width:13px;height:13px;"></i> ${user.location}</span>` : '',
      user.blog ? `<span style="display:inline-flex; align-items:center; gap:5px;"><i data-lucide="link" style="width:13px;height:13px;"></i> <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" rel="noopener">${user.blog.replace(/^https?:\/\//, '')}</a></span>` : '',
    ].filter(Boolean).join('<span style="color: var(--text-muted); margin: 0 8px;">·</span>');

    // Linked social accounts, each with its own brand icon.
    const list = Array.isArray(socials) ? [...socials] : [];
    if (user.twitter_username && !list.some(s => /^(twitter|x)$/i.test(s.provider || ''))) {
      list.push({ provider: 'twitter', url: `https://twitter.com/${user.twitter_username}` });
    }
    const socialChips = list.map(s =>
      `<a class="social-chip" href="${s.url}" target="_blank" rel="noopener" title="${socialLabel(s.provider, s.url)}">${socialIcon(s.provider)}<span>${socialLabel(s.provider, s.url)}</span></a>`
    ).join('');

    const actions = [
      `<a class="btn btn-secondary btn-sm" href="${user.html_url}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:6px;">${SVG.github} View on GitHub</a>`,
      user.company ? `<span class="social-chip"><i data-lucide="building-2" style="width:14px;height:14px;"></i> ${user.company.replace(/^@/, '')}</span>` : '',
      socialChips,
    ].filter(Boolean).join('');

    this.elements.profileCard.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; gap: 18px;">
        <div style="display: flex; gap: 24px; align-items: flex-start;">
          <img src="${user.avatar_url}" alt="${user.login}" style="width: 88px; height: 88px; border-radius: 50%; border: 2px solid var(--border-default); flex-shrink: 0;">
          <div style="flex: 1; min-width: 0;">
            <div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
              <h1 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; line-height: 1.2;">
                ${user.name || user.login}
              </h1>
              <span style="color: var(--text-muted); font-size: 0.875rem; font-weight: 400;">@${user.login}</span>
            </div>
            ${user.bio ? `<p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 8px 0 12px;">${user.bio}</p>` : '<div style="margin-bottom: 12px;"></div>'}
            <div style="display: flex; flex-wrap: wrap; gap: 4px; font-size: 0.78rem; color: var(--text-tertiary);">
              ${metaItems}
            </div>
          </div>
        </div>
        <div style="margin-top: auto; display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          ${actions}
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  },

  renderStats(user) {
    const stats = [
      { label: 'Repos', value: user.public_repos, icon: 'book-marked' },
      { label: 'Followers', value: user.followers, icon: 'users' },
      { label: 'Following', value: user.following, icon: 'user-plus' },
      { label: 'Gists', value: user.public_gists, icon: 'code' }
    ];

    this.elements.statsBar.innerHTML = stats.map(stat => `
      <div class="stat-card">
        <div class="stat-card__icon"><i data-lucide="${stat.icon}"></i></div>
        <div class="stat-card__value" data-value="${stat.value}">0</div>
        <div class="stat-card__label">${stat.label}</div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    // Animate numbers
    const valueElements = this.elements.statsBar.querySelectorAll('.stat-card__value');
    valueElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-value'), 10);
      this.animateNumber(el, target, 800);
    });
  },

  animateNumber(element, target, duration) {
    if (target === 0) return;
    
    let start = 0;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      
      element.innerText = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.innerText = target.toLocaleString();
      }
    };
    requestAnimationFrame(update);
  }
};
