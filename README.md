# GitPulse

GitPulse is a client-side GitHub profile analytics dashboard. Enter any GitHub username and get a visual breakdown of that person's activity: a contribution heatmap, language usage, coding patterns, streaks, pinned repositories, and more. You can also compare two users side by side and export the dashboard as an image.

**Live:** [kanishksigar.me/gitpulse](https://kanishksigar.me/gitpulse)

## How it works

Everything runs in the browser. GitPulse fetches data directly from the GitHub REST and GraphQL APIs, processes it client-side, and renders the dashboard. There is no database and nothing is stored on a server. The only state that ever leaves your machine is the API request to GitHub itself.

There is also an optional C++ proxy (in the [`server/`](server/) folder) you can deploy so that visitors get the full experience, including contribution heatmaps, without needing a token of their own. See [Optional C++ proxy](#optional-c-proxy) below.

## Features

### Contribution heatmap
A full year calendar of contribution activity, colored by intensity, in the same style as the graph on a GitHub profile. This data comes from GitHub's GraphQL API, which requires authentication, so the heatmap needs either a Personal Access Token or the proxy to be configured. When neither is present, the card shows a friendly prompt instead of failing.

### Streaks
Current streak and longest streak, calculated from the contribution calendar. Like the heatmap, this relies on the GraphQL contribution data.

### Language breakdown
A doughnut chart (Chart.js) showing the languages a user writes most, aggregated across their public repositories. Each language is colored with its real GitHub Linguist color, so JavaScript is yellow, Python is blue, C++ is pink, and so on. Languages not in the built in map get a stable fallback color derived from the name, so the chart never shows two unrelated languages in the same shade by accident. A matching legend lists each language with its percentage.

### Coding patterns
Two small charts derived from a user's recent public events: the time of day they tend to be active and the days of the week they push most. This gives a quick sense of someone's working rhythm.

### Pinned repositories
The repositories the user has pinned to their profile, shown in the order they chose, fetched through the GitHub GraphQL API. Pinned data requires the proxy or a Personal Access Token. When neither is available, the section falls back to the user's top repositories sorted by star count, and the heading updates to reflect which set you are looking at. Each card shows the repository name (the name links to GitHub), description, primary language with its Linguist color dot, star count, fork count, and last updated date.

### Compare two users
A dedicated compare view that puts two profiles next to each other. Click the compare icon in the header, enter two usernames, and GitPulse shows a side by side breakdown of followers, following, public repositories, total stars across all repositories, total forks, account age, and top language. The higher value in each numeric row is highlighted so you can see who leads at a glance. The comparison is shareable through a `?compare=user1,user2` URL, and the browser back and forward buttons work as expected.

### Themes
Five color themes selectable from the palette icon in the header: Lavender (default), Indigo, Green, Amber Dusk, and a Light paper theme. Your choice is saved to `localStorage` and applied before the first paint, so there is no flash of the wrong theme on reload. Charts, the heatmap palette, and every accent update to match the active theme.

### Export as image
A download button on the dashboard captures the entire dashboard as a single PNG using html2canvas. The exported image uses the current theme's background, so a light theme export has a light background and a dark theme export has a dark one. The file is named after the username you are viewing.

### Linked social accounts
The profile card shows the social accounts a user has linked on GitHub (X/Twitter, LinkedIn, YouTube, Mastodon, Bluesky, Instagram, and others) as clickable chips with their brand icons. Because Lucide no longer ships brand logos, these icons are inlined as SVG so they always render.

### Smooth single page experience
GitPulse behaves like a single page app. Searching a user updates the URL without a reload, the landing page and dashboard swap cleanly, the browser back button returns you to the landing page, and dashboard cards fade in with a subtle stagger. All motion respects the `prefers-reduced-motion` setting.

## Personal Access Token

Some features (the contribution heatmap, streaks, and pinned repositories in direct mode) use GitHub APIs that require authentication. To unlock them, click the key icon in the header and paste a GitHub Personal Access Token with the `read:user` scope.

The token is stored only in your browser's `localStorage`. It is sent only to GitHub's own API and never to any other server. You can clear it at any time from the same panel.

A token also raises your rate limit. Unauthenticated GitHub REST requests are capped at 60 per hour per IP, while an authenticated token gives you a much higher budget.

If you would rather not ask visitors for a token at all, deploy the proxy described below.

## Optional C++ proxy

The [`server/`](server/) folder contains a small C++17 service (built on cpp-httplib) that fronts the GitHub API. It holds one server-side token so that every visitor gets the full experience, heatmaps included, without supplying a token of their own. It caches responses for five minutes per path and rate limits each client IP, so the token's budget cannot be drained.

It exposes a REST passthrough at `/api/gh/<path>`, the contribution calendar at `/api/contributions/<username>`, pinned repositories at `/api/pinned/<username>`, and a `/healthz` liveness check.

To enable it, deploy the proxy and set `PROXY_BASE` at the top of [`js/api.js`](js/api.js) to its public URL. When `PROXY_BASE` is set, GitPulse routes all GitHub calls through the proxy and no visitor needs a token. Leave it empty and the app falls back to direct GitHub calls with the optional per-user token. Full build and run instructions are in [`server/README.md`](server/README.md).

## Running locally

GitPulse is static, so any static file server works. For example, with PHP:

```bash
php -S localhost:8000
```

Or with Python:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser. No build step is required.

## Project structure

```
gitpulse/
  index.html          Markup and layout for the landing, dashboard, and compare views
  css/                Styles (variables, base, components, layout, heatmap, themes, responsive)
  js/
    app.js            App entry point, routing, view switching, event wiring
    api.js            GitHub REST and GraphQL client (and proxy routing)
    cache.js          Lightweight localStorage response cache
    ui.js             Profile card and shared UI rendering
    stats.js          Streak calculations
    heatmap.js        Contribution heatmap rendering
    charts.js         Language doughnut chart
    patterns.js       Coding pattern charts
    repos.js          Repository cards (pinned or top by stars)
    compare.js        Two user comparison view
    langColors.js     Shared GitHub Linguist color map
  server/             Optional C++ proxy (Docker ready)
```

## Stack

- HTML, CSS, and JavaScript (ES6 modules), no framework
- Chart.js for charts
- Lucide for icons
- html2canvas for image export
- Optional C++17 proxy built on cpp-httplib and OpenSSL

## License

MIT
