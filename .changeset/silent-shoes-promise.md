---
"@headless-tree/core": patch
---

Improve rerendering behavior by skipping changes to the item loading state when items are already loading, and skipping changes to loading state in case of checkbox click propagation if items are loaded immediately (#173)
