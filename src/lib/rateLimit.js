/**
 * KAIROS — Rate Limiter
 * In-memory sliding window rate limiter.
 *
 * NOTE: In-memory only — resets on server restart.
 * For production multi-instance deployments, replace with
 * Upstash Redis rate limiting (@upstash/ratelimit).
 */

const store = new Map()

/**
 * Check if a key has exceeded the rate limit.
 * @param {string} key      - identifier (IP address or userId)
 * @param {number} limit    - max requests allowed in the window
 * @param {number} windowMs - time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function rateLimit(key, limit = 20, windowMs = 60_000) {
  const now = Date.now()

  if (!store.has(key)) {
    store.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, resetMs: now + windowMs }
  }

  const entry = store.get(key)

  // Window expired — reset
  if (now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: limit - 1, resetMs: now + windowMs }
  }

  // Within window — check limit
  if (entry.count >= limit) {
    return {
      allowed:   false,
      remaining: 0,
      resetMs:   entry.windowStart + windowMs,
    }
  }

  entry.count++
  return {
    allowed:   true,
    remaining: limit - entry.count,
    resetMs:   entry.windowStart + windowMs,
  }
}

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > 300_000) store.delete(key)
  }
}, 300_000)