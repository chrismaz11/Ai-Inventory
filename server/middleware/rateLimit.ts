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

const store = new Map<string, RateLimitRecord>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  store.forEach((record, key) => {
    if (now > record.resetTime) {
      store.delete(key);
    }
  });
}, 60000);

export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Rely on Express's req.ip which handles proxy settings if configured
    const ip = req.ip || "unknown";
    const now = Date.now();

    let record = store.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      store.set(ip, record);
    }

    record.count++;

    res.setHeader("X-RateLimit-Limit", config.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, config.max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > config.max) {
      return res.status(429).json({
        message: config.message || "Too many requests, please try again later.",
      });
    }

    next();
  };
}
