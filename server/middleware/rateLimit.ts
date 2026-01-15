import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string; // Custom error message
}

export function createRateLimiter(options: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetTime: number }>();

  // Cleanup every minute to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    Array.from(hits.entries()).forEach(([ip, record]) => {
      if (now > record.resetTime) {
        hits.delete(ip);
      }
    });
  }, 60 * 1000);

  // Ensure interval is cleared if process exits (though in middleware it persists)
  if (typeof process !== 'undefined') {
    process.on('exit', () => clearInterval(cleanupInterval));
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const now = Date.now();

    let record = hits.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + options.windowMs };
      hits.set(ip, record);
    }

    record.count++;

    if (record.count > options.max) {
      return res.status(429).json({
        message: options.message || "Too many requests, please try again later."
      });
    }

    next();
  };
}
