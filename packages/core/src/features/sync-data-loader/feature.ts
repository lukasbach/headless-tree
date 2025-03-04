import { FeatureImplementation } from "../../types/core";
import { makeStateUpdater } from "../../utils";

export const syncDataLoaderFeature: FeatureImplementation = {
  key: "sync-data-loader",

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
    waitForItemDataLoaded: async () => {},
    waitForItemChildrenLoaded: async () => {},

    retrieveItemData: ({ tree }, itemId) =>
      tree.getConfig().dataLoader!.getItem(itemId),

    retrieveChildrenIds: ({ tree }, itemId) =>
      tree.getConfig().dataLoader!.getChildren(itemId),
  },

  itemInstance: {
    isLoading: () => false,
  },
};
