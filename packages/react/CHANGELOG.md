# @headless-tree/react

## 1.5.1

## 1.5.0

### Minor Changes

- cbeaba6: all state updates (like setSelectedItems) will not propagate while the component is unmounted. This happened before for `tree.setState()` calls directly, but not individual state atoms like `setSelectedItems`. When calling `createTree()` directly (instead of `useTree()`), `tree.setMounted(true)` needs to be called once after mount. No changes are necessary when using the React-based `useTree()` integration. (#158)

### Patch Changes

- 72e714b: all NPM deployments will now publish with provenance
- 7a7424f: fixed incorrect exports definition in package.json for require/cjs imports (#161)

### Sponsorship appreciation

Thanks for [Docmost](https://docmost.com/), who have supported the development of Headless Tree with a sponsor contribution. Docmost is a wiki-software that can be self-hosted or used in cloud. Thank you!

## 1.4.0

## 1.3.0

### Patch Changes

- 32e71e9: Added optional @headless-tree/react/react17 import for useTree for compatibility
- 662e2a8: Improved customizability of checkboxes feature (still alpha state), allowing you to customize `propagateCheckedState` and `canCheckFolders` independently
- 662e2a8: Changed to new buildtool in core packages (now using tsup) to hopefully fix some ESM/CJS integrations

## 1.2.1

### Patch Changes

- d925607: fixed `<AssistiveTreeDescription />` component throwing an error if the dnd feature is not included (#126)

## 1.2.0

### Minor Changes

- 647a072: Fixed incorrect package.json exports configurations to proper ESM and CJS exports (#104)
- 349d36e: change package.json["module"] to commonjs to fix inconsistent package definitiuons (#104)
- e2faf37: Fixed an issue async data loaders that resolve data before the tree is mounted can cause the tree to not render at all

  Note: When using the `createTree()` API directly instead of going through the React `useTree` API, an additional call
  to `tree.rebuildItems()` afterwards will be necessary. This change is marked as minor release regardless, since `createTree` is
  currently not a publically documented feature.

## 1.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [c9f9932]
- Updated dependencies [6ed84b4]
- Updated dependencies [4bef2f2]
  - @headless-tree/core@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [9e5027b]
  - @headless-tree/core@1.0.0

## 0.0.15

### Patch Changes

- 617faea: Support for keyboard-controlled drag-and-drop events
- Updated dependencies [2af5668]
- Updated dependencies [617faea]
  - @headless-tree/core@0.0.15

## 0.0.14

### Patch Changes

- Updated dependencies [7e702fb]
  - @headless-tree/core@0.0.14

## 0.0.13

### Patch Changes

- Updated dependencies [fdaefbc]
  - @headless-tree/core@0.0.13

## 0.0.12

### Patch Changes

- Updated dependencies [7236907]
  - @headless-tree/core@0.0.12

## 0.0.11

### Patch Changes

- 7ed33ac: dev release
- Updated dependencies [7ed33ac]
  - @headless-tree/core@0.0.11

## 0.0.9

### Patch Changes

- 520ec27: test release
- Updated dependencies [520ec27]
  - @headless-tree/core@0.0.10

## 0.0.8

### Patch Changes

- ab2a124: dev release
- Updated dependencies [ab2a124]
  - @headless-tree/core@0.0.9

## 0.0.7

### Patch Changes

- 076dfc5: dev release
- Updated dependencies [076dfc5]
  - @headless-tree/core@0.0.8

## 0.0.6

### Patch Changes

- 6ec53b3: dev release
- Updated dependencies [6ec53b3]
  - @headless-tree/core@0.0.7

## 0.0.5

### Patch Changes

- bc9c446: dev release
- Updated dependencies [bc9c446]
  - @headless-tree/core@0.0.6

## 0.0.4

### Patch Changes

- 751682a: dev release
- Updated dependencies [751682a]
  - @headless-tree/core@0.0.5

## 0.0.3

### Patch Changes

- 6460368: tree shaking
- Updated dependencies [6460368]
  - @headless-tree/core@0.0.3

## 0.0.2

### Patch Changes

- 05e24de: release test
- Updated dependencies [05e24de]
  - @headless-tree/core@0.0.2
