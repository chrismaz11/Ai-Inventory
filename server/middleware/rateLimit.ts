import type { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of connections per windowMs
  message?: string; // Message to return when limit is reached
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

export function rateLimit(options: RateLimitOptions) {
  const hits = new Map<string, RateLimitStore>();
  const { windowMs, max, message = "Too many requests, please try again later." } = options;

  // Cleanup expired entries every minute to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    hits.forEach((value, key) => {
      if (now > value.resetTime) {
        hits.delete(key);
      }
    });
  }, 60 * 1000).unref(); // unref so it doesn't hold the process open

  return (req: Request, res: Response, next: NextFunction) => {
    // Use X-Forwarded-For header if behind proxy (standard in many deployments)
    // or fallback to remoteAddress.
    // Note: To securely use req.ip or X-Forwarded-For, app.set('trust proxy', 1) might be needed in main app.
    // For now we try to get the best identifier we can.
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";

    const now = Date.now();
    let record = hits.get(ip);

    // If no record or expired, create new
    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      };
      hits.set(ip, record);
    }

    // Increment
    record.count++;

    // Check limit
    if (record.count > max) {
      // Set Retry-After header
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({ message });
      return;
    }

    // Set RateLimit headers (optional but good practice)
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    next();
  };
}
