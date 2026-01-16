## 2024-05-22 - Missing Rate Limiting & Proxy Trust
**Vulnerability:** API endpoints were completely unprotected from rate limiting, and `trust proxy` was disabled despite potential proxy deployment.
**Learning:** Even if documentation or memory suggests security controls exist, verification (code review) is essential. Express default behavior regarding `req.ip` is unsafe behind proxies without `trust proxy`.
**Prevention:** Always verify `app.set('trust proxy', 1)` in Express apps and implement at least basic in-memory rate limiting for APIs.
