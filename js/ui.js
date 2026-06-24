// ============================================
// GitPulse — UI Helpers (Editorial Redesign)
// ============================================

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

  renderProfile(user) {
    const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const metaItems = [
      `<span style="display:inline-flex; align-items:center; gap:5px;"><i data-lucide="calendar" style="width:13px;height:13px;"></i> ${joinedDate}</span>`,
      user.location ? `<span style="display:inline-flex; align-items:center; gap:5px;"><i data-lucide="map-pin" style="width:13px;height:13px;"></i> ${user.location}</span>` : '',
      user.blog ? `<span style="display:inline-flex; align-items:center; gap:5px;"><i data-lucide="link" style="width:13px;height:13px;"></i> <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" rel="noopener">${user.blog.replace(/^https?:\/\//, '')}</a></span>` : '',
    ].filter(Boolean).join('<span style="color: var(--text-muted); margin: 0 8px;">·</span>');

    this.elements.profileCard.innerHTML = `
      <div style="display: flex; gap: 24px; align-items: flex-start;">
        <img src="${user.avatar_url}" alt="${user.login}" style="width: 88px; height: 88px; border-radius: 50%; border: 2px solid var(--border-default); flex-shrink: 0;">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
            <h1 style="font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; line-height: 1.2;">
              ${user.name || user.login}
            </h1>
            <a href="${user.html_url}" target="_blank" rel="noopener" style="color: var(--text-muted); font-size: 0.875rem; font-weight: 400;">@${user.login} ↗</a>
          </div>
          ${user.bio ? `<p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 8px 0 12px;">${user.bio}</p>` : '<div style="margin-bottom: 12px;"></div>'}
          <div style="display: flex; flex-wrap: wrap; gap: 4px; font-size: 0.78rem; color: var(--text-tertiary);">
            ${metaItems}
          </div>
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
