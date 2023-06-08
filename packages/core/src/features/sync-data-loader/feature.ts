import { FeatureImplementation } from "../../types/core";
import { SyncDataLoaderFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";

export const syncDataLoaderFeature: FeatureImplementation<
  any,
  SyncDataLoaderFeatureDef<any>,
  MainFeatureDef | SyncDataLoaderFeatureDef<any>
> = {
  key: "sync-data-loader",
  dependingFeatures: ["main"],

  getInitialState: (initialState) => ({
    loadingItems: [],
    ...initialState,
  }),

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
