# @headless-tree/core

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
