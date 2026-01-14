import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit } from '../middleware/rateLimit';
import { Request, Response, NextFunction } from 'express';

describe('Rate Limiter Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as any,
      headers: {},
      app: {
        get: vi.fn((key) => {
          if (key === 'trust proxy') return false;
          return undefined;
        })
      } as any
    };
    res = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      on: vi.fn(),
    };
    next = vi.fn();
  });

  it('should allow requests under the limit', async () => {
    req.ip = '10.0.0.1';
    await rateLimit(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it('should block requests over the limit', async () => {
    req.ip = '10.0.0.2';
    // Exhaust the limit
    for (let i = 0; i < 100; i++) {
      await rateLimit(req as Request, res as Response, vi.fn());
    }

    // 101st request
    await rateLimit(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(429);
  }, 10000);
});
