## 2024-05-22 - [Missing Integer Validation Pattern]
**Vulnerability:** Multiple API endpoints parsed integer IDs using `parseInt()` without checking for `NaN` before passing them to the database layer.
**Learning:** `parseInt()` returns `NaN` for invalid input (e.g. "abc"), which is of type `number` in TypeScript but causes unexpected behavior or errors in SQL queries or logic.
**Prevention:** Always wrap `parseInt()` results with `if (isNaN(id)) { ... }` validation logic immediately after parsing and return a 400 error if invalid.
