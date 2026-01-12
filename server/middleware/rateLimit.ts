import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const ip in store) {
    if (store[ip].resetTime <= now) {
      delete store[ip];
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use req.ip which is reliable with app.set('trust proxy', 1)
    const ip = req.ip || "unknown";
    const now = Date.now();

    if (!store[ip]) {
      store[ip] = {
        count: 0,
        resetTime: now + options.windowMs,
      };
    }

    // Reset if window has passed
    if (now > store[ip].resetTime) {
      store[ip].count = 0;
      store[ip].resetTime = now + options.windowMs;
    }

    store[ip].count++;

    if (store[ip].count > options.max) {
      return res.status(429).json({
        message: options.message || "Too many requests, please try again later.",
      });
    }

    next();
  };
}
