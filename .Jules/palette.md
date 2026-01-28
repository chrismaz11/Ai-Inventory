## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2024-05-24 - Interactive Badges vs Buttons
**Learning:** Interactive elements styled as "badges" (using `Badge` component) are often implemented as `div`s, lacking keyboard accessibility (focus/Enter).
**Action:** Replace interactive `Badge` components with `<button>` elements applying `badgeVariants`. This maintains the visual style while ensuring full accessibility.
