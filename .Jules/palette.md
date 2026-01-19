## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2025-02-18 - Interactive Badges
**Learning:** The `Badge` component renders a `div`, making it inaccessible for interactive elements like search filters or tags.
**Action:** For interactive badges, use a `<button>` element and apply `badgeVariants({ variant: "..." })` combined with `cn()` instead of using the `<Badge>` component directly.
