// ============================================
// GitPulse — UI Helpers
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
      <div class="profile__avatar" style="background: var(--border-primary); animation: pulse 1.5s infinite;"></div>
      <div class="profile__info">
        <div style="height: 32px; width: 200px; background: var(--border-primary); border-radius: 4px; animation: pulse 1.5s infinite;"></div>
        <div style="height: 20px; width: 150px; background: var(--border-primary); border-radius: 4px; animation: pulse 1.5s infinite; margin-top: 8px;"></div>
      </div>
    `;
    this.elements.statsBar.innerHTML = Array(4).fill(`
      <div class="stat-card" style="animation: pulse 1.5s infinite;">
        <div class="stat-card__value" style="height: 36px; width: 60px; background: var(--border-primary); border-radius: 4px; margin-bottom: 8px;"></div>
        <div class="stat-card__label" style="height: 16px; width: 80px; background: var(--border-primary); border-radius: 4px;"></div>
      </div>
    `).join('');
    this.showDashboard();
  },

  showError(message) {
    this.elements.profileCard.innerHTML = `
      <div style="color: var(--accent-red); padding: var(--space-8); text-align: center; width: 100%;">
        <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: var(--space-4);"></i>
        <h3>Error</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: var(--space-4);">Try Again</button>
      </div>
    `;
    this.elements.statsBar.innerHTML = '';
    // Re-initialize lucide icons for error
    if (window.lucide) window.lucide.createIcons();
  },

  renderProfile(user) {
    const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const locationHtml = user.location ? `<div class="profile__meta-item"><i data-lucide="map-pin"></i> ${user.location}</div>` : '';
    const websiteHtml = user.blog ? `<div class="profile__meta-item"><i data-lucide="link"></i> <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" rel="noopener noreferrer">${user.blog.replace(/^https?:\/\//, '')}</a></div>` : '';
    const twitterHtml = user.twitter_username ? `<div class="profile__meta-item"><i data-lucide="twitter"></i> <a href="https://twitter.com/${user.twitter_username}" target="_blank" rel="noopener noreferrer">@${user.twitter_username}</a></div>` : '';

    this.elements.profileCard.innerHTML = `
      <img src="${user.avatar_url}" alt="${user.login}" class="profile__avatar">
      <div class="profile__info">
        <h1 class="profile__name">
          ${user.name || user.login}
          <a href="${user.html_url}" target="_blank" rel="noopener noreferrer" style="color: var(--text-tertiary); transition: color 0.2s;"><i data-lucide="external-link"></i></a>
        </h1>
        <div class="profile__username">@${user.login}</div>
        ${user.bio ? `<p class="profile__bio">${user.bio}</p>` : ''}
        <div class="profile__meta">
          <div class="profile__meta-item"><i data-lucide="calendar"></i> Joined ${joinedDate}</div>
          ${locationHtml}
          ${websiteHtml}
          ${twitterHtml}
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  },

  renderStats(user) {
    const stats = [
      { label: 'Public Repos', value: user.public_repos, icon: 'book-marked' },
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
      this.animateNumber(el, target, 1500);
    });
  },

  animateNumber(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16); // ~60fps
    
    if (target === 0) return;

    const update = () => {
      start += increment;
      if (start < target) {
        element.innerText = Math.ceil(start).toLocaleString();
        requestAnimationFrame(update);
      } else {
        element.innerText = target.toLocaleString();
      }
    };
    requestAnimationFrame(update);
  }
};
