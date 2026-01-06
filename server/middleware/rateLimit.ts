import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

export function rateLimit(options: { windowMs: number; max: number }) {
  const store = new Map<string, RateLimitStore>();

  // Clear expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    store.forEach((value, key) => {
      if (now > value.resetTime) {
        store.delete(key);
      }
    });
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP address
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    // In production with a reverse proxy (like on Replit), we should trust x-forwarded-for
    // Express 'trust proxy' setting handles this if configured, but req.ip is the safest bet
    // if 'trust proxy' is not set, req.ip is effectively req.socket.remoteAddress

    const now = Date.now();

    // Get or initialize record
    let record = store.get(ip);

    // If record doesn't exist or window has passed
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + options.windowMs
      };
      store.set(ip, record);
    }

    // Check limit
    if (record.count >= options.max) {
      return res.status(429).json({
        message: "Too many requests, please try again later."
      });
    }

    // Increment count
    record.count++;
    next();
  };
}
