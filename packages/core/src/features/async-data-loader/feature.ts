import { FeatureImplementation } from "../../types/core";
import { AsyncDataLoaderDataRef } from "./types";
import { makeStateUpdater } from "../../utils";

export const asyncDataLoaderFeature: FeatureImplementation = {
  key: "async-data-loader",

  getInitialState: (initialState) => ({
    loadingItemData: [],
    loadingItemChildrens: [],
    ...initialState,
  }),

  getDefaultConfig: (defaultConfig, tree) => ({
    setLoadingItemData: makeStateUpdater("loadingItemData", tree),
    setLoadingItemChildrens: makeStateUpdater("loadingItemChildrens", tree),
    ...defaultConfig,
  }),

  stateHandlerNames: {
    loadingItemData: "setLoadingItemData",
    loadingItemChildrens: "setLoadingItemChildrens",
  },

  treeInstance: {
    waitForItemDataLoaded: async ({ tree }, itemId) => {
      tree.retrieveItemData(itemId);
      if (!tree.getState().loadingItemData.includes(itemId)) {
        return;
      }
      await new Promise<void>((resolve) => {
        const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
        dataRef.current.awaitingItemDataLoading ??= {};
        dataRef.current.awaitingItemDataLoading[itemId] ??= [];
        dataRef.current.awaitingItemDataLoading[itemId].push(resolve);
      });
    },

    waitForItemChildrenLoaded: async ({ tree }, itemId) => {
      tree.retrieveChildrenIds(itemId);
      if (!tree.getState().loadingItemChildrens.includes(itemId)) {
        return;
      }
      await new Promise<void>((resolve) => {
        const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
        dataRef.current.awaitingItemChildrensLoading ??= {};
        dataRef.current.awaitingItemChildrensLoading[itemId] ??= [];
        dataRef.current.awaitingItemChildrensLoading[itemId].push(resolve);
      });
    },

    retrieveItemData: ({ tree }, itemId) => {
      const config = tree.getConfig();
      const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
      dataRef.current.itemData ??= {};
      dataRef.current.childrenIds ??= {};

      if (dataRef.current.itemData[itemId]) {
        return dataRef.current.itemData[itemId];
      }

      if (!tree.getState().loadingItemData.includes(itemId)) {
        tree.applySubStateUpdate("loadingItemData", (loadingItemData) => [
          ...loadingItemData,
          itemId,
        ]);

        (async () => {
          const item = await config.dataLoader.getItem(itemId);
          dataRef.current.itemData[itemId] = item;
          config.onLoadedItem?.(itemId, item);
          tree.applySubStateUpdate("loadingItemData", (loadingItemData) =>
            loadingItemData.filter((id) => id !== itemId),
          );

          dataRef.current.awaitingItemDataLoading?.[itemId].forEach((cb) =>
            cb(),
          );
          delete dataRef.current.awaitingItemDataLoading?.[itemId];
        })();
      }

      return config.createLoadingItemData?.() ?? null;
    },

    retrieveChildrenIds: ({ tree }, itemId) => {
      const config = tree.getConfig();
      const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
      dataRef.current.childrenIds ??= {};
      if (dataRef.current.childrenIds[itemId]) {
        return dataRef.current.childrenIds[itemId];
      }

      if (tree.getState().loadingItemChildrens.includes(itemId)) {
        return [];
      }

      tree.applySubStateUpdate(
        "loadingItemChildrens",
        (loadingItemChildrens) => [...loadingItemChildrens, itemId],
      );

      (async () => {
        const childrenIds = await config.dataLoader.getChildren(itemId);
        dataRef.current.childrenIds[itemId] = childrenIds;
        config.onLoadedChildren?.(itemId, childrenIds);
        tree.applySubStateUpdate(
          "loadingItemChildrens",
          (loadingItemChildrens) =>
            loadingItemChildrens.filter((id) => id !== itemId),
        );
        tree.rebuildTree();

        dataRef.current.awaitingItemChildrensLoading?.[itemId]?.forEach((cb) =>
          cb(),
        );
        delete dataRef.current.awaitingItemChildrensLoading?.[itemId];
      })();

      return [];
    },
  },

  itemInstance: {
    isLoading: ({ tree, item }) =>
      tree.getState().loadingItemData.includes(item.getItemMeta().itemId) ||
      tree.getState().loadingItemChildrens.includes(item.getItemMeta().itemId),
    invalidateItemData: ({ tree, itemId }) => {
      const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
      delete dataRef.current.itemData?.[itemId];
      tree.retrieveItemData(itemId);
    },
    invalidateChildrenIds: ({ tree, itemId }) => {
      const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
      delete dataRef.current.childrenIds?.[itemId];
      tree.retrieveChildrenIds(itemId);
    },
    updateCachedChildrenIds: ({ tree, itemId }, childrenIds) => {
      const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
      dataRef.current.childrenIds[itemId] = childrenIds;
      tree.rebuildTree();
    },
  },
};
