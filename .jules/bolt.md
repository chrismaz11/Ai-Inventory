## 2024-05-22 - Sequential Database Queries
**Learning:** The application was running independent dashboard statistics queries sequentially, increasing load time linearly with the number of metrics.
**Action:** Use `Promise.all` for independent read-only database operations to run them concurrently.
