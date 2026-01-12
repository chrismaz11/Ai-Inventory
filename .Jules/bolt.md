# Bolt's Journal

## 2024-05-23 - Database Indexing
**Learning:** Drizzle ORM's `index()` function is the correct way to add indices to schema definitions, but they must be applied at the table level.
**Action:** When adding foreign keys that are frequently joined (like `storageUnitId`), always add an index to improve join performance.

## 2024-05-23 - Code Splitting
**Learning:** `React.lazy` is effective for splitting heavy route components, but it requires `Suspense` to handle the loading state, otherwise it will crash the app.
**Action:** Always wrap lazy-loaded components in `Suspense` with a fallback UI.
