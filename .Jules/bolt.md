## 2026-01-26 - Sequential External API Calls
**Learning:** Found sequential processing of OpenAI API calls in a loop for photo analysis. This causes linear latency scaling (O(n)) with the number of photos.
**Action:** Always use `Promise.all` for independent external API calls to parallelize them, reducing total latency to `max(t_request)` instead of `sum(t_requests)`.
