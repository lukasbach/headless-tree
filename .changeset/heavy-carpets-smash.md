---
"@headless-tree/react": minor
"@headless-tree/core": minor
---

all state updates (like setSelectedItems) will not propagate while the component is unmounted. This happened before for `tree.setState()` calls directly, but not individual state atoms like `setSelectedItems`. When calling `createTree()` directly (instead of `useTree()`), `tree.setMounted(true)` needs to be called once after mount. No changes are necessary when using the React-based `useTree()` integration. (#158)
