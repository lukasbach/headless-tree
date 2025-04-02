import { FeatureImplementation } from "../../types/core";
import { PropMemoizationDataRef } from "./types";

const memoize = (
  props: Record<string, any>,
  memoizedProps: Record<string, any>,
) => {
  for (const key in props) {
    if (typeof props[key] === "function") {
      if (memoizedProps && key in memoizedProps) {
        props[key] = memoizedProps[key];
      } else {
        memoizedProps[key] = props[key];
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
      dataRef.current.memo ??= {};
      dataRef.current.memo.tree ??= {};
      return memoize(props, dataRef.current.memo.tree);
    },

    getSearchInputElementProps: ({ tree, prev }) => {
      const dataRef = tree.getDataRef<PropMemoizationDataRef>();
      const props = prev?.() ?? {};
      dataRef.current.memo ??= {};
      dataRef.current.memo.search ??= {};
      return memoize(props, dataRef.current.memo.search);
    },
  },

  itemInstance: {
    getProps: ({ item, prev }) => {
      const dataRef = item.getDataRef<PropMemoizationDataRef>();
      const props = prev?.() ?? {};
      dataRef.current.memo ??= {};
      dataRef.current.memo.item ??= {};
      return memoize(props, dataRef.current.memo.item);
    },

    getRenameInputProps: ({ item, prev }) => {
      const dataRef = item.getDataRef<PropMemoizationDataRef>();
      const props = prev?.() ?? {};
      dataRef.current.memo ??= {};
      dataRef.current.memo.rename ??= {};
      return memoize(props, dataRef.current.memo.rename);
    },
  },
};
