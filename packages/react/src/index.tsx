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
    onStateChange: (state) => {
      setState(state);
      config.onStateChange?.(state);
    },
  }));

  return tree.current;
};
