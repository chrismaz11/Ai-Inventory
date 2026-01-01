import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Creates a rate limiting middleware.
 * Uses in-memory storage, suitable for single-instance deployments.
 */
export function rateLimit(config: RateLimitConfig) {
  const { windowMs, max, message = "Too many requests, please try again later." } = config;

  // Clean up expired entries every minute to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    // Use Array.from to avoid iteration issues with downlevel targets
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, record] of entries) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000).unref(); // Unref to not hold up the process exit

  return (req: Request, res: Response, next: NextFunction) => {
    // SECURITY NOTE: We use X-Forwarded-For if behind a proxy.
    // Ensure your reverse proxy (e.g. Nginx) is configured to strip/overwrite this header
    // from the client, otherwise it can be spoofed.
    // In Express, you should normally use app.set('trust proxy', 1) and req.ip.
    // Here we manually check headers to be explicit about what we trust.

    let ip = req.ip || 'unknown';

    // Simple check for X-Forwarded-For (take the first IP if multiple)
    // This is useful if the app is behind a proxy that sets this header.
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      if (typeof forwarded === 'string') {
        ip = forwarded.split(',')[0].trim();
      } else if (Array.isArray(forwarded)) {
        ip = forwarded[0];
      }
    }

    const key = `${ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = rateLimitStore.get(key)!;

    if (now > record.resetTime) {
      // Reset if window has passed
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
      if (record.count > max) {
        return res.status(429).json({ message });
      }
    }

    next();
  };
}
