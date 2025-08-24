---
"@headless-tree/core": patch
---

triggering a data refetch will now always set the loadingItemData/loadingItemChildrens state variable to the associated items if they where not apart of the cache before
