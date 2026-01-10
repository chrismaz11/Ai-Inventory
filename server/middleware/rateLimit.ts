import { Request, Response, NextFunction } from "express";

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // 5 requests per window per IP

interface RateLimitData {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitData>();

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  ipMap.forEach((data, ip) => {
    if (now > data.resetTime) {
      ipMap.delete(ip);
    }
  });
}, WINDOW_MS);

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  // Use req.ip which works with 'trust proxy' setting
  const ip = req.ip || "unknown";
  const now = Date.now();

  let data = ipMap.get(ip);

  // Reset if window has passed
  if (!data || now > data.resetTime) {
    data = { count: 0, resetTime: now + WINDOW_MS };
    ipMap.set(ip, data);
  }

  data.count++;

  if (data.count > MAX_REQUESTS) {
    return res.status(429).json({
      message: "Too many requests. Please try again later."
    });
  }

  next();
}
