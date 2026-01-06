## 2024-05-23 - Rate Limiting Missing on Expensive Endpoints
**Vulnerability:** The `/api/analyze-photos` endpoint calls the OpenAI API, which incurs monetary costs. There was no rate limiting in place, allowing a potential attacker to drain the project's budget or cause a Denial of Service by looping requests to this endpoint.
**Learning:** Even internal-facing or "low traffic" apps need basic protections on resource-intensive endpoints. "Security theater" does not apply to budget protection.
**Prevention:** Always identify "expensive" operations (monetary or computational) and apply strict rate limits to them by default. I implemented a simple in-memory rate limiter to mitigate this without adding external dependencies.
