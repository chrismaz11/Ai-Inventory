## 2025-05-23 - Focus Opacity on Hidden Elements
**Learning:** Interactive elements hidden via opacity (like "remove" buttons on hover) must include `focus:opacity-100`. Without this, keyboard users can tab to the element but can't see it, leading to a confusing experience.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus:opacity-100` for interactive elements.
