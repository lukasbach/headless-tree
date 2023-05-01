import { FeatureDef } from "../../types/core";
import { ItemMeta, TreeFeature } from "./types";
import { memo } from "../../utils";
import { MainFeature } from "../main/types";

export const treeFeature: FeatureDef<
  any,
  TreeFeature<any>,
  [MainFeature, TreeFeature<any>]
> = {
  // dependingFeatures: [mainFeature],

  getInitialState: (initialState) => ({
    expandedItems: [],
    focusedItem: null,
    ...initialState,
  }),

  createTreeInstance: (instance) => ({
    ...instance,

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

        console.log("FLAT ITEMS", flatItems, expandedItems);

        return flatItems;
      },
      () => [instance.getState().rootItemId, instance.getState().expandedItems]
    ),

    expandItem: (itemId) => {
      instance.setState((state) => ({
        ...state,
        expandedItems: [...state.expandedItems, itemId],
      }));
    },

    collapseItem: (itemId) => {
      instance.setState((state) => ({
        ...state,
        expandedItems: state.expandedItems.filter((id) => id !== itemId),
      }));
    },

    getItemProps: (item) => {
      const itemMeta = item.getItemMeta();
      return {
        ...instance.getItemProps?.(item),
        role: "treeitem",
        "aria-setsize": itemMeta.setSize,
        "aria-posinset": itemMeta.posInSet,
        "aria-selected": false,
        "aria-label": "",
        "aria-level": itemMeta.level,
        tabIndex: instance.getState().focusedItem === itemMeta.itemId ? 0 : -1,
        onClick: () => (item.isExpanded() ? item.collapse() : item.expand()),
      };
    },

    getContainerProps: () => ({
      ...instance.getContainerProps?.(),
      role: "tree",
      ariaLabel: "",
      ariaActivedescendant: "",
    }),
  }),

  createItemInstance: (instance, itemMeta, tree) => ({
    ...instance,
    getId: () => itemMeta.itemId,
    getProps: () => tree.getItemProps(instance),
    expand: () => tree.expandItem(itemMeta.itemId),
    collapse: () => tree.collapseItem(itemMeta.itemId),
    isExpanded: () => tree.getState().expandedItems.includes(itemMeta.itemId),
    getItemName: () => {
      const config = tree.getConfig();
      return config.getItemName(config.dataLoader.getItem(itemMeta.itemId));
    },
    getItemMeta: () => itemMeta,
  }),
};
