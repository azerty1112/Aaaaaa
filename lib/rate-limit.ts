import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let rateLimiter: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    if (!rateLimiter) {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      // عدد الطلبات والنافذة من الإعدادات؟ سنستخدم قيم افتراضية
      rateLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
      });
    }
    return rateLimiter;
  }
  return null;
}

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const limiter = getRateLimiter();
  if (!limiter) return true; // rate limiting معطل
  const { success } = await limiter.limit(identifier);
  return success;
}
