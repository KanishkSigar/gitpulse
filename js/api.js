// ============================================
// GitPulse — GitHub API Client
// ============================================

import { Cache } from './cache.js';

export const API = {
  REST_BASE: 'https://api.github.com',
  GRAPHQL_BASE: 'https://api.github.com/graphql',

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
    const url = new URL(`${this.REST_BASE}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const cacheKey = Cache.getKey(endpoint, params);
    const cached = Cache.get(cacheKey);
    if (cached) return cached;

    const response = await fetch(url, { headers: this.getHeaders() });
    
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
