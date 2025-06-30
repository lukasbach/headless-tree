import { FeatureImplementation, ItemInstance } from "../../types/core";
import { ItemMeta } from "./types";
import { makeStateUpdater, poll } from "../../utils";
import { logWarning } from "../../utilities/errors";

export const treeFeature: FeatureImplementation<any> = {
  key: "tree",

  getInitialState: (initialState) => ({
    expandedItems: [],
    focusedItem: null,
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => ({
    setExpandedItems: makeStateUpdater("expandedItems", tree),
    setFocusedItem: makeStateUpdater("focusedItem", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    expandedItems: "setExpandedItems",
    focusedItem: "setFocusedItem",
  },

  treeInstance: {
    getItemsMeta: ({ tree }) => {
      const { rootItemId } = tree.getConfig();
      const { expandedItems } = tree.getState();
      const flatItems: ItemMeta[] = [];
      const expandedItemsSet = new Set(expandedItems); // TODO support setting state expandedItems as set instead of array

      const recursiveAdd = (
        itemId: string,
        path: string[],
        level: number,
        setSize: number,
        posInSet: number,
      ) => {
        if (path.includes(itemId)) {
          logWarning(`Circular reference for ${path.join(".")}`);
          return;
        }

        flatItems.push({
          itemId,
          level,
          index: flatItems.length,
          parentId: path.at(-1) as string,
          setSize,
          posInSet,
        });

        if (expandedItemsSet.has(itemId)) {
          const children = tree.retrieveChildrenIds(itemId) ?? [];
          let i = 0;
          for (const childId of children) {
            recursiveAdd(
              childId,
              path.concat(itemId),
              level + 1,
              children.length,
              i++,
            );
          }
        }
      };

      const children = tree.retrieveChildrenIds(rootItemId);
      let i = 0;
      for (const itemId of children) {
        recursiveAdd(itemId, [rootItemId], 0, children.length, i++);
      }

      return flatItems;
    },

    getFocusedItem: ({ tree }) => {
      return (
        tree.getItemInstance(tree.getState().focusedItem ?? "") ??
        tree.getItems()[0]
      );
    },

    getRootItem: ({ tree }) => {
      const { rootItemId } = tree.getConfig();
      return tree.getItemInstance(rootItemId);
    },

    focusNextItem: ({ tree }) => {
      const focused = tree.getFocusedItem().getItemMeta();
      if (!focused) return;
      const nextIndex = Math.min(focused.index + 1, tree.getItems().length - 1);
      tree.getItems()[nextIndex]?.setFocused();
    },

    focusPreviousItem: ({ tree }) => {
      const focused = tree.getFocusedItem().getItemMeta();
      if (!focused) return;
      const nextIndex = Math.max(focused.index - 1, 0);
      tree.getItems()[nextIndex]?.setFocused();
    },

    updateDomFocus: ({ tree }) => {
      // Required because if the state is managed outside in react, the state only updated during next render
      setTimeout(async () => {
        const focusedItem = tree.getFocusedItem();
        tree.getConfig().scrollToItem?.(focusedItem);
        await poll(() => focusedItem.getElement() !== null, 20);
        const focusedElement = focusedItem.getElement();
        if (!focusedElement) return;
        focusedElement.focus();
      });
    },

    getContainerProps: ({ prev, tree }, treeLabel) => ({
      ...prev?.(),
      role: "tree",
      "aria-label": treeLabel ?? "",
      ref: tree.registerElement,
    }),

    // relevant for hotkeys of this feature
    isSearchOpen: () => false,
  },

  itemInstance: {
    scrollTo: async ({ tree, item }, scrollIntoViewArg) => {
      tree.getConfig().scrollToItem?.(item as any);
      await poll(() => item.getElement() !== null, 20);
      item.getElement()?.scrollIntoView(scrollIntoViewArg);
    },
    getId: ({ itemId }) => itemId,
    getKey: ({ itemId }) => itemId, // TODO apply to all stories to use
    getProps: ({ item, prev }) => {
      const itemMeta = item.getItemMeta();
      return {
        ...prev?.(),
        ref: item.registerElement,
        role: "treeitem",
        "aria-setsize": itemMeta.setSize,
        "aria-posinset": itemMeta.posInSet,
        "aria-selected": "false",
        "aria-label": item.getItemName(),
        "aria-level": itemMeta.level,
        tabIndex: item.isFocused() ? 0 : -1,
        onClick: (e: MouseEvent) => {
          item.setFocused();
          item.primaryAction();

          if (e.ctrlKey || e.shiftKey || e.metaKey) {
            return;
          }

          if (!item.isFolder()) {
            return;
          }

          if (item.isExpanded()) {
            item.collapse();
          } else {
            item.expand();
          }
        },
      };
    },
    expand: ({ tree, item, itemId }) => {
      if (!item.isFolder()) {
        return;
      }

      if (tree.getState().loadingItemChildrens?.includes(itemId)) {
        return;
      }

      tree.applySubStateUpdate("expandedItems", (expandedItems) => [
        ...expandedItems,
        itemId,
      ]);
      tree.rebuildTree();
    },
    collapse: ({ tree, item, itemId }) => {
      if (!item.isFolder()) {
        return;
      }

      tree.applySubStateUpdate("expandedItems", (expandedItems) =>
        expandedItems.filter((id) => id !== itemId),
      );
      tree.rebuildTree();
    },
    getItemData: ({ tree, itemId }) => tree.retrieveItemData(itemId),
    equals: ({ item }, other) => item.getId() === other?.getId(),
    isExpanded: ({ tree, itemId }) =>
      tree.getState().expandedItems.includes(itemId),
    isDescendentOf: ({ item }, parentId) => {
      const parent = item.getParent();
      return Boolean(
        parent?.getId() === parentId || parent?.isDescendentOf(parentId),
      );
    },
    isFocused: ({ tree, item, itemId }) =>
      tree.getState().focusedItem === itemId ||
      (tree.getState().focusedItem === null && item.getItemMeta().index === 0),
    isFolder: ({ tree, item }) =>
      item.getItemMeta().level === -1 ||
      tree.getConfig().isItemFolder(item as ItemInstance<any>),
    getItemName: ({ tree, item }) => {
      const config = tree.getConfig();
      return config.getItemName(item as ItemInstance<any>);
    },
    setFocused: ({ tree, itemId }) => {
      tree.applySubStateUpdate("focusedItem", itemId);
    },
    primaryAction: ({ tree, item }) =>
      tree.getConfig().onPrimaryAction?.(item as ItemInstance<any>),
    getParent: ({ tree, item }) =>
      item.getItemMeta().parentId
        ? tree.getItemInstance(item.getItemMeta().parentId)
        : undefined,
    getIndexInParent: ({ item }) => item.getItemMeta().posInSet,
    getChildren: ({ tree, itemId }) =>
      tree.retrieveChildrenIds(itemId).map((id) => tree.getItemInstance(id)),
    getTree: ({ tree }) => tree as any,
    getItemAbove: ({ tree, item }) =>
      tree.getItems()[item.getItemMeta().index - 1],
    getItemBelow: ({ tree, item }) =>
      tree.getItems()[item.getItemMeta().index + 1],
  },

  hotkeys: {
    focusNextItem: {
      hotkey: "ArrowDown",
      canRepeat: true,
      preventDefault: true,
      isEnabled: (tree) =>
        !(tree.isSearchOpen?.() ?? false) && !tree.getState().dnd, // TODO what happens when the feature doesnt exist? proxy method still claims to exist
      handler: (e, tree) => {
        tree.focusNextItem();
        tree.updateDomFocus();
      },
    },
    focusPreviousItem: {
      hotkey: "ArrowUp",
      canRepeat: true,
      preventDefault: true,
      isEnabled: (tree) =>
        !(tree.isSearchOpen?.() ?? false) && !tree.getState().dnd,
      handler: (e, tree) => {
        tree.focusPreviousItem();
        tree.updateDomFocus();
      },
    },
    expandOrDown: {
      hotkey: "ArrowRight",
      canRepeat: true,
      handler: (e, tree) => {
        const item = tree.getFocusedItem();
        if (item.isExpanded() || !item.isFolder()) {
          tree.focusNextItem();
          tree.updateDomFocus();
        } else {
          item.expand();
        }
      },
    },
    collapseOrUp: {
      hotkey: "ArrowLeft",
      canRepeat: true,
      handler: (e, tree) => {
        const item = tree.getFocusedItem();
        if (
          (!item.isExpanded() || !item.isFolder()) &&
          item.getItemMeta().level !== 0
        ) {
          item.getParent()?.setFocused();
          tree.updateDomFocus();
        } else {
          item.collapse();
        }
      },
    },
    focusFirstItem: {
      hotkey: "Home",
      handler: (e, tree) => {
        tree.getItems()[0]?.setFocused();
        tree.updateDomFocus();
      },
    },
    focusLastItem: {
      hotkey: "End",
      handler: (e, tree) => {
        tree.getItems()[tree.getItems().length - 1]?.setFocused();
        tree.updateDomFocus();
      },
    },
  },
};
