import { FeatureImplementation } from "../../types/core";
import { AsyncDataLoaderFeatureDef, AsyncDataLoaderRef } from "./types";
import { MainFeatureDef } from "../main/types";
import { makeStateUpdater } from "../../utils";
import { TreeFeatureDef } from "../tree/types";

export const asyncDataLoaderFeature: FeatureImplementation<
  any,
  AsyncDataLoaderFeatureDef<any>,
  MainFeatureDef | TreeFeatureDef<any> | AsyncDataLoaderFeatureDef<any>
> = {
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

  createTreeInstance: (prev, instance) => ({
    ...prev,

    retrieveItemData: (itemId) => {
      const config = instance.getConfig();
      const dataRef = instance.getDataRef<AsyncDataLoaderRef>();
      dataRef.current.itemData ??= {};
      dataRef.current.childrenIds ??= {};

      if (dataRef.current.itemData[itemId]) {
        return dataRef.current.itemData[itemId];
      }

      if (!instance.getState().loadingItems.includes(itemId)) {
        instance.applySubStateUpdate("loadingItems", (loadingItems) => [
          ...loadingItems,
          itemId,
        ]);
        config.asyncDataLoader?.getItem(itemId).then((item) => {
          dataRef.current.itemData[itemId] = item;
          config.onLoadedItem?.(itemId, item);
          instance.applySubStateUpdate("loadingItems", (loadingItems) =>
            loadingItems.filter((id) => id !== itemId),
          );
        });
      }

      return config.createLoadingItemData?.() ?? null;
    },

    retrieveChildrenIds: (itemId) => {
      const config = instance.getConfig();
      const dataRef = instance.getDataRef<AsyncDataLoaderRef>();
      dataRef.current.itemData ??= {};
      dataRef.current.childrenIds ??= {};
      if (dataRef.current.childrenIds[itemId]) {
        return dataRef.current.childrenIds[itemId];
      }

      if (instance.getState().loadingItems.includes(itemId)) {
        return [];
      }

      instance.applySubStateUpdate("loadingItems", (loadingItems) => [
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
          instance.applySubStateUpdate("loadingItems", (loadingItems) =>
            loadingItems.filter((id) => id !== itemId),
          );
          instance.rebuildTree();
        });
      } else {
        config.asyncDataLoader?.getChildren(itemId).then((childrenIds) => {
          dataRef.current.childrenIds[itemId] = childrenIds;
          config.onLoadedChildren?.(itemId, childrenIds);
          instance.applySubStateUpdate("loadingItems", (loadingItems) =>
            loadingItems.filter((id) => id !== itemId),
          );
          instance.rebuildTree();
        });
      }

      return [];
    },

    invalidateItemData: (itemId) => {
      const dataRef = instance.getDataRef<AsyncDataLoaderRef>();
      delete dataRef.current.itemData?.[itemId];
      instance.retrieveItemData(itemId);
    },

    invalidateChildrenIds: (itemId) => {
      const dataRef = instance.getDataRef<AsyncDataLoaderRef>();
      delete dataRef.current.childrenIds?.[itemId];
      instance.retrieveChildrenIds(itemId);
    },
  }),

  createItemInstance: (prev, item, tree) => ({
    ...prev,
    isLoading: () =>
      tree.getState().loadingItems.includes(item.getItemMeta().itemId),
    invalidateItemData: () =>
      tree.invalidateItemData(item.getItemMeta().itemId),
    invalidateChildrenIds: () =>
      tree.invalidateChildrenIds(item.getItemMeta().itemId),
  }),
};
