---
"@headless-tree/core": patch
---

fixed an issue where async data loaders cause calling `item.getItemData()` outside of the component calling `useTree()` to cause a React warning log (#158)
