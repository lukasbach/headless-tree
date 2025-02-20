import { FeatureImplementation } from "../../types/core";
import { poll } from "../../utils";

export const expandAllFeature: FeatureImplementation = {
  key: "expand-all",

  treeInstance: {
    expandAll: async ({ tree }, cancelToken) => {
      await Promise.all(
        tree.getItems().map((item) => item.expandAll(cancelToken)),
      );
    },

    collapseAll: ({ tree }) => {
      tree.applySubStateUpdate("expandedItems", []);
      tree.rebuildTree();
    },
  },

  itemInstance: {
    expandAll: async ({ tree, item }, cancelToken) => {
      if (cancelToken?.current) {
        return;
      }
      if (!item.isFolder()) {
        return;
      }

      item.expand();
      await poll(() => !tree.getState().loadingItems.includes(item.getId()));
      await Promise.all(
        item.getChildren().map(async (child) => {
          await poll(
            () => !tree.getState().loadingItems.includes(child.getId()),
          );
          await child?.expandAll(cancelToken);
        }),
      );
    },

    collapseAll: ({ item }) => {
      for (const child of item.getChildren()) {
        child?.collapseAll();
      }
      item.collapse();
    },
  },
};
