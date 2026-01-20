## 2025-02-18 - [Parallelize Independent DB Queries]
**Learning:** Sequential execution of independent database queries in API endpoints (like getting counts and last activity) artificially inflates latency.
**Action:** Use `Promise.all` to run independent queries concurrently, reducing the total duration to the longest single query rather than the sum of all queries.
