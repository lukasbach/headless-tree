import { useEffect, useInsertionEffect, useState } from "react";
import { TreeConfig, TreeState, createTree } from "@headless-tree/core";

export const useTree = <T,>(config: TreeConfig<T>) => {
  const [tree] = useState(() => ({ current: createTree(config) }));
  const [state, setState] = useState<Partial<TreeState<T>>>(() =>
    tree.current.getState(),
  );

  useEffect(() => {
    tree.current.rebuildTree();
  }, [tree]); // runs only once after mount

  useInsertionEffect(() => {
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
  });

  return tree.current;
};
