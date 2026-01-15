# Sentinel Journal

## 2024-05-24 - Rate Limiting Missing on API Routes
**Vulnerability:** The API routes under `/api/*` lack rate limiting, exposing them to Denial of Service (DoS) and brute force attacks.
**Learning:** Rate limiting was implemented using a custom middleware, but standard libraries like `express-rate-limit` are more robust.
**Prevention:** Apply rate limiting middleware to all public-facing API routes, especially resource-intensive ones like `/api/analyze-photos`.

## 2024-05-24 - Rate Limiting Implementation Details
**Vulnerability:** The application server is behind a proxy (likely in the deployed environment), so `req.ip` might not be accurate without `app.set('trust proxy', 1)`.
**Learning:** When using rate limiting or IP blocking, always configure trust proxy settings correctly.
**Prevention:** Ensure `app.set('trust proxy', 1)` is set in Express when running behind a proxy.
