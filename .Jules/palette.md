## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2026-01-25 - Native Confirm Dialogs
**Learning:** Native `window.confirm()` dialogs are blocking and cannot be styled or made fully accessible (e.g., custom labels).
**Action:** Replace `confirm()` with the `AlertDialog` component for destructive actions, ensuring the trigger button has an `aria-label` if it is icon-only.
