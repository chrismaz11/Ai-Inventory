## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2024-05-24 - Interactive Badges Must Be Buttons
**Learning:** Using `Badge` components (rendered as `div`) with `onClick` handlers creates inaccessible interactive elements that lack keyboard focus and activation support.
**Action:** For interactive tags or chips, use a `<button>` element and apply the badge styles (e.g., `badgeVariants()`) instead of using the `Badge` component directly.
