// ============================================
// GitPulse — Cache (localStorage with TTL)
// ============================================

/**
 * GitPulse - Caching Module
 * Handles localStorage caching with TTL (Time To Live)
 */

export const Cache = {
  // Default TTL: 1 hour (in milliseconds)
  DEFAULT_TTL: 60 * 60 * 1000,

  /**
   * Generates a cache key for a given request
   */
  getKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}=${params[k]}`)
      .join('&');
    return `gitpulse_${endpoint}${sortedParams ? '?' + sortedParams : ''}`;
  },

  /**
   * Stores data in the cache with a TTL
   */
  set(key, data, ttl = this.DEFAULT_TTL) {
    try {
      const record = {
        value: data,
        timestamp: Date.now(),
        ttl: ttl
      };
      localStorage.setItem(key, JSON.stringify(record));
    } catch (e) {
      console.warn('Cache write failed, localStorage might be full.', e);
      // If quota exceeded, we could clear old items here, but keeping it simple for now
    }
  },

  /**
   * Retrieves data from the cache if it hasn't expired
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const record = JSON.parse(item);
      if (!record || !record.timestamp || !record.ttl) return null;

      // Check if expired
      if (Date.now() - record.timestamp > record.ttl) {
        this.remove(key);
        return null;
      }

      return record.value;
    } catch (e) {
      console.warn('Cache read failed.', e);
      return null;
    }
  },

  /**
   * Removes a specific key from the cache
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clears all gitpulse related cache
   */
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('gitpulse_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
