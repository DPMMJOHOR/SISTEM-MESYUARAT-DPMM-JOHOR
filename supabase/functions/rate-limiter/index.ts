// Token bucket rate limiter for Supabase Edge Functions
// This can be imported and used in other Edge Functions

interface TokenBucket {
  tokens: number
  lastRefill: number
}

const buckets = new Map<string, TokenBucket>()

interface RateLimitConfig {
  maxTokens: number
  refillRate: number // tokens per second
  windowMs: number // time window in milliseconds
}

export const rateLimitConfig: Record<string, RateLimitConfig> = {
  'authenticate': { maxTokens: 5, refillRate: 0.1, windowMs: 60000 }, // 5 requests per minute
  'create-meeting': { maxTokens: 10, refillRate: 0.2, windowMs: 60000 }, // 10 requests per minute
  'update-attendance': { maxTokens: 20, refillRate: 0.5, windowMs: 60000 }, // 20 requests per minute
  'whatsapp-blast': { maxTokens: 5, refillRate: 0.1, windowMs: 60000 }, // 5 requests per minute
}

export function checkRateLimit(identifier: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const bucket = buckets.get(identifier) || { tokens: config.maxTokens, lastRefill: now }
  
  // Refill tokens based on time elapsed
  const timeElapsed = (now - bucket.lastRefill) / 1000 // in seconds
  const tokensToAdd = Math.floor(timeElapsed * config.refillRate)
  
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(config.maxTokens, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
  }
  
  // Check if request is allowed
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1
    buckets.set(identifier, bucket)
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetTime: now + (config.maxTokens - bucket.tokens) / config.refillRate * 1000
    }
  }
  
  return {
    allowed: false,
    remaining: 0,
    resetTime: now + (1 / config.refillRate) * 1000
  }
}

export function getRateLimitHeaders(result: { allowed: boolean; remaining: number; resetTime: number }) {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }
}

// Clean up old buckets periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  const cutoff = now - 3600000 // 1 hour
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.lastRefill < cutoff) {
      buckets.delete(key)
    }
  }
}, 300000) // Run every 5 minutes
