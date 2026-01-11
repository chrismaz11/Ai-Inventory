import { type Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number;      // Max number of requests per window
  message?: string; // Optional custom error message
}

interface RateLimitStore {
  [key: string]: {
    hits: number;
    resetTime: number;
  };
}

export function rateLimit(options: RateLimitOptions) {
  const store: RateLimitStore = {};
  const cleanupInterval = 60000; // Cleanup every minute

  // Periodic cleanup to prevent memory leaks from stale IPs
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime <= now) {
        delete store[key];
      }
    }
  }, cleanupInterval);

  // Unref the timer so it doesn't prevent the process from exiting
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    // Use req.ip which Express correctly populates based on 'trust proxy' setting
    const key = req.ip || req.socket.remoteAddress || "unknown";

    if (!store[key] || store[key].resetTime <= now) {
      store[key] = {
        hits: 0,
        resetTime: now + options.windowMs,
      };
    }

    store[key].hits++;

    // Set standard rate limit headers
    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - store[key].hits));
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000));

    if (store[key].hits > options.max) {
      return res.status(429).json({
        message: options.message || "Too many requests, please try again later.",
      });
    }

    next();
  };
}
