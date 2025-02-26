import { FeatureImplementation } from "../../types/core";
import { AsyncDataLoaderRef } from "./types";
import { makeStateUpdater } from "../../utils";

export const asyncDataLoaderFeature: FeatureImplementation = {
  key: "async-data-loader",

  getInitialState: (initialState) => ({
    loadingItems: [],
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => ({
    setLoadingItems: makeStateUpdater("loadingItems", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    loadingItems: "setLoadingItems",
  },

  treeInstance: {
    retrieveItemData: ({ tree }, itemId) => {
      const config = tree.getConfig();
      const dataRef = tree.getDataRef<AsyncDataLoaderRef>();
      dataRef.current.itemData ??= {};
      dataRef.current.childrenIds ??= {};

      if (dataRef.current.itemData[itemId]) {
        return dataRef.current.itemData[itemId];
      }

      if (!tree.getState().loadingItems.includes(itemId)) {
        tree.applySubStateUpdate("loadingItems", (loadingItems) => [
          ...loadingItems,
          itemId,
        ]);
        config.asyncDataLoader?.getItem(itemId).then((item) => {
          dataRef.current.itemData[itemId] = item;
          config.onLoadedItem?.(itemId, item);
          tree.applySubStateUpdate("loadingItems", (loadingItems) =>
            loadingItems.filter((id) => id !== itemId),
          );
        });
      }

      return config.createLoadingItemData?.() ?? null;
    },

    retrieveChildrenIds: ({ tree }, itemId) => {
      const config = tree.getConfig();
      const dataRef = tree.getDataRef<AsyncDataLoaderRef>();
      dataRef.current.itemData ??= {};
      dataRef.current.childrenIds ??= {};
      if (dataRef.current.childrenIds[itemId]) {
        return dataRef.current.childrenIds[itemId];
      }

      if (tree.getState().loadingItems.includes(itemId)) {
        return [];
      }

      tree.applySubStateUpdate("loadingItems", (loadingItems) => [
        ...loadingItems,
        itemId,
      ]);

      if (config.asyncDataLoader?.getChildrenWithData) {
        config.asyncDataLoader?.getChildrenWithData(itemId).then((children) => {
          for (const { id, data } of children) {
            dataRef.current.itemData[id] = data;
            config.onLoadedItem?.(id, data);
          }
          const childrenIds = children.map(({ id }) => id);
          dataRef.current.childrenIds[itemId] = childrenIds;
          config.onLoadedChildren?.(itemId, childrenIds);
          tree.applySubStateUpdate("loadingItems", (loadingItems) =>
            loadingItems.filter((id) => id !== itemId),
          );
          tree.rebuildTree();
        });
      } else {
        config.asyncDataLoader?.getChildren(itemId).then((childrenIds) => {
          dataRef.current.childrenIds[itemId] = childrenIds;
          config.onLoadedChildren?.(itemId, childrenIds);
          tree.applySubStateUpdate("loadingItems", (loadingItems) =>
            loadingItems.filter((id) => id !== itemId),
          );
          tree.rebuildTree();
        });
      }

      return [];
    },
  },

  itemInstance: {
    isLoading: ({ tree, item }) =>
      tree.getState().loadingItems.includes(item.getItemMeta().itemId),
    invalidateItemData: ({ tree, itemId }) => {
      const dataRef = tree.getDataRef<AsyncDataLoaderRef>();
      delete dataRef.current.itemData?.[itemId];
      tree.retrieveItemData(itemId);
    },
    invalidateChildrenIds: ({ tree, itemId }) => {
      const dataRef = tree.getDataRef<AsyncDataLoaderRef>();
      delete dataRef.current.childrenIds?.[itemId];
      tree.retrieveChildrenIds(itemId);
    },
    updateCachedChildrenIds: ({ tree, itemId }, childrenIds) => {
      const dataRef = tree.getDataRef<AsyncDataLoaderRef>();
      dataRef.current.childrenIds[itemId] = childrenIds;
      tree.rebuildTree();
    },
  },
};
