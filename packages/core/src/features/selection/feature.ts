import { FeatureImplementation } from "../../types/core";
import { SelectionFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";

export const selectionFeature: FeatureImplementation<
  any,
  SelectionFeatureDef<any>,
  MainFeatureDef | TreeFeatureDef<any> | SelectionFeatureDef<any>
> = {
  key: "selection",
  dependingFeatures: ["main", "tree"],

  getInitialState: (initialState) => ({
    selectedItems: [],
    ...initialState,
  }),

  createTreeInstance: (prev, instance) => ({
    ...prev,

    setSelectedItems: (selectedItems) => {
      instance.setState((state) => ({
        ...state,
        selectedItems,
      }));
    },
  }),

  createItemInstance: (prev, item, itemMeta, tree) => ({
    ...prev,

    select: () => {
      const { selectedItems } = tree.getState();
      tree.setSelectedItems(
        selectedItems.includes(itemMeta.itemId)
          ? selectedItems
          : [...selectedItems, itemMeta.itemId]
      );
    },

    deselect: () => {
      const { selectedItems } = tree.getState();
      tree.setSelectedItems(
        selectedItems.filter((id) => id !== itemMeta.itemId)
      );
    },

    isSelected: () => {
      const { selectedItems } = tree.getState();
      return selectedItems.includes(itemMeta.itemId);
    },

    selectUpTo: (ctrl: boolean) => {
      const indexA = itemMeta.index;
      const indexB = tree.getFocusedItem().getItemMeta().index;
      const [a, b] = indexA < indexB ? [indexA, indexB] : [indexB, indexA];
      const newSelectedItems = tree
        .getItems()
        .slice(a, b + 1)
        .map((item) => item.getItemMeta().itemId);

      if (!ctrl) {
        tree.setSelectedItems(newSelectedItems);
        return;
      }

      const { selectedItems } = tree.getState();
      const uniqueSelectedItems = [
        ...new Set([...selectedItems, ...newSelectedItems]),
      ];
      tree.setSelectedItems(uniqueSelectedItems);
    },

    toggleSelect: () => {
      if (item.isSelected()) {
        item.deselect();
      } else {
        item.select();
      }
    },

    getProps: () => ({
      ...prev.getProps(),
      onClick: (e) => {
        if (e.shiftKey) {
          item.selectUpTo(e.ctrlKey || e.metaKey);
        } else if (e.ctrlKey || e.metaKey) {
          item.toggleSelect();
        } else {
          tree.setSelectedItems([itemMeta.itemId]);
        }

        prev.getProps().onClick?.(e);
      },
    }),
  }),

  hotkeys: {
    // setSelectedItem: {
    //   hotkey: "space",
    //   handler: (e, tree) => {
    //     tree.setSelectedItems([tree.getFocusedItem().getId()]);
    //   },
    // },
    toggleSelectItem: {
      hotkey: "ctrl+space",
      handler: (e, tree) => {
        tree.getFocusedItem().toggleSelect();
      },
    },
    selectUpwards: {
      hotkey: "shift+ArrowUp",
      handler: () => {
        // TODO
      },
    },
    selectDownwards: {
      hotkey: "shift+ArrowDown",
      handler: () => {
        // TODO
      },
    },
    selectUpwardsCtrl: {
      hotkey: "shift+ctrl+ArrowUp",
      handler: () => {
        // TODO
      },
    },
    selectDownwardsCtrl: {
      hotkey: "shift+ctrl+ArrowUp",
      handler: () => {
        // TODO
      },
    },
  },
};
