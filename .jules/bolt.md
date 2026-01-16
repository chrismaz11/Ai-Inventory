# Bolt's Journal - Critical Learnings

## 2024-05-23 - Database Query Parallelization
**Learning:** Sequential await calls in `getStats` add up latency unnecessarily.
**Action:** Use `Promise.all` for independent database queries to reduce total request time to the slowest query instead of the sum of all queries.
