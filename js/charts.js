// ============================================
// GitPulse — Charts & Graphs
// ============================================

import { getLangColor } from './langColors.js';

export const Charts = {
  element: document.getElementById('language-card'),
  chartInstance: null,

  getColor(lang) {
    return getLangColor(lang);
  },

  async render(username, repos) {
    if (!this.element) return;

    if (!repos || repos.length === 0) {
      this.element.innerHTML = '<div class="error-msg">No repositories found.</div>';
      return;
    }

    // Aggregate languages (bytes)
    const langBytes = {};
    let totalBytes = 0;

    repos.forEach(repo => {
      // Skip forks if we want, but for now we include them or check repo.fork
      if (repo.language) {
        // We use size as a proxy for bytes since getting exact bytes for all repos requires many API calls
        // For accurate language breakdown, GraphQL is better, but this is a decent approximation
        const bytes = repo.size * 1024; 
        langBytes[repo.language] = (langBytes[repo.language] || 0) + bytes;
        totalBytes += bytes;
      }
    });

    if (totalBytes === 0) {
      this.element.innerHTML = '<div class="error-msg">No language data found in repositories.</div>';
      return;
    }

    // Sort and calculate percentages
    const langs = Object.keys(langBytes)
      .map(lang => ({
        name: lang,
        bytes: langBytes[lang],
        percent: ((langBytes[lang] / totalBytes) * 100).toFixed(1)
      }))
      .sort((a, b) => b.bytes - a.bytes);

    // Group small languages into "Other"
    const topLangs = [];
    let otherBytes = 0;
    langs.forEach((lang, index) => {
      if (index < 6 && lang.percent > 1.0) {
        topLangs.push(lang);
      } else {
        otherBytes += lang.bytes;
      }
    });

    if (otherBytes > 0) {
      topLangs.push({
        name: 'Other',
        bytes: otherBytes,
        percent: ((otherBytes / totalBytes) * 100).toFixed(1)
      });
    }

    // Render HTML container for Chart.js
    this.element.innerHTML = `
      <div class="chart-container" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-around; gap: var(--space-6);">
        <div style="position: relative; width: 250px; height: 250px;">
          <canvas id="langChart"></canvas>
        </div>
        <div class="lang-legend" style="display: flex; flex-direction: column; gap: var(--space-3); min-width: 200px;">
          ${topLangs.map(l => `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${this.getColor(l.name)};"></span>
                <span style="font-weight: 500; color: var(--text-primary);">${l.name}</span>
              </div>
              <span style="color: var(--text-tertiary); font-family: var(--font-mono); font-size: 0.9em;">${l.percent}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Wait for DOM to update
    setTimeout(() => {
      this.drawChart(topLangs);
    }, 0);
  },

  drawChart(data) {
    const ctx = document.getElementById('langChart');
    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Assuming Chart.js is loaded globally via CDN in index.html
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    Chart.defaults.color = '#9e97a5';
    Chart.defaults.font.family = "'Space Grotesk', sans-serif";

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data: data.map(d => d.bytes),
          backgroundColor: data.map(d => this.getColor(d.name)),
          borderWidth: 2,
          borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-elevated').trim() || '#1a181f',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = data[context.dataIndex].percent;
                return ` ${label}: ${value}%`;
              }
            },
            backgroundColor: '#211f27',
            titleColor: '#f0ece4',
            bodyColor: '#f0ece4',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            boxPadding: 4
          }
        }
      }
    });
  }
};
