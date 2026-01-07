---
"@headless-tree/core": patch
---

Fixed an issue where `canDropForeignDragObject` was being called in `onDragOver` events without payload. `canDropForeignDragObject` should never be called in `onDragOver` events since there, browsers do not allow access to the data transfer payload. Now, `canDropForeignDragObject` is only called in onDrop events, and `canDragForeignDragObjectOver` is always called in `onDragOver` events.
