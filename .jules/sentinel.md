# Sentinel Journal

## 2024-05-24 - Initial Setup
**Status:** Initialized security tracking.
**Mission:** Protect the codebase from vulnerabilities and security risks.

## 2024-05-24 - Input Validation - Integer Parsing
**Vulnerability:** `parseInt` used without `isNaN` check on route parameters.
**Learning:** `parseInt("abc")` returns `NaN`, which propagates to DB queries if unchecked, potentially causing unexpected DB behavior or generic 500 errors.
**Prevention:** Always wrap `parseInt` with `isNaN` check or use a schema validator like Zod for route params.
