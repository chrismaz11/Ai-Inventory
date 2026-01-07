import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number;      // Max requests per window
  message?: string; // Optional custom message
}

interface ClientData {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: In a distributed environment (multiple server instances),
// this should be replaced with a shared store like Redis.
const ipRequestCounts = new Map<string, ClientData>();

// Clean up expired entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  ipRequestCounts.forEach((data, ip) => {
    if (now > data.resetTime) {
      ipRequestCounts.delete(ip);
    }
  });
}, 10 * 60 * 1000);

export function rateLimit(config: RateLimitConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get IP address - relies on 'trust proxy' setting if behind a proxy
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let clientData = ipRequestCounts.get(ip);

    // If no data or window expired, reset
    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 0,
        resetTime: now + config.windowMs,
      };
    }

    // Check if limit exceeded
    if (clientData.count >= config.max) {
      const resetTimeDate = new Date(clientData.resetTime);
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

      return res.status(429).json({
        message: config.message || "Too many requests, please try again later.",
      });
    }

    // Increment count
    clientData.count++;
    ipRequestCounts.set(ip, clientData);

    // Set headers
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', config.max - clientData.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));

    next();
  };
}
