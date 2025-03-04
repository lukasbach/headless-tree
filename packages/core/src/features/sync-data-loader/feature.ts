import { FeatureImplementation } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { throwError } from "../../utilities/errors";

const promiseErrorMessage = "sync dataLoader returned promise";

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

    retrieveItemData: ({ tree }, itemId) => {
      const data = tree.getConfig().dataLoader.getItem(itemId);
      if (typeof data === "object" && "then" in data) {
        throw throwError(promiseErrorMessage);
      }
      return data;
    },

    retrieveChildrenIds: ({ tree }, itemId) => {
      const data = tree.getConfig().dataLoader.getChildren(itemId);
      if (typeof data === "object" && "then" in data) {
        throw throwError(promiseErrorMessage);
      }
      return data;
    },
  },

  itemInstance: {
    isLoading: () => false,
  },
};
