# Sentinel's Journal

## 2024-05-24 - [Initial Journal Creation]
**Vulnerability:** N/A
**Learning:** Initialized the Sentinel journal to track critical security learnings.
**Prevention:** N/A

## 2024-05-24 - [Input Validation for Numeric IDs]
**Vulnerability:** `parseInt` was used on request parameters without checking for `NaN`. While Drizzle/Postgres might handle this by throwing an error, passing `NaN` to the database layer is risky and can lead to unexpected behavior or cryptic 500 errors.
**Learning:** Always validate the result of `parseInt` with `isNaN` before using it. This ensures that only valid integers reach the business logic and database layers.
**Prevention:** Implement a consistent check `if (isNaN(id)) return res.status(400)...` immediately after parsing integer parameters.
