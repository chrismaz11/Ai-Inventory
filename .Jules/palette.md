## 2024-05-23 - Replacing Native Dialogs
**Learning:** `window.confirm` provides a poor user experience as it blocks the main thread and cannot be styled. Replacing it with `AlertDialog` significantly improves perceived quality and prevents accidental dismissals.
**Action:** Always wrap destructive actions in a proper modal/dialog component instead of using native browser alerts.

## 2024-05-23 - Accessible Icon Buttons
**Learning:** Icon-only buttons are invisible to screen readers without `aria-label`. Adding tooltips improves usability for mouse users while `aria-label` handles accessibility.
**Action:** Enforce a pattern where every icon-only button must have both a `Tooltip` and an `aria-label`.
