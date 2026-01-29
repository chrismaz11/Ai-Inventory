## 2026-01-29 - Sequential AI Analysis Bottleneck
**Learning:** Sequential processing of independent heavy I/O operations (like OpenAI calls) scales linearly with input size, causing significant latency (e.g., 5s for 5 images vs 1s).
**Action:** Use `Promise.all` for independent operations, but ensure individual failures are handled gracefully (e.g., via internal try/catch) to prevent total batch failure.
