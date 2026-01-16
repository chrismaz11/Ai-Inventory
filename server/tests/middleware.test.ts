import { rateLimiter } from "../middleware/limiter";
import { Request, Response, NextFunction } from "express";
import { describe, it, expect, vi } from "vitest";

function mockRequest(ip: string, path: string): Request {
  return {
    ip,
    path,
  } as unknown as Request;
}

function mockResponse(): Response {
  const res: any = {};
  res.statusCode = 200;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    res.body = body;
    return res;
  };
  res.setHeader = (name: string, value: string) => {
    if (!res.headers) res.headers = {};
    res.headers[name] = value;
  };
  return res as Response;
}

describe("Rate Limiter Middleware", () => {
  it("should allow requests under the limit", () => {
    const req = mockRequest("1.1.1.1", "/api/test");
    const res = mockResponse();
    const next = vi.fn();

    rateLimiter(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((res as any).statusCode).not.toBe(429);
  });

  it("should block requests over the limit", () => {
    const ip = "2.2.2.2";
    const next = vi.fn();

    // Send 100 requests (MAX_REQUESTS)
    for (let i = 0; i < 100; i++) {
        const req = mockRequest(ip, "/api/test");
        const res = mockResponse();
        rateLimiter(req, res, next);
    }

    expect(next).toHaveBeenCalledTimes(100);

    // The 101st request should be blocked
    const req = mockRequest(ip, "/api/test");
    const res = mockResponse();
    const nextBlocked = vi.fn();

    rateLimiter(req, res, nextBlocked);

    expect(nextBlocked).not.toHaveBeenCalled();
    expect((res as any).statusCode).toBe(429);
    expect((res as any).body.message).toContain("Too many requests");
  });

  it("should ignore non-api routes", () => {
     const req = mockRequest("3.3.3.3", "/index.html");
     const res = mockResponse();
     const next = vi.fn();

     rateLimiter(req, res, next);

     expect(next).toHaveBeenCalled();
  });
});
