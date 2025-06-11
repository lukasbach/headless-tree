---
"@headless-tree/core": patch
---

Added a `item.getKey()` utility method to use for generating React keys. For now, this just returns the item id, so no migration is needed from using `item.getId()` as React keys.
