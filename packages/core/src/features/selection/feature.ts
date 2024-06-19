import { FeatureImplementation } from "../../types/core";
import { SelectionFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";
import { makeStateUpdater } from "../../utils";

export const selectionFeature: FeatureImplementation<
  any,
  SelectionFeatureDef<any>,
  MainFeatureDef | TreeFeatureDef<any> | SelectionFeatureDef<any>
> = {
  key: "selection",

  getInitialState: (initialState) => ({
    selectedItems: [],
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => ({
    setSelectedItems: makeStateUpdater("selectedItems", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    selectedItems: "setSelectedItems",
  },

  treeInstance: {
    setSelectedItems: ({ tree }, selectedItems) => {
      tree.applySubStateUpdate("selectedItems", selectedItems);
    },

    // TODO memo
    getSelectedItems: ({ tree }) => {
      return tree.getState().selectedItems.map(tree.getItemInstance);
    },
  },

  itemInstance: {
    select: ({ tree, item }) => {
      const { selectedItems } = tree.getState();
      tree.setSelectedItems(
        selectedItems.includes(item.getItemMeta().itemId)
          ? selectedItems
          : [...selectedItems, item.getItemMeta().itemId],
      );
    },

    deselect: ({ tree, item }) => {
      const { selectedItems } = tree.getState();
      tree.setSelectedItems(
        selectedItems.filter((id) => id !== item.getItemMeta().itemId),
      );
    },

    isSelected: ({ tree, item }) => {
      const { selectedItems } = tree.getState();
      return selectedItems.includes(item.getItemMeta().itemId);
    },

    selectUpTo: ({ tree, item }, ctrl: boolean) => {
      const indexA = item.getItemMeta().index;
      // TODO dont use focused item as anchor, but last primary-clicked item
      const indexB = tree.getFocusedItem().getItemMeta().index;
      const [a, b] = indexA < indexB ? [indexA, indexB] : [indexB, indexA];
      const newSelectedItems = tree
        .getItems()
        .slice(a, b + 1)
        .map((treeItem) => treeItem.getItemMeta().itemId);

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

    toggleSelect: ({ item }) => {
      if (item.isSelected()) {
        item.deselect();
      } else {
        item.select();
      }
    },

    getProps: ({ tree, item, prev }) => ({
      ...prev?.(),
      "aria-selected": item.isSelected() ? "true" : "false",
      onClick: item.getMemoizedProp("selection/onClick", () => (e) => {
        if (e.shiftKey) {
          item.selectUpTo(e.ctrlKey || e.metaKey);
        } else if (e.ctrlKey || e.metaKey) {
          item.toggleSelect();
        } else {
          tree.setSelectedItems([item.getItemMeta().itemId]);
        }

        prev()?.onClick?.(e);
      }),
    }),
  },

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
    selectAll: {
      hotkey: "Control+a",
      preventDefault: true,
      handler: (e, tree) => {
        tree.setSelectedItems(tree.getItems().map((item) => item.getId()));
      },
    },
  },
};
