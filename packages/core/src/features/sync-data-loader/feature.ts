import { FeatureImplementation } from "../../types/core";
import { SyncDataLoaderFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { makeStateUpdater } from "../../utils";

export const syncDataLoaderFeature: FeatureImplementation<
  any,
  SyncDataLoaderFeatureDef<any>,
  MainFeatureDef | SyncDataLoaderFeatureDef<any>
> = {
  key: "sync-data-loader",

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
    retrieveItemData: ({ tree }, itemId) =>
      tree.getConfig().dataLoader!.getItem(itemId),

    retrieveChildrenIds: ({ tree }, itemId) =>
      tree.getConfig().dataLoader!.getChildren(itemId),
  },

  itemInstance: {
    isLoading: () => false,
  },
};
