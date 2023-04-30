import { FeatureDef } from "../../types/core";
import { TreeFeature } from "./types";
import { memo } from "../../utils";

export const treeFeature: FeatureDef<TreeFeature<any>> = {
  getInitialState: (initialState) => ({
    expandedItems: [],
    focusedItem: null,
    ...initialState,
  }),

  createTreeInstance: (instance, config, state) => ({
    ...instance,
    getFlatItems: memo(() => {
      // instance.getState().expandedItems;
      return [];
    }, [instance.getState().expandedItems]),
  }),

  createItemInstance: (config, tree) => ({}),

  getItemProps: (itemData, item, tree) => ({
    role: "treeitem",
    ariaSetSize: 0,
    ariaPosinset: 0,
    ariaSelected: false,
    ariaLabel: "",
    ariaLevel: 0,
    tabIndex: 0,
  }),
  getContainerProps: (instance) => ({
    role: "tree",
    ariaLabel: "",
    ariaActivedescendant: "",
  }),
};
