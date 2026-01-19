## 2024-05-23 - Sequential Database Queries
**Learning:** Found multiple independent database queries running sequentially in `getStats`. This is a common pattern in dashboard-like data fetching where multiple counts or aggregates are needed.
**Action:** Always check for `await` loops or sequences of independent `await` calls in data fetching methods and verify if they can be parallelized with `Promise.all`.
