import type { Request, Response, NextFunction } from "express";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequests = new Map<string, RateLimitRecord>();

// Cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  ipRequests.forEach((record, ip) => {
    if (now > record.resetTime) {
      ipRequests.delete(ip);
    }
  });
}, 5 * 60 * 1000);

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) {
    return next();
  }

  const ip = req.ip || "unknown";
  const now = Date.now();

  let record = ipRequests.get(ip);

  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + WINDOW_MS };
    ipRequests.set(ip, record);
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    res.setHeader("Retry-After", Math.ceil((record.resetTime - now) / 1000));
    return res.status(429).json({ message: "Too many requests, please try again later." });
  }

  next();
}
