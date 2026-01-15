## 2024-05-23 - Accessible File Drop Zones
**Learning:** File drop zones implemented as `div`s with `onClick` are inaccessible to keyboard users.
**Action:** Always wrap drop zones in a `<button type="button">` or use a `<label>` linked to the file input. Ensure visual styles (like `w-full`) are maintained when changing tags.

## 2024-05-24 - React Ref over DOM ID
**Learning:** Using `document.getElementById` for file inputs often leads to duplicate ID issues in conditional rendering, breaking accessibility and functionality.
**Action:** Use `useRef` to reference hidden inputs. This guarantees unique access and robust event handling regardless of DOM structure.
