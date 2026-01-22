## 2025-02-18 - Express Input Validation Pattern
**Vulnerability:** Use of `parseInt` on `req.params.id` without validation can result in `NaN`, leading to potential database errors or unexpected behavior.
**Learning:** `parseInt` returns `NaN` for invalid input, which propagates to logic.
**Prevention:** Always validate `parseInt` output: `const id = parseInt(req.params.id); if (isNaN(id) || id < 1) ...`
