// ============================================
// GitPulse — GitHub API Client
// ============================================

import { Cache } from './cache.js';

// Set this to your deployed C++ proxy URL (see server/) to give EVERY visitor
// full features (incl. contribution heatmaps) with no Personal Access Token.
// Leave it empty to call GitHub directly (uses the optional per-user PAT).
const PROXY_BASE = '';

export const API = {
  REST_BASE: 'https://api.github.com',
  GRAPHQL_BASE: 'https://api.github.com/graphql',
  PROXY_BASE,

  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    const pat = localStorage.getItem('gitpulse_pat');
    if (pat) {
      headers['Authorization'] = `token ${pat}`;
    }
    return headers;
  },

  async fetchRest(endpoint, params = {}) {
    const cacheKey = Cache.getKey(endpoint, params);
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    const qs = new URLSearchParams(params).toString();
    const ghPath = endpoint + (qs ? `?${qs}` : '');

    // Proxy mode: the server injects the token; no client headers needed.
    const url = PROXY_BASE ? `${PROXY_BASE}/api/gh${ghPath}` : `${this.REST_BASE}${ghPath}`;
    const response = await fetch(url, { headers: PROXY_BASE ? {} : this.getHeaders() });

    if (!response.ok) {
      if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
        throw new Error('API rate limit exceeded. Please add a Personal Access Token (PAT) via the top right corner.');
      }
      if (response.status === 404) {
        throw new Error('User not found.');
      }
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }

    const data = await response.json();
    Cache.set(cacheKey, data);
    return data;
  },

  async fetchGraphQL(query, variables = {}) {
    // Requires PAT
    const pat = localStorage.getItem('gitpulse_pat');
    if (!pat) {
      throw new Error('A Personal Access Token (PAT) is required for deep analytics (contribution heatmap). Add it in the top right corner.');
    }

    // Creating a simple hash of query + variables for caching
    const queryHash = query.replace(/\s+/g, '').substring(0, 50);
    const cacheKey = Cache.getKey('graphql_' + queryHash, variables);
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    const response = await fetch(this.GRAPHQL_BASE, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`GitHub GraphQL Error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    Cache.set(cacheKey, data.data);
    return data.data;
  },

  async getUser(username) {
    return this.fetchRest(`/users/${username}`);
  },

  async getRepos(username) {
    // Fetch up to 100 repos, sorted by pushed
    return this.fetchRest(`/users/${username}/repos`, { per_page: 100, sort: 'pushed', direction: 'desc' });
  },

  async getEvents(username) {
    // Fetch recent events for coding patterns (time of day analysis)
    return this.fetchRest(`/users/${username}/events/public`, { per_page: 100 });
  },

  async getContributions(username) {
    // Proxy mode: no PAT needed — the server holds the token.
    if (PROXY_BASE) {
      const cacheKey = Cache.getKey('contrib', { username });
      const cached = Cache.get(cacheKey);
      if (cached) return cached;
      const r = await fetch(`${PROXY_BASE}/api/contributions/${encodeURIComponent(username)}`);
      if (!r.ok) throw new Error('Could not load contribution data from the proxy.');
      const j = await r.json();
      if (j.errors) throw new Error(j.errors[0].message);
      const data = j.data;
      Cache.set(cacheKey, data);
      return data;
    }

    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `;
    return this.fetchGraphQL(query, { username });
  }
};
