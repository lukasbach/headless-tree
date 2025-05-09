import { FeatureImplementation } from "../../types/core";
import { makeStateUpdater } from "../../utils";
import { throwError } from "../../utilities/errors";

const promiseErrorMessage = "sync dataLoader returned promise";
const unpromise = <T>(data: T | Promise<T>): T => {
  if (!data || (typeof data === "object" && "then" in data)) {
    throw throwError(promiseErrorMessage);
  }
  return data;
};

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
      return unpromise(tree.getConfig().dataLoader.getItem(itemId));
    },

    retrieveChildrenIds: ({ tree }, itemId) => {
      const { dataLoader } = tree.getConfig();
      if ("getChildren" in dataLoader) {
        return unpromise(dataLoader.getChildren(itemId));
      }
      return unpromise(dataLoader.getChildrenWithData(itemId)).map(
        (c) => c.data,
      );
    },

    loadItemData: ({ tree }, itemId) => tree.retrieveItemData(itemId),
    loadChildrenIds: ({ tree }, itemId) => tree.retrieveChildrenIds(itemId),
  },

  itemInstance: {
    isLoading: () => false,
  },
};
