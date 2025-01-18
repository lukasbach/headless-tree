import {
  FeatureImplementation,
  ItemInstance,
  ItemInstanceOpts,
} from "../../types/core";
import { ItemMeta, TreeFeatureDef, TreeItemDataRef } from "./types";
import { makeStateUpdater, memo, poll } from "../../utils";
import { MainFeatureDef } from "../main/types";
import { HotkeysCoreFeatureDef } from "../hotkeys-core/types";
import { SyncDataLoaderFeatureDef } from "../sync-data-loader/types";

export const treeFeature: FeatureImplementation<
  any,
  TreeFeatureDef<any>,
  | MainFeatureDef
  | TreeFeatureDef<any>
  | HotkeysCoreFeatureDef<any>
  | SyncDataLoaderFeatureDef<any>
> = {
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
    isItemExpanded: ({ tree }, itemId) =>
      tree.getState().expandedItems.includes(itemId),

    getItemsMeta: ({ tree }) => {
      const { rootItemId } = tree.getConfig();
      const { expandedItems } = tree.getState();
      const flatItems: ItemMeta[] = [];
      const expandedItemsSet = new Set(expandedItems);

      const recursiveAdd = (
        itemId: string,
        parentId: string,
        level: number,
        setSize: number,
        posInSet: number,
      ) => {
        flatItems.push({
          itemId,
          level,
          index: flatItems.length,
          parentId,
          setSize,
          posInSet,
        });

        if (expandedItemsSet.has(itemId)) {
          // TODO THIS MADE A HUGE DIFFERENCE!
          const children = tree.retrieveChildrenIds(itemId) ?? [];
          let i = 0;
          for (const childId of children) {
            recursiveAdd(childId, itemId, level + 1, children.length, i++);
          }
        }
      };

      const children = tree.retrieveChildrenIds(rootItemId);
      let i = 0;
      for (const itemId of children) {
        recursiveAdd(itemId, rootItemId, 0, children.length, i++);
      }

      return flatItems;
    },

    expandItem: ({ tree }, itemId) => {
      if (!tree.getItemInstance(itemId).isFolder()) {
        return;
      }

      if (tree.getState().loadingItems?.includes(itemId)) {
        return;
      }

      tree.applySubStateUpdate("expandedItems", (expandedItems) => [
        ...expandedItems,
        itemId,
      ]);
      tree.rebuildTree();
    },

    collapseItem: ({ tree }, itemId) => {
      if (!tree.getItemInstance(itemId).isFolder()) {
        return;
      }

      tree.applySubStateUpdate("expandedItems", (expandedItems) =>
        expandedItems.filter((id) => id !== itemId),
      );
      tree.rebuildTree();
    },

    // TODO memo
    getFocusedItem: ({ tree }) => {
      return (
        tree.getItemInstance(tree.getState().focusedItem ?? "") ??
        tree.getItems()[0]
      );
    },

    focusItem: ({ tree }, itemId) => {
      tree.applySubStateUpdate("focusedItem", itemId);
    },

    focusNextItem: ({ tree }) => {
      const { index } = tree.getFocusedItem().getItemMeta();
      const nextIndex = Math.min(index + 1, tree.getItems().length - 1);
      tree.focusItem(tree.getItems()[nextIndex].getId());
    },

    focusPreviousItem: ({ tree }) => {
      const { index } = tree.getFocusedItem().getItemMeta();
      const nextIndex = Math.max(index - 1, 0);
      tree.focusItem(tree.getItems()[nextIndex].getId());
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

    getContainerProps: ({ prev }) => ({
      ...prev(),
      role: "tree",
      ariaLabel: "",
      ariaActivedescendant: "",
    }),
  },

  itemInstance: {
    scrollTo: async ({ tree, item }, scrollIntoViewArg) => {
      tree.getConfig().scrollToItem?.(item as any);
      await poll(() => item.getElement() !== null, 20);
      item.getElement()!.scrollIntoView(scrollIntoViewArg);
    },
    getId: ({ item }) => item.getItemMeta().itemId,
    getProps: ({ item, prev }) => {
      const itemMeta = item.getItemMeta();
      return {
        ...prev?.(),
        role: "treeitem",
        "aria-setsize": itemMeta.setSize,
        "aria-posinset": itemMeta.posInSet,
        "aria-selected": "false",
        "aria-label": item.getItemName(),
        "aria-level": itemMeta.level,
        tabIndex: item.isFocused() ? 0 : -1,
        onClick: item.getMemoizedProp("tree/onClick", () => (e) => {
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
        }),
      };
    },
    expand: ({ tree, item }) => tree.expandItem(item.getItemMeta().itemId),
    collapse: ({ tree, item }) => tree.collapseItem(item.getItemMeta().itemId),
    getItemData: ({ tree, item }) =>
      tree.retrieveItemData(item.getItemMeta().itemId),
    isExpanded: ({ tree, item }) =>
      tree.getState().expandedItems.includes(item.getItemMeta().itemId),
    isDescendentOf: ({ item }, parentId) => {
      const parent = item.getParent();
      return parent?.getId() === parentId || parent?.isDescendentOf(parentId);
    },
    isFocused: ({ tree, item }) =>
      tree.getState().focusedItem === item.getItemMeta().itemId ||
      (tree.getState().focusedItem === null && item.getItemMeta().index === 0),
    isFolder: ({ tree, item }) =>
      item.getItemMeta().level === -1 ||
      tree.getConfig().isItemFolder(item as ItemInstance<any>),
    getItemName: ({ tree, item }) => {
      const config = tree.getConfig();
      return config.getItemName(item as ItemInstance<any>);
    },
    setFocused: ({ tree, item }) => tree.focusItem(item.getItemMeta().itemId),
    primaryAction: ({ tree, item }) =>
      tree.getConfig().onPrimaryAction?.(item as ItemInstance<any>),
    getParent: memo(
      (itemMeta, tree) => {
        if (itemMeta.index === -1) return null;
        for (let i = itemMeta.index - 1; i >= 0; i--) {
          const potentialParent = tree.getItems()[i];
          if (potentialParent.getItemMeta().level < itemMeta.level) {
            return potentialParent;
          }
        }
        return tree.getItemInstance(tree.getConfig().rootItemId);
      },
      ({ item, tree }: ItemInstanceOpts) => [item.getItemMeta(), tree], // TODO does this still work?
    ),
    // TODO remove
    getIndexInParent: ({ item }) => item.getItemMeta().posInSet,
    getChildren: ({ tree, item }) =>
      tree
        .retrieveChildrenIds(item.getItemMeta().itemId)
        .map((id) => tree.getItemInstance(id)),
    getTree: ({ tree }) => tree as any,
    getItemAbove: ({ tree, item }) =>
      tree.getItems()[item.getItemMeta().index - 1],
    getItemBelow: ({ tree, item }) =>
      tree.getItems()[item.getItemMeta().index + 1],
    getMemoizedProp: ({ item }, name, create, deps) => {
      const data = item.getDataRef<TreeItemDataRef>();
      const memoizedValue = data.current.memoizedValues?.[name];
      if (
        memoizedValue &&
        (!deps ||
          data.current.memoizedDeps?.[name]?.every((d, i) => d === deps![i]))
      ) {
        return memoizedValue;
      }
      data.current.memoizedDeps ??= {};
      data.current.memoizedValues ??= {};
      const value = create();
      data.current.memoizedDeps[name] = deps;
      data.current.memoizedValues[name] = value;
      return value;
    },
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
        tree.focusItem(tree.getItems()[0].getId());
        tree.updateDomFocus();
      },
    },
    focusLastItem: {
      hotkey: "End",
      handler: (e, tree) => {
        tree.focusItem(tree.getItems()[tree.getItems().length - 1].getId());
        tree.updateDomFocus();
      },
    },
  },
};
