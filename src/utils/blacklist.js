import NodeCache from 'node-cache'

class Blacklist {
  constructor() {
    // Initialize the cache with a default TTL of 7 days (604800 seconds)
    this.cache = new NodeCache({ stdTTL: 604800 })
  }

  add(token) {
    this.cache.set(token, true)
  }

  isBlacklisted(token) {
    return this.cache.has(token)
  }
}

export { Blacklist }
