---
"@headless-tree/core": patch
---

Fixed behavior where shift-selecting an item with no previously selected or focused item would multiselect all items from the top to the clicked item. Now, shift-selecting an item with no previously clicked items will only select the clicked item (#176)
