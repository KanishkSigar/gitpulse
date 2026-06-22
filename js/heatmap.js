// ============================================
// GitPulse — Heatmap Generator
// ============================================

export const Heatmap = {
  element: document.getElementById('heatmap-card'),

  async render(username, data) {
    if (!this.element) return;

    if (!data || !data.user || !data.user.contributionsCollection) {
      this.element.innerHTML = '<div class="error-msg">No contribution data available. PAT might be required.</div>';
      return;
    }

    const calendar = data.user.contributionsCollection.contributionCalendar;
    const total = calendar.totalContributions;
    
    let html = `
      <div class="heatmap-header">
        <div class="heatmap-total"><strong>${total.toLocaleString()}</strong> contributions in the last year</div>
      </div>
      <div class="heatmap-container">
        <div class="heatmap-grid">
    `;

    // Flatten weeks into days
    const days = [];
    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        days.push(day);
      });
    });

    // Determine the max count to scale colors if we wanted to, 
    // but GitHub API already provides standard colors or levels.
    // GitHub API provides 'color' hex code, we can use it or map to our CSS variables.
    // For our dark theme, we can map count to intensity level 0-4.
    
    // Instead of raw colors, let's map to our CSS variables
    const getLevel = (count) => {
      if (count === 0) return 0;
      if (count <= 3) return 1;
      if (count <= 6) return 2;
      if (count <= 10) return 3;
      return 4;
    };

    // Calculate columns (weeks)
    const weeksCount = calendar.weeks.length;
    
    html += `<div class="heatmap-cells" style="grid-template-columns: repeat(${weeksCount}, 1fr);">`;

    // GitHub's grid is column-major, meaning days of week are rows.
    // CSS Grid can be column-major with `grid-auto-flow: column`.
    
    calendar.weeks.forEach(week => {
      // Sometimes the first week doesn't start on Sunday, so we pad it.
      // But GitHub API usually pads it for us with empty days.
      week.contributionDays.forEach(day => {
        const level = getLevel(day.contributionCount);
        const dateStr = new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        html += `
          <div class="heatmap-cell level-${level}" 
               data-date="${dateStr}" 
               data-count="${day.contributionCount}"
               onmouseenter="showTooltip(event, '${day.contributionCount} contributions on ${dateStr}')"
               onmouseleave="hideTooltip()">
          </div>
        `;
      });
    });

    html += `</div></div>`;

    // Legend
    html += `
      <div class="heatmap-footer">
        <div class="heatmap-legend">
          <span>Less</span>
          <div class="heatmap-cell level-0"></div>
          <div class="heatmap-cell level-1"></div>
          <div class="heatmap-cell level-2"></div>
          <div class="heatmap-cell level-3"></div>
          <div class="heatmap-cell level-4"></div>
          <span>More</span>
        </div>
      </div>
    `;

    this.element.innerHTML = html;
  }
};

// Global tooltip handlers for heatmap
window.showTooltip = function(e, text) {
  const tooltip = document.getElementById('global-tooltip');
  if (!tooltip) return;
  tooltip.textContent = text;
  tooltip.style.display = 'block';
  
  const rect = e.target.getBoundingClientRect();
  tooltip.style.left = (rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
  tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 8) + 'px';
  tooltip.style.opacity = '1';
};

window.hideTooltip = function() {
  const tooltip = document.getElementById('global-tooltip');
  if (!tooltip) return;
  tooltip.style.opacity = '0';
  tooltip.style.display = 'none';
};
