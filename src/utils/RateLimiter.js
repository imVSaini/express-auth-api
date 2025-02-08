class RateLimiter {
  constructor() {
    this.rateLimit = new Map()
  }

  /**
   * Determines if a request is allowed based on the rate limit.
   * @param {string} key - Unique identifier for the request (e.g., user ID, IP address).
   * @param {number} limit - Maximum number of allowed requests within the duration.
   * @param {number} duration - Time window in milliseconds for the rate limit.
   * @returns {boolean} - True if the request is allowed, false otherwise.
   */
  static isAllowed = (key, limit, duration) => {
    const now = Date.now()

    if (!this.instance) {
      this.instance = new RateLimiter()
    }

    if (!this.instance.rateLimit.has(key)) {
      this.instance.rateLimit.set(key, { count: 1, lastRequest: now })
      return true
    }

    const requestData = this.instance.rateLimit.get(key)
    if (now - requestData.lastRequest > duration) {
      this.instance.rateLimit.set(key, { count: 1, lastRequest: now })
      return true
    }

    if (requestData.count >= limit) return false // eslint-disable-line curly

    this.instance.rateLimit.set(key, {
      ...requestData,
      count: requestData.count + 1,
    })
    return true
  }
}

export { RateLimiter }
