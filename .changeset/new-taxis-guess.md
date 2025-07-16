---
"@headless-tree/core": minor
---

add `canDragForeignDragObjectOver` to allow customizing whether a draggable visualization should be shown when dragging foreign data. This allows differentiating logic between drag-over and drop (via the existing `canDropForeignDataObject`), since for the latter `dataTransfer.getData` is not available by default in browsers.
