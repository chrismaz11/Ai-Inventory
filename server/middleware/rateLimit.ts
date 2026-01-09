import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

const ipStore = new Map<string, ClientRecord>();

export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    // Clean up expired entries periodically (optimization to prevent memory leaks)
    // In a real production environment, use Redis or similar
    if (Math.random() < 0.01) { // 1% chance to clean up on request
        ipStore.forEach((record, key) => {
            if (record.resetTime <= now) {
                ipStore.delete(key);
            }
        });
    }

    const record = ipStore.get(ip);

    if (!record || record.resetTime <= now) {
      ipStore.set(ip, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return next();
    }

    if (record.count >= config.max) {
      return res.status(429).json({
        message: config.message || "Too many requests, please try again later.",
      });
    }

    record.count += 1;
    return next();
  };
}
