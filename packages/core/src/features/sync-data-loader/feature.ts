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

  createTreeInstance: (prev, instance) => ({
    ...prev,

    retrieveItemData: (itemId) =>
      instance.getConfig().dataLoader!.getItem(itemId),

    retrieveChildrenIds: (itemId) =>
      instance.getConfig().dataLoader!.getChildren(itemId),
  }),

  createItemInstance: (prev) => ({
    ...prev,
    isLoading: () => false,
  }),
};
