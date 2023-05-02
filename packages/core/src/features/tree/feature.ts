import { FeatureImplementation } from "../../types/core";
import { ItemMeta, TreeFeatureDef } from "./types";
import { makeStateUpdater, memo } from "../../utils";
import { MainFeatureDef } from "../main/types";
import { HotkeysCoreFeatureDef } from "../hotkeys-core/types";

export const treeFeature: FeatureImplementation<
  any,
  TreeFeatureDef<any>,
  MainFeatureDef | TreeFeatureDef<any> | HotkeysCoreFeatureDef<any>
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

    isItemExpanded: (itemId) =>
      instance.getState().expandedItems.includes(itemId),

    getItemsMeta: memo(
      (rootItemId, expandedItems) => {
        const config = instance.getConfig();
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
            const children = config.dataLoader.getChildren(itemId) ?? [];
            let i = 0;
            for (const childId of children) {
              recursiveAdd(childId, itemId, level + 1, children.length, i++);
            }
          }
        };

        const children = config.dataLoader.getChildren(rootItemId);
        let i = 0;
        for (const itemId of children) {
          recursiveAdd(itemId, rootItemId, 0, children.length, i++);
        }

        return flatItems;
      },
      () => [instance.getState().rootItemId, instance.getState().expandedItems]
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
      console.log("FOCUS NEXT", index, nextIndex);
    },

    focusPreviousItem: () => {
      const { index } = instance.getFocusedItem().getItemMeta();
      const nextIndex = Math.max(index - 1, 0);
      instance.focusItem(instance.getItems()[nextIndex].getId());
    },

    updateDomFocus: (scrollIntoView) => {
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
    getId: () => itemMeta.itemId,
    getProps: () => {
      const itemMeta = instance.getItemMeta();
      return {
        ...prev.getProps?.(),
        role: "treeitem",
        "aria-setsize": itemMeta.setSize,
        "aria-posinset": itemMeta.posInSet,
        "aria-selected": false,
        "aria-label": "",
        "aria-level": itemMeta.level,
        tabIndex: instance.isFocused() ? 0 : -1,
        onClick: (e) => {
          instance.setFocused();

          if (e.ctrlKey || e.shiftKey || e.metaKey) {
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
    isExpanded: () => tree.getState().expandedItems.includes(itemMeta.itemId),
    isFocused: () =>
      tree.getState().focusedItem === itemMeta.itemId ||
      (tree.getState().focusedItem === null && itemMeta.index === 0),
    getItemName: () => {
      const config = tree.getConfig();
      return config.getItemName(config.dataLoader.getItem(itemMeta.itemId));
    },
    getItemMeta: () => itemMeta,
    setFocused: () => tree.focusItem(itemMeta.itemId),
    getParent: memo(
      () => {
        for (let i = itemMeta.index - 1; i >= 0; i--) {
          const item = tree.getItems()[i];
          if (item.getItemMeta().level < itemMeta.level) {
            return item;
          }
        }
        return tree.getItemInstance(tree.getState().rootItemId);
      },
      () => []
    ),
    getIndexInParent: () =>
      itemMeta.index - instance.getParent().getItemMeta().index,
  }),

  hotkeys: {
    focusNextItem: {
      hotkey: "ArrowDown",
      canRepeat: true,
      handler: (e, tree) => {
        tree.focusNextItem();
        tree.updateDomFocus();
      },
    },
    focusPreviousItem: {
      hotkey: "ArrowUp",
      canRepeat: true,
      handler: (e, tree) => {
        tree.focusPreviousItem();
        tree.updateDomFocus();
      },
    },
  },
};