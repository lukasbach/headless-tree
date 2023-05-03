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

  createTreeInstance: (prev, instance) => ({
    ...prev,

    retrieveItemData: (itemId) => {
      const config = instance.getConfig();
      return config.dataLoader.getItem(itemId);
    },

    retrieveChildrenIds: (itemId) => {
      const config = instance.getConfig();
      return config.dataLoader.getChildren(itemId);
    },
  }),

  createItemInstance: (prev) => ({
    ...prev,
    isLoading: () => false,
  }),
};
