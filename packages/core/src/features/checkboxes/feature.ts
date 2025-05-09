import { FeatureImplementation, TreeInstance } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { CheckedState } from "./types";

/*
 * Cases for checking:
 * - Check an unchecked item in an unchecked or indeterminate folder
 * - Check an explicitly unchecked item in a checked folder
 * - Check an unchecked folder in an unchecked or indeterminate folder
 *
 * Cases for unchecking:
 * - Uncheck a checked item in an indeterminate folder
 * - Uncheck an explicitly unchecked item in an checked folder
 */

const fetchAllDescendants = async <T>(
  tree: TreeInstance<T>,
  itemId: string,
): Promise<string[]> => {
  const children = await tree.loadChildrenIds(itemId);
  return [
    itemId,
    ...(
      await Promise.all(
        children.map((child) => fetchAllDescendants(tree, child)),
      )
    ).flat(),
  ];
};

const getAllLoadedDescendants = <T>(
  tree: TreeInstance<T>,
  itemId: string,
): string[] => {
  const children = tree.retrieveChildrenIds(itemId, true);
  return [
    itemId,
    ...children.map((child) => getAllLoadedDescendants(tree, child)).flat(),
  ];
};

export const checkboxesFeature: FeatureImplementation = {
  key: "checkboxes",

  overwrites: ["selection"],

  getInitialState: (initialState) => ({
    checkedItems: [],
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => ({
    setCheckedItems: makeStateUpdater("checkedItems", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    checkedItems: "setCheckedItems",
  },

  treeInstance: {
    setCheckedItems: ({ tree }, checkedItems) => {
      tree.applySubStateUpdate("checkedItems", checkedItems);
    },
  },

  itemInstance: {
    getCheckboxProps: ({ item, itemId }) => {
      const checkedState = item.getCheckedState();
      // console.log("prop", itemId, checkedState);
      return {
        onChange: item.toggleCheckedState,
        checked: checkedState === CheckedState.Checked,
        ref: (r: any) => {
          if (r) {
            // console.log("ref", itemId, checkedState);
            r.indeterminate = checkedState === CheckedState.Indeterminate;
          }
        },
      };
    },

    toggleCheckedState: async ({ item }) => {
      if (item.getCheckedState() === CheckedState.Checked) {
        await item.setUnchecked();
      } else {
        await item.setChecked();
      }
    },

    getCheckedState: ({ item, tree, itemId }) => {
      // TODO checkedcache
      const { checkedItems } = tree.getState();

      if (checkedItems.includes(itemId)) {
        return CheckedState.Checked;
      }

      if (item.isFolder()) {
        const descendants = getAllLoadedDescendants(tree, itemId);
        console.log("descendants of ", itemId, descendants);
        if (descendants.every((d) => checkedItems.includes(d))) {
          return CheckedState.Checked;
        }
        if (descendants.some((d) => checkedItems.includes(d))) {
          return CheckedState.Indeterminate;
        }
      }

      // if (
      //   item.isFolder() &&
      //   checkedItems.some((checkedItem) =>
      //     tree.getItemInstance(checkedItem)?.isDescendentOf(itemId),
      //   )
      // ) {
      //   // TODO for every descendent, not every checked item
      //   return checkedItems.every((checkedItem) =>
      //     tree.getItemInstance(checkedItem)?.isDescendentOf(itemId),
      //   )
      //     ? CheckedState.Checked
      //     : CheckedState.Indeterminate;
      // }

      return CheckedState.Unchecked;
    },

    setChecked: async ({ item, tree, itemId }) => {
      if (!item.isFolder() || tree.getConfig().canCheckFolders) {
        tree.applySubStateUpdate("checkedItems", (items) => [...items, itemId]);
      } else {
        const descendants = await fetchAllDescendants(tree, itemId);
        tree.applySubStateUpdate("checkedItems", (items) => [
          ...items,
          ...descendants,
        ]);
      }
    },

    setUnchecked: async ({ item, tree, itemId }) => {
      if (!item.isFolder() || tree.getConfig().canCheckFolders) {
        tree.applySubStateUpdate("checkedItems", (items) =>
          items.filter((id) => id !== itemId),
        );
      } else {
        await tree.loadChildrenIds(itemId);
        item.getChildren().forEach((item) => item.setUnchecked());
      }
    },
  },
};
