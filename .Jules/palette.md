## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2024-05-24 - Missing ARIA on Custom Close Buttons
**Learning:** Custom close buttons implemented inside `DialogTitle` (distinct from `DialogClose`) often lack `aria-label`.
**Action:** When creating custom header actions, explicitly add `aria-label` to icon-only buttons.
