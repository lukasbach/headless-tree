---
"@headless-tree/core": patch
---

Fix drag-and-drop reparent levels in right-to-left layouts: the drop position is now measured from the inline start of the row (the right edge in RTL) instead of always from the left edge. The new `isRtl` config option can be set on the tree feature to override the direction that is otherwise inferred from the computed style.
