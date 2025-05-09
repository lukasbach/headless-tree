import { FeatureImplementation, TreeInstance } from "../../types/core";
import { AsyncDataLoaderDataRef } from "./types";
import { makeStateUpdater } from "../../utils";

const getDataRef = <T>(tree: TreeInstance<T>) => {
  const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
  dataRef.current.itemData ??= {};
  dataRef.current.childrenIds ??= {};
  return dataRef;
};

const loadItemData = async <T>(tree: TreeInstance<T>, itemId: string) => {
  const config = tree.getConfig();
  const dataRef = getDataRef(tree);

  const item = await config.dataLoader.getItem(itemId);
  dataRef.current.itemData[itemId] = item;
  config.onLoadedItem?.(itemId, item);
  tree.applySubStateUpdate("loadingItemData", (loadingItemData) =>
    loadingItemData.filter((id) => id !== itemId),
  );

  dataRef.current.awaitingItemDataLoading?.[itemId].forEach((cb) => cb());
  delete dataRef.current.awaitingItemDataLoading?.[itemId];
  return item;
};

const loadChildrenIds = async <T>(tree: TreeInstance<T>, itemId: string) => {
  const config = tree.getConfig();
  const dataRef = getDataRef(tree);
  let childrenIds: string[];

  // TODO is folder check?

  if ("getChildrenWithData" in config.dataLoader) {
    const children = await config.dataLoader.getChildrenWithData(itemId);
    childrenIds = children.map((c) => c.id);
    dataRef.current.childrenIds[itemId] = childrenIds;
    children.forEach(({ id, data }) => {
      dataRef.current.itemData[id] = data;
      config.onLoadedItem?.(id, data);
      dataRef.current.awaitingItemDataLoading?.[id].forEach((cb) => cb());
      delete dataRef.current.awaitingItemDataLoading?.[id];
    });

    config.onLoadedChildren?.(itemId, childrenIds);
    tree.rebuildTree();
    tree.applySubStateUpdate("loadingItemData", (loadingItemData) =>
      loadingItemData.filter((id) => !childrenIds.includes(id)),
    );
  } else {
    childrenIds = await config.dataLoader.getChildren(itemId);
    dataRef.current.childrenIds[itemId] = childrenIds;
    config.onLoadedChildren?.(itemId, childrenIds);
    tree.rebuildTree();
  }

  tree.applySubStateUpdate("loadingItemChildrens", (loadingItemChildrens) =>
    loadingItemChildrens.filter((id) => id !== itemId),
  );

  dataRef.current.awaitingItemChildrensLoading?.[itemId]?.forEach((cb) => cb());
  delete dataRef.current.awaitingItemChildrensLoading?.[itemId];
  return childrenIds;
};

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
      // TODO replace inner implementation with load() fns
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

    loadItemData: async ({ tree }, itemId) => {
      return (
        getDataRef(tree).current.itemData[itemId] ??
        (await loadItemData(tree, itemId))
      );
    },
    loadChildrenIds: async ({ tree }, itemId) => {
      return (
        getDataRef(tree).current.childrenIds[itemId] ??
        (await loadChildrenIds(tree, itemId))
      );
    },

    retrieveItemData: ({ tree }, itemId) => {
      const config = tree.getConfig();
      const dataRef = getDataRef(tree);

      if (dataRef.current.itemData[itemId]) {
        return dataRef.current.itemData[itemId];
      }

      if (!tree.getState().loadingItemData.includes(itemId)) {
        tree.applySubStateUpdate("loadingItemData", (loadingItemData) => [
          ...loadingItemData,
          itemId,
        ]);

        loadItemData(tree, itemId);
      }

      return config.createLoadingItemData?.() ?? null;
    },

    retrieveChildrenIds: ({ tree }, itemId) => {
      const dataRef = getDataRef(tree);
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

      loadChildrenIds(tree, itemId);

      return [];
    },
  },

  itemInstance: {
    isLoading: ({ tree, item }) =>
      tree.getState().loadingItemData.includes(item.getItemMeta().itemId) ||
      tree.getState().loadingItemChildrens.includes(item.getItemMeta().itemId),
    invalidateItemData: async ({ tree, itemId }, optimistic) => {
      if (!optimistic) {
        delete getDataRef(tree).current.itemData?.[itemId];
        tree.applySubStateUpdate("loadingItemData", (loadingItemData) => [
          ...loadingItemData,
          itemId,
        ]);
      }
      await loadItemData(tree, itemId);
    },
    invalidateChildrenIds: async ({ tree, itemId }, optimistic) => {
      if (!optimistic) {
        delete getDataRef(tree).current.childrenIds?.[itemId];
        tree.applySubStateUpdate(
          "loadingItemChildrens",
          (loadingItemChildrens) => [...loadingItemChildrens, itemId],
        );
      }
      await loadChildrenIds(tree, itemId);
    },
    updateCachedChildrenIds: ({ tree, itemId }, childrenIds) => {
      const dataRef = tree.getDataRef<AsyncDataLoaderDataRef>();
      dataRef.current.childrenIds[itemId] = childrenIds;
      tree.rebuildTree();
    },
  },
};
