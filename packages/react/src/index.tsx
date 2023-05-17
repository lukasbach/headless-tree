import { useState } from "react";
import { createTree, TreeConfig } from "@headless-tree/core";

export const useTree = <T,>(config: TreeConfig<T>) => {
  const [tree] = useState(() => ({ current: createTree(config) }));
  // TODO initial state
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
