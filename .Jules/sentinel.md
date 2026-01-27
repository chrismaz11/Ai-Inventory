# Sentinel's Security Journal

## 2025-02-19 - [Input Validation for Integer Parameters]
**Vulnerability:** The application was using `parseInt` to parse request parameters (IDs, limits) without checking if the result was a valid number (`NaN`). This allowed invalid data to propagate to the database layer, potentially causing unpredictable behavior or unnecessary database errors.
**Learning:** `parseInt` in JavaScript returns `NaN` for invalid input, but `NaN` behaves unexpectedly in many contexts (e.g., comparisons, SQL bindings). Relying on implicit conversion or database errors is unsafe.
**Prevention:** Always wrap `parseInt` calls with `isNaN` checks immediately after parsing. Return a 400 Bad Request if the input is invalid, ensuring clean boundaries between the API and the data layer.
