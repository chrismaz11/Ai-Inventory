## 2024-05-23 - [Sequential Photo Analysis Bottleneck]
**Learning:** The `/api/analyze-photos` endpoint was processing images sequentially using a `for...of` loop. With each OpenAI call taking significant time (e.g., ~500ms-2s), this caused linear latency scaling (10 images = ~5-20s). Parallelizing with `Promise.all` reduces total time to roughly the duration of the slowest single request.
**Action:** When handling batch operations involving external APIs (like OpenAI), always prefer `Promise.all` with individual error handling to maximize concurrency and robustness.
