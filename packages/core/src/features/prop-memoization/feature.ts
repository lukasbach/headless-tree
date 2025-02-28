import { FeatureImplementation } from "../../types/core";
import { PropMemoizationDataRef } from "./types";

const memoize = (
  props: Record<string, any>,
  dataRef: PropMemoizationDataRef,
) => {
  dataRef.memoizedProps ??= {};
  for (const key in props) {
    if (typeof props[key] === "function") {
      if (key in dataRef.memoizedProps) {
        props[key] = dataRef.memoizedProps[key];
      } else {
        dataRef.memoizedProps[key] = props[key];
      }
    }
  }
  return props;
};

export const propMemoizationFeature: FeatureImplementation = {
  key: "prop-memoization",

  overwrites: [
    "main",
    "async-data-loader",
    "sync-data-loader",
    "drag-and-drop",
    "expand-all",
    "hotkeys-core",
    "renaming",
    "search",
    "selection",
  ],

  treeInstance: {
    getContainerProps: ({ tree, prev }, treeLabel) => {
      const dataRef = tree.getDataRef<PropMemoizationDataRef>();
      const props = prev?.(treeLabel) ?? {};
      return memoize(props, dataRef.current);
    },
  },

  itemInstance: {
    getProps: ({ item, prev }) => {
      const dataRef = item.getDataRef<PropMemoizationDataRef>();
      const props = prev?.() ?? {};
      return memoize(props, dataRef.current);
    },
  },
};
