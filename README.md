# GitPulse

<div align="center">
  <p><strong>A stunning, dark-themed GitHub analytics dashboard.</strong></p>
  <br>
  <a href="https://kanishksigar.me" target="_blank"><img src="https://img.shields.io/badge/Live%20Demo-kanishksigar.me-2ea44f?style=for-the-badge&logo=github" alt="Live Demo"></a>
</div>

## Features
- **No data stored:** All data is fetched client-side directly from GitHub's API.
- **Beautiful Heatmap:** A custom CSS grid implementation of GitHub's contribution calendar.
- **Streak Tracking:** Instantly see your current streak, longest streak, and best day.
- **Language Breakdown:** A Chart.js donut chart showing your most used languages.
- **Coding Patterns:** Analyzes your recent push events to show your preferred time of day and day of the week to code.
- **Top Repositories:** Highlights your top 6 repositories sorted by stars.

## Getting Started

GitPulse runs entirely in the browser. You don't need a backend.

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/KanishkSigar/gitpulse.git
   \`\`\`
2. Open `index.html` in your browser.
3. (Optional but recommended) Run a local server for testing:
   \`\`\`bash
   npx serve .
   \`\`\`

## Personal Access Token (PAT)

While basic features work without authentication, GitHub heavily rate-limits unauthenticated API requests (60 per hour) and does not allow GraphQL queries (required for the contribution heatmap).

To get the full experience:
1. Go to your GitHub Settings -> Developer settings -> Personal access tokens.
2. Generate a new token (classic) with `read:user` and `repo` scopes.
3. Open GitPulse, click "Token" in the top right, and paste your PAT.
4. Your token is securely stored in your browser's `localStorage` and never sent anywhere except directly to GitHub's API.

## Built With
- HTML5, CSS3 (Vanilla, CSS Variables)
- Vanilla JavaScript (ES6 Modules)
- Chart.js (for graphs)
- Lucide Icons

## License
MIT License. Feel free to use and modify.
