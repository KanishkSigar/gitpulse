// ============================================
// GitPulse — Coding Patterns Analysis
// ============================================

export const Patterns = {
  element: document.getElementById('patterns-cards'),
  charts: {},

  async render(username, events) {
    if (!this.element) return;

    if (!events || events.length === 0) {
      this.element.innerHTML = '<div class="error-msg" style="grid-column: 1/-1;">No recent activity found.</div>';
      return;
    }

    // Filter for PushEvents to analyze coding activity
    const pushes = events.filter(e => e.type === 'PushEvent');
    
    if (pushes.length === 0) {
      this.element.innerHTML = '<div class="error-msg" style="grid-column: 1/-1;">No recent push events found for analysis.</div>';
      return;
    }

    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0); // 0 = Sunday, 6 = Saturday

    pushes.forEach(event => {
      const date = new Date(event.created_at);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    });

    this.element.innerHTML = `
      <div class="pattern-card">
        <h3>Time of Day</h3>
        <div style="position: relative; height: 200px; width: 100%; margin-top: var(--space-4);">
          <canvas id="timeChart"></canvas>
        </div>
      </div>
      <div class="pattern-card">
        <h3>Day of Week</h3>
        <div style="position: relative; height: 200px; width: 100%; margin-top: var(--space-4);">
          <canvas id="dayChart"></canvas>
        </div>
      </div>
    `;

    // Wait for DOM
    setTimeout(() => {
      this.drawTimeChart(hourCounts);
      this.drawDayChart(dayCounts);
    }, 0);
  },

  drawTimeChart(data) {
    const ctx = document.getElementById('timeChart');
    if (!ctx) return;
    if (this.charts.time) this.charts.time.destroy();

    const labels = Array.from({ length: 24 }, (_, i) => {
      if (i === 0) return '12 AM';
      if (i === 12) return '12 PM';
      return i < 12 ? `${i} AM` : `${i - 12} PM`;
    });

    this.charts.time = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Commits',
          data,
          backgroundColor: 'rgba(200, 162, 255, 0.4)',
          borderColor: '#c8a2ff',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: this.getChartOptions()
    });
  },

  drawDayChart(data) {
    const ctx = document.getElementById('dayChart');
    if (!ctx) return;
    if (this.charts.day) this.charts.day.destroy();

    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    this.charts.day = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Commits',
          data,
          backgroundColor: 'rgba(245, 193, 108, 0.4)',
          borderColor: '#f5c16c',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: this.getChartOptions()
    });
  },

  getChartOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#211f27',
          titleColor: '#f0ece4',
          bodyColor: '#f0ece4',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: '#9e97a5' },
          grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
        },
        x: {
          ticks: { color: '#9e97a5', maxRotation: 45, minRotation: 0 },
          grid: { display: false, drawBorder: false }
        }
      }
    };
  }
};
