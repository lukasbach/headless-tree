import { FeatureImplementation, TreeInstance } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { CheckedState } from "./types";
import { throwError } from "../../utilities/errors";

const getAllLoadedDescendants = <T>(
  tree: TreeInstance<T>,
  itemId: string,
): string[] => {
  if (!tree.getConfig().isItemFolder(tree.buildItemInstance(itemId))) {
    return [itemId];
  }
  return tree
    .retrieveChildrenIds(itemId)
    .map((child) => getAllLoadedDescendants(tree, child))
    .flat();
};

export const checkboxesFeature: FeatureImplementation = {
  key: "checkboxes",

  overwrites: ["selection"],

  getInitialState: (initialState) => ({
    checkedItems: [],
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => {
    const hasAsyncLoader = defaultConfig.features?.some(
      (f) => f.key === "async-data-loader",
    );
    if (hasAsyncLoader && !defaultConfig.canCheckFolders) {
      throwError(`!canCheckFolders not supported with async trees`);
    }
    return {
      setCheckedItems: makeStateUpdater("checkedItems", tree),
      canCheckFolders: hasAsyncLoader ?? false,
      ...defaultConfig,
    };
  },

  stateHandlerNames: {
    checkedItems: "setCheckedItems",
  },

  treeInstance: {
    setCheckedItems: ({ tree }, checkedItems) => {
      tree.applySubStateUpdate("checkedItems", checkedItems);
    },
  },

  itemInstance: {
    getCheckboxProps: ({ item }) => {
      const checkedState = item.getCheckedState();
      return {
        onChange: item.toggleCheckedState,
        checked: checkedState === CheckedState.Checked,
        ref: (r: any) => {
          if (r) {
            r.indeterminate = checkedState === CheckedState.Indeterminate;
          }
        },
      };
    },

    toggleCheckedState: ({ item }) => {
      if (item.getCheckedState() === CheckedState.Checked) {
        item.setUnchecked();
      } else {
        item.setChecked();
      }
    },

    getCheckedState: ({ item, tree, itemId }) => {
      const { checkedItems } = tree.getState();

      if (checkedItems.includes(itemId)) {
        return CheckedState.Checked;
      }

      if (item.isFolder() && !tree.getConfig().canCheckFolders) {
        const descendants = getAllLoadedDescendants(tree, itemId);
        if (descendants.every((d) => checkedItems.includes(d))) {
          return CheckedState.Checked;
        }
        if (descendants.some((d) => checkedItems.includes(d))) {
          return CheckedState.Indeterminate;
        }
      }

      return CheckedState.Unchecked;
    },

    setChecked: ({ item, tree, itemId }) => {
      if (!item.isFolder() || tree.getConfig().canCheckFolders) {
        tree.applySubStateUpdate("checkedItems", (items) => [...items, itemId]);
      } else {
        tree.applySubStateUpdate("checkedItems", (items) => [
          ...items,
          ...getAllLoadedDescendants(tree, itemId),
        ]);
      }
    },

    setUnchecked: ({ item, tree, itemId }) => {
      if (!item.isFolder() || tree.getConfig().canCheckFolders) {
        tree.applySubStateUpdate("checkedItems", (items) =>
          items.filter((id) => id !== itemId),
        );
      } else {
        const descendants = getAllLoadedDescendants(tree, itemId);
        tree.applySubStateUpdate("checkedItems", (items) =>
          items.filter((id) => !descendants.includes(id)),
        );
      }
    },
  },
};
