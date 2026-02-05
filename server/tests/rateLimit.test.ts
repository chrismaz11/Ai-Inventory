import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRateLimiter } from "../middleware/rateLimit";
import { Request, Response, NextFunction } from "express";

describe("Rate Limiter Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      ip: "127.0.0.1",
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests within limit", () => {
    const limiter = createRateLimiter({
      windowMs: 1000,
      max: 2,
    });

    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);

    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("should block requests exceeding limit", () => {
    const limiter = createRateLimiter({
      windowMs: 1000,
      max: 2,
    });

    limiter(req as Request, res as Response, next);
    limiter(req as Request, res as Response, next);

    // Third request should be blocked
    limiter(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String),
    }));
  });

  it("should reset limit after window expires", () => {
    const limiter = createRateLimiter({
      windowMs: 1000,
      max: 1,
    });

    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Advance time past window
    vi.advanceTimersByTime(1100);

    limiter(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });
});
