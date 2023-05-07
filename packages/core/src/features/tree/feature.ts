import { FeatureImplementation, ItemInstance } from "../../types/core";
import { ItemMeta, TreeFeatureDef } from "./types";
import { makeStateUpdater, memo } from "../../utils";
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
    onChangeExpandedItems: makeStateUpdater("expandedItems", tree),
    onChangeFocusedItem: makeStateUpdater("focusedItem", tree),
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

    getItemsMeta: memo(
      (rootItemId, expandedItems) => {
        // console.log("!", instance.getConfig());
        const flatItems: ItemMeta<any>[] = [];

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
      () => [
        instance.getConfig().rootItemId,
        instance.getState().expandedItems,
        instance.getState().loadingItems,
      ]
    ),

    expandItem: (itemId) => {
      instance
        .getConfig()
        .onChangeExpandedItems?.((expandedItems) => [...expandedItems, itemId]);
    },

    collapseItem: (itemId) => {
      instance
        .getConfig()
        .onChangeExpandedItems?.((expandedItems) =>
          expandedItems.filter((id) => id !== itemId)
        );
    },

    // TODO memo
    getFocusedItem: () => {
      return (
        instance
          .getItems()
          .find((item) => item.getId() === instance.getState().focusedItem) ??
        instance.getItems()[0]
      );
    },

    focusItem: (itemId) => {
      instance.getConfig().onChangeFocusedItem?.(itemId);
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
      // TODO replace with a replaceable focusItem/scrollToItem method that can be replaced
      // TODO by a virtualized support feature

      // TODO maybe find a better way?
      // Required because if the state is managed outside in react, the state only updated during next render
      setTimeout(() => {
        const focusedItem = instance.getFocusedItem();
        console.log(focusedItem.getElement(), "!!");
        const focusedElement = focusedItem.getElement();
        if (!focusedElement) return;
        focusedElement.focus();
        if (scrollIntoView) {
          focusedElement.scrollIntoView();
        }
      });
    },

    getContainerProps: () => ({
      ...prev.getContainerProps?.(),
      role: "tree",
      ariaLabel: "",
      ariaActivedescendant: "",
    }),
  }),

  createItemInstance: (prev, instance, itemMeta, tree) => ({
    ...prev,
    isLoading: () => {
      throw new Error("No data-loader registered");
    },
    getId: () => itemMeta.itemId,
    getProps: () => {
      return {
        ...prev.getProps?.(),
        role: "treeitem",
        "aria-setsize": itemMeta.setSize,
        "aria-posinset": itemMeta.posInSet,
        "aria-selected": false,
        "aria-label": instance.getItemName(),
        "aria-level": itemMeta.level,
        tabIndex: instance.isFocused() ? 0 : -1,
        onClick: (e) => {
          instance.setFocused();
          instance.primaryAction();

          if (e.ctrlKey || e.shiftKey || e.metaKey) {
            return;
          }

          if (!instance.isFolder()) {
            return;
          }

          if (instance.isExpanded()) {
            instance.collapse();
          } else {
            instance.expand();
          }
        },
      };
    },
    expand: () => tree.expandItem(itemMeta.itemId),
    collapse: () => tree.collapseItem(itemMeta.itemId),
    getItemData: () => tree.retrieveItemData(itemMeta.itemId),
    isExpanded: () => tree.getState().expandedItems.includes(itemMeta.itemId),
    isFocused: () =>
      tree.getState().focusedItem === itemMeta.itemId ||
      (tree.getState().focusedItem === null && itemMeta.index === 0),
    isFolder: () => tree.getConfig().isItemFolder(instance.getItemData()),
    getItemName: () => {
      const config = tree.getConfig();
      return config.getItemName(tree.retrieveItemData(itemMeta.itemId));
    },
    getItemMeta: () => itemMeta,
    setFocused: () => tree.focusItem(itemMeta.itemId),
    primaryAction: () =>
      tree.getConfig().onPrimaryAction?.(instance as ItemInstance<any>),
    getParent: memo(
      (itemMeta) => {
        for (let i = itemMeta.index - 1; i >= 0; i--) {
          const item = tree.getItems()[i];
          if (item.getItemMeta().level < itemMeta.level) {
            return item;
          }
        }
        return null;
      },
      () => [itemMeta]
    ),
    getIndexInParent: () =>
      itemMeta.index - (instance.getParent()?.getItemMeta().index ?? 0) - 1,
  }),

  hotkeys: {
    focusNextItem: {
      hotkey: "ArrowDown",
      canRepeat: true,
      isEnabled: (tree) => !(tree.isSearchOpen?.() ?? false),
      handler: (e, tree) => {
        tree.focusNextItem();
        tree.updateDomFocus();
      },
    },
    focusPreviousItem: {
      hotkey: "ArrowUp",
      canRepeat: true,
      isEnabled: (tree) => !(tree.isSearchOpen?.() ?? false),
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
        if (!item.isExpanded() || !item.isFolder()) {
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
