# Palette's Journal - Critical UX/A11y Learnings

## 2025-02-18 - Invisible Interactive Elements
**Learning:** Elements that rely on `group-hover:opacity-100` are completely invisible to keyboard users who tab through the interface. This violates the "Perceivable" principle of WCAG.
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` (or `focus-visible:opacity-100`) on the interactive element itself to ensure keyboard users can see what they are focusing on.

## 2025-02-18 - Duplicate IDs in Conditional Rendering
**Learning:** Using `document.getElementById` to trigger hidden inputs is brittle, especially when the element with that ID is conditionally rendered or duplicated. This can lead to the wrong element being triggered or errors if the element isn't in the DOM yet.
**Action:** Use React `ref`s to control hidden inputs programmatically. It's more robust and avoids ID collisions.
