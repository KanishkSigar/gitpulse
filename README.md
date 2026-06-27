# GitPulse

GitPulse is a client-side GitHub profile analytics tool. Enter any GitHub username and get a visual breakdown of their activity — contribution heatmaps, language usage, coding patterns, streaks, and top repositories.

**Live** — [kanishksigar.me/gitpulse](https://kanishksigar.me/gitpulse)

## How it works

Everything runs in the browser. GitPulse fetches data directly from the GitHub REST and GraphQL APIs, processes it client-side, and renders the dashboard. No backend, no database, no data stored.

## Features

- Contribution heatmap (requires a GitHub Personal Access Token)
- Current and longest streak tracking
- Language breakdown with Chart.js
- Coding patterns — preferred time of day and day of week
- Top repositories sorted by stars

## Personal Access Token

Some features (like the contribution heatmap) require a GitHub Personal Access Token with `read:user` scope. Click the settings icon in the header to add one. The token is stored in your browser's `localStorage` and is only sent to GitHub's API.

## Stack

- HTML, CSS, JavaScript (ES6 modules)
- Chart.js
- Lucide Icons

## License

MIT
