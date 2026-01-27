## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2024-10-27 - Replace Native Confirm with Custom Dialogs
**Learning:** Native `window.confirm()` interrupts the user flow and cannot be styled or made fully accessible.
**Action:** Use `AlertDialog` from the component library for destructive actions to maintain visual consistency and accessibility.
