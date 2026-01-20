import { Request, Response, NextFunction } from "express";

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const ipRequests = new Map<string, { count: number; resetTime: number }>();

// Cleanup interval to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  ipRequests.forEach((record, ip) => {
    if (now > record.resetTime) {
      ipRequests.delete(ip);
    }
  });
}, WINDOW_MS);

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  let record = ipRequests.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({ message: "Too many requests, please try again later." });
  }

  record.count++;
  ipRequests.set(ip, record);
  next();
}
