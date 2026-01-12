
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit } from './rateLimit';
import { Request, Response, NextFunction } from 'express';

describe('rateLimit middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      ip: '127.0.0.1',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    // Reset the internal store if possible, or just use different IPs for each test
    // Since we can't easily reset the private store module variable, we'll use unique IPs
  });

  it('should allow requests under the limit', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 2 });
    const uniqueIp = '1.1.1.1';
    req.ip = uniqueIp;

    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();

    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('should block requests over the limit', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 1 });
    const uniqueIp = '2.2.2.2';
    req.ip = uniqueIp;

    // First request - ok
    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();

    // Second request - blocked
    limiter(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Too many requests, please try again later."
    }));
  });

  it('should reset after windowMs', async () => {
    const limiter = rateLimit({ windowMs: 100, max: 1 });
    const uniqueIp = '3.3.3.3';
    req.ip = uniqueIp;

    // First request - ok
    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();

    // Wait for window to pass
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should pass again
    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });
});
