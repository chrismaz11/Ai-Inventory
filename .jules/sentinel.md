## 2024-05-23 - [Rate Limiting Sensitive Endpoints]
**Vulnerability:** The `/api/analyze-photos` endpoint calls the OpenAI API without any rate limiting. This exposes the application to Denial of Service (DoS) attacks and potential financial exhaustion due to API costs.
**Learning:** Even internal or "demo" apps need protection on expensive endpoints. Middleware-based rate limiting is a simple, effective first line of defense.
**Prevention:** I implemented a custom in-memory rate limiter middleware and applied it to the sensitive endpoint. Future improvements could include using a distributed store (like Redis) for rate limiting in multi-instance environments.
