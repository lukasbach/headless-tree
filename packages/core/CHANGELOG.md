# @headless-tree/core

## 1.2.1

### Patch Changes

- 344011a: fixed an issue where dropping items on an empty tree didn't trigger any events
- 9f418f8: support setting the drag preview with the `setDragImage` option (#115)
- 309feba: fixed an issue where the drag-forbidden cursor is shown briefly between changing drag targets (#114)

## 1.2.0

### Minor Changes

- 647a072: Fixed incorrect package.json exports configurations to proper ESM and CJS exports (#104)
- 349d36e: change package.json["module"] to commonjs to fix inconsistent package definitiuons (#104)
- e2faf37: Fixed an issue async data loaders that resolve data before the tree is mounted can cause the tree to not render at all

  Note: When using the `createTree()` API directly instead of going through the React `useTree` API, an additional call
  to `tree.rebuildItems()` afterwards will be necessary. This change is marked as minor release regardless, since `createTree` is
  currently not a publically documented feature.

### Patch Changes

- 727c982: export makeStateUpdater from core package
- c041a3f: expose `isOrderedDragTarget` as utility method to differentiate between ordered and unordered drag targets (#108)
- 2887b0c: Added a `item.getKey()` utility method to use for generating React keys. For now, this just returns the item id, so no migration is needed from using `item.getId()` as React keys.
- 4e79bc7: Fixed a bug where `feature.overwrites` is not always respected when features are sorted during tree initialization
- 0669580: Fixed a bug where items that call `item.getProps` while being renamed, can be dragged while being renamed (#110)

## 1.1.0

### Minor Changes

- 64d8e2a: add getChildrenWithData method to data loader to support fetching all children of an item at once
- 35260e3: fixed hotkey issues where releasing modifier keys (like shift) before normal keys can cause issues with subsequent keydown events

### Patch Changes

- 29b2c64: improved key-handling behavior for hotkeys while input elements are focused (#98)
- da1e757: fixed a bug where alt-tabbing out of browser will break hotkeys feature
- c283f52: add feature to allow async data invalidation without triggering rerenders with `invalidateItemData(optimistic: true)` (#95)
- 29b2c64: added option to completely ignore hotkey events while input elements are focused (`ignoreHotkeysOnInput`) (#98)
- cd5b27c: add position:absolute to default styles of getDragLineStyle()

## 1.0.1

### Patch Changes

- c9f9932: fixed tree.focusNextItem() and tree.focusPreviousItem() throwing if no item is currently focused
- 6ed84b4: recursive item references are filtered out when rendering (#89)
- 4bef2f2: fixed a bug where hotkeys involving shift may not work properly depending on the order of shift and other key inputs (#98)

## 1.0.0

### Minor Changes

- 9e5027b: The propMemoization feature now memoizes all prop-generation related functions, including searchinput and renameinput related props

## 0.0.15

### Patch Changes

- 2af5668: Bug fix: Mutations to expanded tree items from outside will now trigger a rebuild of the tree structure (#65)
- 617faea: Support for keyboard-controlled drag-and-drop events

## 0.0.14

### Patch Changes

- 7e702fb: dev release

## 0.0.13

### Patch Changes

- fdaefbc: dev release

## 0.0.12

### Patch Changes

- 7236907: dev release

## 0.0.11

### Patch Changes

- 7ed33ac: dev release

## 0.0.10

### Patch Changes

- 520ec27: test release

## 0.0.9

### Patch Changes

- ab2a124: dev release

## 0.0.8

### Patch Changes

- 076dfc5: dev release

## 0.0.7

### Patch Changes

- 6ec53b3: dev release

## 0.0.6

### Patch Changes

- bc9c446: dev release

## 0.0.5

### Patch Changes

- 751682a: dev release

## 0.0.4

### Patch Changes

- dc6d813: tag pushing

## 0.0.3

### Patch Changes

- 6460368: tree shaking

## 0.0.2

### Patch Changes

- 05e24de: release test
