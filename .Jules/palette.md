## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2026-01-04 - Icon-Only Buttons require ARIA labels
**Learning:** Icon-only buttons (like "Close" X icons) are invisible to screen readers without labels.
**Action:** Always add `aria-label` to buttons that contain only icons.
