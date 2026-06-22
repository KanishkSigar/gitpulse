// ============================================
// GitPulse — Streak & Stats Tracker
// ============================================

export const Stats = {
  element: document.getElementById('streak-cards'),

  async render(username, data) {
    if (!this.element) return;

    if (!data || !data.user || !data.user.contributionsCollection) {
      this.element.innerHTML = '<div class="error-msg" style="grid-column: 1/-1;">Data unavailable for streaks.</div>';
      return;
    }

    const calendar = data.user.contributionsCollection.contributionCalendar;
    
    let currentStreak = 0;
    let longestStreak = 0;
    let bestDay = { count: 0, date: null };
    let tempStreak = 0;
    
    // Flatten weeks into days
    const days = [];
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        days.push({
          date: day.date,
          count: day.contributionCount
        });
      });
    });

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate stats
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      
      // Best day
      if (day.count > bestDay.count) {
        bestDay = { count: day.count, date: day.date };
      }

      // Streaks
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    // Current streak (count backwards from today or yesterday)
    let cStreak = 0;
    let foundToday = false;
    for (let i = days.length - 1; i >= 0; i--) {
      const day = days[i];
      if (day.date > today) continue; // Future dates in calendar
      
      if (day.date === today && day.count === 0) {
        // It's today and 0, current streak might be from yesterday, check yesterday
        continue;
      }

      if (day.count > 0) {
        cStreak++;
      } else {
        // Missed a day
        if (day.date !== today) {
          break; // Break only if it's not today. If today is 0, we still have yesterday's streak active.
        }
      }
    }
    currentStreak = cStreak;

    const bestDateStr = bestDay.date 
      ? new Date(bestDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A';

    this.element.innerHTML = `
      <div class="stat-card">
        <div class="stat-card__icon"><i data-lucide="flame" style="color: var(--accent-orange);"></i></div>
        <div class="stat-card__value">${currentStreak}</div>
        <div class="stat-card__label">Current Streak (days)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon"><i data-lucide="trophy" style="color: var(--accent-yellow);"></i></div>
        <div class="stat-card__value">${longestStreak}</div>
        <div class="stat-card__label">Longest Streak (days)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon"><i data-lucide="star" style="color: var(--accent-blue);"></i></div>
        <div class="stat-card__value">${bestDay.count}</div>
        <div class="stat-card__label">Best Day (${bestDateStr})</div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }
};
