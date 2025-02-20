import { FeatureImplementation } from "../../types/core";
import { makeStateUpdater } from "../../utils";

export const syncDataLoaderFeature: FeatureImplementation = {
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
