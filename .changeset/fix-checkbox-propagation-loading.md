---
"@headless-tree/core": patch
---

Correct checkbox propagation loading state: report pending descendant loads, avoid loading updates for immediate changes, and retain loading state until overlapping operations finish. Implement the declared `isLoadingCheckPropagation()` item method.
