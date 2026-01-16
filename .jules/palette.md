## 2025-05-23 - Hidden Interactive Elements

**Learning:** Buttons that are visually hidden (e.g., `opacity-0 group-hover:opacity-100`) must have `focus:opacity-100` to be discoverable by keyboard users.

**Action:** Always test "hover-only" controls with keyboard navigation. If an element becomes visible on hover, it must also become visible on focus.
