## 2026-01-03 - [HIGH] Add rate limiting to sensitive endpoint
**Vulnerability:** The `/api/analyze-photos` endpoint, which triggers expensive OpenAI API calls, was unprotected against high-volume requests (DoS/Billing exhaustion).
**Learning:** Custom in-memory rate limiting can be implemented without external dependencies like `express-rate-limit` when restrictions prevent adding new packages. It is important to apply limits *before* file upload middleware to save bandwidth.
**Prevention:** Always identify and rate-limit resource-intensive or cost-incurring endpoints.
