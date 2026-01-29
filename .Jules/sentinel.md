## 2025-02-18 - [Fix Input Validation and Error Leakage]
**Vulnerability:** Missing validation for `parseInt` inputs allowed `NaN` to propagate to the database layer, and error handling leaked implementation details.
**Learning:** Even with ORMs, basic type validation at the API boundary is crucial for robustness and failsafe behavior. Systematic checking of all parsing logic is necessary.
**Prevention:** Always validate `parseInt` with `isNaN` immediately. Use generic error messages for 500 responses.
