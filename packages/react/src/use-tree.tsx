import { useEffect, useState } from "react";
import { TreeConfig, TreeState, createTree } from "@headless-tree/core";

export const useTree = <T,>(config: TreeConfig<T>) => {
  const [tree] = useState(() => ({ current: createTree(config) }));
  const [state, setState] = useState<Partial<TreeState<T>>>(() =>
    tree.current.getState(),
  );

  useEffect(() => {
    (tree.current as any).setMounted(true);
    tree.current.rebuildTree();
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      (tree.current as any).setMounted(false);
    };
  }, [tree]);

  tree.current.setConfig((prev) => ({
    ...prev,
    ...config,
    state: {
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
