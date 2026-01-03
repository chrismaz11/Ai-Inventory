import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skip?: (req: Request) => boolean;
}

const ipRequests = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  // Clean up old entries periodically to prevent memory leak
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    // Convert entries to array to avoid downlevelIteration issue if needed,
    // or just rely on newer Node environment. But to be safe with TS config:
    Array.from(ipRequests.entries()).forEach(([ip, record]) => {
      if (now > record.resetTime) {
        ipRequests.delete(ip);
      }
    });
  }, 60000); // Clean up every minute

  // Ensure interval is cleared if needed (though difficult in middleware context,
  // usually fine for app lifecycle)
  if (typeof process !== 'undefined') {
      process.on('exit', () => clearInterval(cleanupInterval));
  }

  return (req: Request, res: Response, next: NextFunction) => {
    if (config.skip && config.skip(req)) {
      return next();
    }

    const ip = req.ip || (req.socket ? req.socket.remoteAddress : "unknown") || "unknown";
    const now = Date.now();

    let record = ipRequests.get(ip);

    // If no record or expired, create new one
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + config.windowMs };
      ipRequests.set(ip, record);
    }

    record.count++;

    // Set headers
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - record.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > config.max) {
      res.status(429).json({
        message: config.message || "Too many requests, please try again later."
      });
      return;
    }

    next();
  };
}
