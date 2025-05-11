import { FeatureImplementation } from "../../types/core";

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
      await tree.waitForItemChildrenLoaded(item.getId());
      await Promise.all(
        item.getChildren().map(async (child) => {
          await tree.waitForItemChildrenLoaded(item.getId());
          await child?.expandAll(cancelToken);
        }),
      );
    },

    collapseAll: ({ item }) => {
      if (!item.isExpanded()) return;
      for (const child of item.getChildren()) {
        child?.collapseAll();
      }
      item.collapse();
    },
  },

  hotkeys: {
    expandSelected: {
      hotkey: "Control+Shift+Plus",
      handler: async (_, tree) => {
        const cancelToken = { current: false };
        const cancelHandler = (e: KeyboardEvent) => {
          if (e.code === "Escape") {
            cancelToken.current = true;
          }
        };
        document.addEventListener("keydown", cancelHandler);
        await Promise.all(
          tree.getSelectedItems().map((item) => item.expandAll(cancelToken)),
        );
        document.removeEventListener("keydown", cancelHandler);
      },
    },

    collapseSelected: {
      hotkey: "Control+Shift+Minus",
      handler: (_, tree) => {
        tree.getSelectedItems().forEach((item) => item.collapseAll());
      },
    },
  },
};
