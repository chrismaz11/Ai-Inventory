## 2024-05-22 - Memory vs Code Reality
**Learning:** The memory stated that `/api/analyze-photos` was already optimized with `Promise.all`, but the code clearly showed a sequential `for...of` loop.
**Action:** Always verify "known" optimizations in the actual code before assuming they exist. Documentation and memory can drift from reality.
