---
"@headless-tree/react": minor
"@headless-tree/core": minor
---

Fixed an issue async data loaders that resolve data before the tree is mounted can cause the tree to not render at all

Note: When using the `createTree()` API directly instead of going through the React `useTree` API, an additional call
to `tree.rebuildItems()` afterwards will be necessary. This change is marked as minor release regardless, since `createTree` is
currently not a publically documented feature.