import { Request, Response, NextFunction } from "express";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  // Cleanup expired entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    }
  }, 60000).unref(); // unref so it doesn't keep the process alive

  return (req: Request, res: Response, next: NextFunction) => {
    // Use req.ip which works with 'trust proxy' setting, or fallback to remoteAddress
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    if (!store[ip] || store[ip].resetTime < now) {
      store[ip] = {
        count: 0,
        resetTime: now + options.windowMs,
      };
    }

    store[ip].count++;

    if (store[ip].count > options.max) {
      return res.status(429).json({
        message: options.message || "Too many requests, please try again later."
      });
    }

    next();
  };
}
