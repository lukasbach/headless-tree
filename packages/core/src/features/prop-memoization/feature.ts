import { FeatureImplementation } from "../../types/core";
import { PropMemoizationDataRef } from "./types";

const memoize = (
  props: Record<string, any>,
  dataRef: PropMemoizationDataRef,
) => {
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

  treeInstance: {
    getContainerProps: ({ tree, prev }) => {
      const dataRef = tree.getDataRef<PropMemoizationDataRef>();
      const props = prev?.() ?? {};
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
