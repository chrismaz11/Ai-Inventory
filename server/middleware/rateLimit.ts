import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientData {
  count: number;
  resetTime: number;
}

const store = new Map<string, ClientData>();

// Cleanup interval to remove expired entries
setInterval(() => {
  const now = Date.now();
  Array.from(store.entries()).forEach(([ip, data]) => {
    if (now > data.resetTime) {
      store.delete(ip);
    }
  });
}, 60000); // Run every minute

export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let client = store.get(ip);

    if (!client || now > client.resetTime) {
      client = {
        count: 0,
        resetTime: now + config.windowMs,
      };
      store.set(ip, client);
    }

    client.count++;

    // Add RateLimit headers
    res.setHeader("X-RateLimit-Limit", config.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, config.max - client.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(client.resetTime / 1000));

    if (client.count > config.max) {
      return res.status(429).json({
        message: config.message || "Too many requests, please try again later.",
      });
    }

    next();
  };
}
