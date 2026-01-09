## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2025-05-15 - Misleading Interactive Elements
**Learning:** List items styled with `cursor-pointer` and hover effects that do not perform an action frustrate users and create false affordances.
**Action:** Ensure all interactive-looking elements are actually interactive (buttons/links) and keyboard accessible. If an element is purely informational, remove pointer cursors and hover effects. Convert "fake" list items into real `<button>` elements to improve both UX and accessibility simultaneously.
