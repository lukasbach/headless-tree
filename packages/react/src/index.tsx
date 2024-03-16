import { useState } from "react";
import { TreeConfig, createTree } from "@headless-tree/core";

export const useTree = <T,>(config: TreeConfig<T>) => {
  const [tree] = useState(() => ({ current: createTree(config) }));
  const [state, setState] = useState(() => tree.current.getState());

  tree.current.setConfig((prev) => ({
    ...prev,
    ...config,
    state: {
      // ...prev.state,
      ...state,
      ...config.state,
    },
    setState: (state) => {
      setState(state);
      config.setState?.(state);
    },
  }));

  return tree.current;
};
