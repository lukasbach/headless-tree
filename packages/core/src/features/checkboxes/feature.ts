import { type FeatureImplementation, TreeInstance } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { CheckedState } from "./types";

const getAllLoadedDescendants = <T>(
  tree: TreeInstance<T>,
  itemId: string,
  includeFolders = false,
): string[] => {
  if (!tree.getConfig().isItemFolder(tree.getItemInstance(itemId))) {
    return [itemId];
  }
  const descendants = tree
    .retrieveChildrenIds(itemId, true)
    .map((child) => getAllLoadedDescendants(tree, child, includeFolders))
    .flat();
  return includeFolders ? [itemId, ...descendants] : descendants;
};

const getAllDescendants = async <T>(
  tree: TreeInstance<T>,
  itemId: string,
  includeFolders = false,
): Promise<string[]> => {
  await tree.loadItemData(itemId);
  if (!tree.getConfig().isItemFolder(tree.getItemInstance(itemId))) {
    return [itemId];
  }
  const childrenIds = await tree.loadChildrenIds(itemId);
  const descendants = (
    await Promise.all(
      childrenIds.map((child) =>
        getAllDescendants(tree, child, includeFolders),
      ),
    )
  ).flat();
  return includeFolders ? [itemId, ...descendants] : descendants;
};

const withLoadingState = async <T>(
  tree: TreeInstance<T>,
  itemId: string,
  callback: () => Promise<void>,
) => {
  tree.applySubStateUpdate("loadingCheckPropagationItems", (items) => [
    ...items,
    itemId,
  ]);
  try {
    await callback();
  } finally {
    tree.applySubStateUpdate("loadingCheckPropagationItems", (items) =>
      items.filter((id) => id !== itemId),
    );
  }
};

export const checkboxesFeature: FeatureImplementation = {
  key: "checkboxes",

  overwrites: ["selection"],

  getInitialState: (initialState) => ({
    checkedItems: [],
    loadingCheckPropagationItems: [],
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => {
    const propagateCheckedState = defaultConfig.propagateCheckedState ?? true;
    const canCheckFolders =
      defaultConfig.canCheckFolders ?? !propagateCheckedState;
    return {
      setCheckedItems: makeStateUpdater("checkedItems", tree),
      setLoadingCheckPropagationItems: makeStateUpdater(
        "loadingCheckPropagationItems",
        tree,
      ),
      propagateCheckedState,
      canCheckFolders,
      ...defaultConfig,
    };
  },

  stateHandlerNames: {
    checkedItems: "setCheckedItems",
    loadingCheckPropagationItems: "setLoadingCheckPropagationItems",
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

    toggleCheckedState: async ({ item }) => {
      if (item.getCheckedState() === CheckedState.Checked) {
        await item.setUnchecked();
      } else {
        await item.setChecked();
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
        if (descendants.length === 0) return CheckedState.Unchecked;
        if (descendants.every((d) => checkedItems.includes(d))) {
          return CheckedState.Checked;
        }
        if (descendants.some((d) => checkedItems.includes(d))) {
          return CheckedState.Indeterminate;
        }
      }

      return CheckedState.Unchecked;
    },

    setChecked: async ({ item, tree, itemId }) => {
      await withLoadingState(tree, itemId, async () => {
        const { propagateCheckedState, canCheckFolders } = tree.getConfig();
        if (item.isFolder() && propagateCheckedState) {
          const descendants = await getAllDescendants(
            tree,
            itemId,
            canCheckFolders,
          );
          tree.applySubStateUpdate("checkedItems", (items) => [
            ...items,
            ...descendants,
          ]);
        } else if (!item.isFolder() || canCheckFolders) {
          tree.applySubStateUpdate("checkedItems", (items) => [
            ...items,
            itemId,
          ]);
        }
      });
    },

    setUnchecked: async ({ item, tree, itemId }) => {
      await withLoadingState(tree, itemId, async () => {
        const { propagateCheckedState, canCheckFolders } = tree.getConfig();
        if (item.isFolder() && propagateCheckedState) {
          const descendants = await getAllDescendants(
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
      });
    },
  },
};
