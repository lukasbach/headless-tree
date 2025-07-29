import { FeatureImplementation, TreeInstance } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { CheckedState } from "./types";
import { throwError } from "../../utilities/errors";

const getAllLoadedDescendants = <T>(
  tree: TreeInstance<T>,
  itemId: string,
  includeFolders = false,
): string[] => {
  if (!tree.getConfig().isItemFolder(tree.getItemInstance(itemId))) {
    return [itemId];
  }
  const descendants = tree
    .retrieveChildrenIds(itemId)
    .map((child) => getAllLoadedDescendants(tree, child, includeFolders))
    .flat();
  return includeFolders ? [itemId, ...descendants] : descendants;
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
    if (hasAsyncLoader && defaultConfig.propagateCheckedState) {
      throwError(`propagateCheckedState not supported with async trees`);
    }
    const propagateCheckedState =
      defaultConfig.propagateCheckedState ?? !hasAsyncLoader;
    const canCheckFolders =
      defaultConfig.canCheckFolders ?? !propagateCheckedState;
    return {
      setCheckedItems: makeStateUpdater("checkedItems", tree),
      propagateCheckedState,
      canCheckFolders,
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

    getCheckedState: ({ item, tree }) => {
      const { checkedItems } = tree.getState();
      const { propagateCheckedState } = tree.getConfig();
      const itemId = item.getId();

      if (checkedItems.includes(itemId)) {
        return CheckedState.Checked;
      }

      if (item.isFolder() && propagateCheckedState) {
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
      const { propagateCheckedState, canCheckFolders } = tree.getConfig();
      if (item.isFolder() && propagateCheckedState) {
        tree.applySubStateUpdate("checkedItems", (items) => [
          ...items,
          ...getAllLoadedDescendants(tree, itemId, canCheckFolders),
        ]);
      } else if (!item.isFolder() || canCheckFolders) {
        tree.applySubStateUpdate("checkedItems", (items) => [...items, itemId]);
      }
    },

    setUnchecked: ({ item, tree, itemId }) => {
      const { propagateCheckedState, canCheckFolders } = tree.getConfig();
      if (item.isFolder() && propagateCheckedState) {
        const descendants = getAllLoadedDescendants(
          tree,
          itemId,
          canCheckFolders,
        );
        tree.applySubStateUpdate("checkedItems", (items) =>
          items.filter((id) => !descendants.includes(id) && id !== itemId),
        );
      } else {
        tree.applySubStateUpdate("checkedItems", (items) =>
          items.filter((id) => id !== itemId),
        );
      }
    },
  },
};
