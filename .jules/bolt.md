# Bolt's Performance Journal ⚡

## 2024-05-22 - [Parallel Database Queries]
**Learning:** Sequential `await` calls for independent database queries create unnecessary latency.
**Action:** Always use `Promise.all` for independent async operations to execute them concurrently.
