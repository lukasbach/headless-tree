---
"@headless-tree/core": minor
---

The anchor for shift-selecting (`item.selectUpTo()`) is now the last item that was clicked while not holding shift, or alternatively the focused item if that didn't exist. The previous behavior was always using the focused item as anchor, which doesn't match common multi-select behaviors in similar applications (#176)
