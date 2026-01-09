## 2025-05-24 - Rate Limiting on Sensitive Endpoints
**Vulnerability:** The `/api/analyze-photos` endpoint lacked rate limiting, exposing the system to Denial of Service (DoS) and potential financial resource exhaustion (OpenAI API costs).
**Learning:** Custom in-memory rate limiting can be implemented effectively without external dependencies for smaller applications, but care must be taken to handle cleanup to avoid memory leaks. Express middleware order is crucial; rate limiting must run *before* file upload processing to prevent resource exhaustion from large uploads.
**Prevention:** Always identify "expensive" or "sensitive" endpoints (AI calls, DB writes, Auth) and apply rate limiting middleware by default. Use a standard `middleware/rateLimit.ts` pattern.
