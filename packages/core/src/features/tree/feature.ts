import { FeatureImplementation, ItemInstance } from "../../types/core";
import { ItemMeta, TreeFeatureDef } from "./types";
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
  dependingFeatures: ["main"],

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

  createTreeInstance: (prev, instance) => ({
    ...prev,

    retrieveItemData: () => {
      throw new Error("No data-loader registered");
    },

    retrieveChildrenIds: () => {
      throw new Error("No data-loader registered");
    },

    isItemExpanded: (itemId) =>
      instance.getState().expandedItems.includes(itemId),

    getItemsMeta: () => {
      const { rootItemId } = instance.getConfig();
      const { expandedItems } = instance.getState();
      // console.log("!", instance.getConfig());
      const flatItems: ItemMeta[] = [];

      const recursiveAdd = (
        itemId: string,
        parentId: string,
        level: number,
        setSize: number,
        posInSet: number
      ) => {
        flatItems.push({
          itemId,
          level,
          index: flatItems.length,
          parentId,
          setSize,
          posInSet,
        });

        if (expandedItems.includes(itemId)) {
          const children = instance.retrieveChildrenIds(itemId) ?? [];
          let i = 0;
          for (const childId of children) {
            recursiveAdd(childId, itemId, level + 1, children.length, i++);
          }
        }
      };

      const children = instance.retrieveChildrenIds(rootItemId);
      let i = 0;
      for (const itemId of children) {
        recursiveAdd(itemId, rootItemId, 0, children.length, i++);
      }

      return flatItems;
    },

    expandItem: (itemId) => {
      if (!instance.getItemInstance(itemId).isFolder()) {
        return;
      }

      if (instance.getState().loadingItems?.includes(itemId)) {
        return;
      }

      instance
        .getConfig()
        .setExpandedItems?.((expandedItems) => [...expandedItems, itemId]);
      instance.rebuildTree();
    },

    collapseItem: (itemId) => {
      if (!instance.getItemInstance(itemId).isFolder()) {
        return;
      }

      instance
        .getConfig()
        .setExpandedItems?.((expandedItems) =>
          expandedItems.filter((id) => id !== itemId)
        );
      instance.rebuildTree();
    },

    // TODO memo
    getFocusedItem: () => {
      return (
        instance.getItemInstance(instance.getState().focusedItem ?? "") ??
        instance.getItems()[0]
      );
    },

    focusItem: (itemId) => {
      instance.getConfig().setFocusedItem?.(itemId);
    },

    focusNextItem: () => {
      const { index } = instance.getFocusedItem().getItemMeta();
      const nextIndex = Math.min(index + 1, instance.getItems().length - 1);
      instance.focusItem(instance.getItems()[nextIndex].getId());
    },

    focusPreviousItem: () => {
      const { index } = instance.getFocusedItem().getItemMeta();
      const nextIndex = Math.max(index - 1, 0);
      instance.focusItem(instance.getItems()[nextIndex].getId());
    },

    updateDomFocus: (scrollIntoView) => {
      // Required because if the state is managed outside in react, the state only updated during next render
      setTimeout(async () => {
        const focusedItem = instance.getFocusedItem();
        instance.getConfig().scrollToItem?.(focusedItem);
        await poll(() => focusedItem.getElement() !== null, 20);
        const focusedElement = focusedItem.getElement();
        if (!focusedElement) return;
        focusedElement.focus();
        // if (scrollIntoView) {
        //   focusedElement.scrollIntoView();
        // }
      });
    },

    getContainerProps: () => ({
      ...prev.getContainerProps?.(),
      role: "tree",
      ariaLabel: "",
      ariaActivedescendant: "",
    }),
  }),

  createItemInstance: (prev, item, tree) => ({
    ...prev,
    isLoading: () => {
      throw new Error("No data-loader registered");
    },
    getId: () => item.getItemMeta().itemId,
    getProps: () => {
      const itemMeta = item.getItemMeta();
      return {
        ...prev.getProps?.(),
        role: "treeitem",
        "aria-setsize": itemMeta.setSize,
        "aria-posinset": itemMeta.posInSet,
        "aria-selected": false,
        "aria-label": item.getItemName(),
        "aria-level": itemMeta.level,
        tabIndex: item.isFocused() ? 0 : -1,
        onClick: (e) => {
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
    expand: () => tree.expandItem(item.getItemMeta().itemId),
    collapse: () => tree.collapseItem(item.getItemMeta().itemId),
    getItemData: () => tree.retrieveItemData(item.getItemMeta().itemId),
    isExpanded: () =>
      tree.getState().expandedItems.includes(item.getItemMeta().itemId),
    isFocused: () =>
      tree.getState().focusedItem === item.getItemMeta().itemId ||
      (tree.getState().focusedItem === null && item.getItemMeta().index === 0),
    isFolder: () =>
      item.getItemMeta().level === -1 ||
      tree.getConfig().isItemFolder(item as ItemInstance<any>),
    getItemName: () => {
      const config = tree.getConfig();
      return config.getItemName(item as ItemInstance<any>);
    },
    setFocused: () => tree.focusItem(item.getItemMeta().itemId),
    primaryAction: () =>
      tree.getConfig().onPrimaryAction?.(item as ItemInstance<any>),
    getParent: memo(
      (itemMeta) => {
        for (let i = itemMeta.index - 1; i >= 0; i--) {
          const potentialParent = tree.getItems()[i];
          if (potentialParent.getItemMeta().level < itemMeta.level) {
            return potentialParent;
          }
        }
        return tree.getItemInstance(tree.getConfig().rootItemId);
      },
      () => [item.getItemMeta()]
    ),
    getIndexInParent: () =>
      item.getItemMeta().index -
      (item.getParent()?.getItemMeta().index ?? 0) -
      1,
    getChildren: () =>
      tree
        .retrieveChildrenIds(item.getItemMeta().itemId)
        .map((id) => tree.getItemInstance(id)),
    getTree: () => tree as any,
    getItemAbove: () => tree.getItems()[item.getItemMeta().index - 1],
    getItemBelow: () => tree.getItems()[item.getItemMeta().index + 1],
  }),

  hotkeys: {
    focusNextItem: {
      hotkey: "ArrowDown",
      canRepeat: true,
      preventDefault: true,
      isEnabled: (tree) =>
        !(tree.isSearchOpen?.() ?? false) && !tree.getState().dnd,
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
          tree.updateDomFocus(true);
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
