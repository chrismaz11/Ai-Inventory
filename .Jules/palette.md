## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2024-05-23 - Invisible Focusable Elements
**Learning:** Elements hidden with `opacity-0` (like "hover-to-reveal" actions) remain in the tab order but are invisible to keyboard users, causing confusion.
**Action:** Always add `focus:opacity-100` (or `focus-visible:opacity-100`) alongside `group-hover:opacity-100` to ensure the element becomes visible when it receives keyboard focus.
