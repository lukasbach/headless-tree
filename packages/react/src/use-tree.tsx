import { useEffect, useRef, useState } from "react";
import { TreeConfig, TreeState, createTree } from "@headless-tree/core";

/* A bug with NextJS was reported in the past where very quick state updates (i.e. data
 * loader returning withing milliseconds) will cause the state update to occur before
 * mount, resulting in a console warning. This alleviates this.
 * We should monitor if this remains a problem in the future, maybe we can eventually
 * remove this workaround...
 */
const useApplyAfterMount = () => {
  const isMounted = useRef(false);
  const callbacks = useRef<(() => void)[]>([]);

  useEffect(() => {
    isMounted.current = true;
    callbacks.current.forEach((callback) => callback());
  }, []);

  const apply = (callback: () => void) => {
    if (isMounted.current) {
      callback();
    } else {
      callbacks.current.push(callback);
    }
  };

  return apply;
};

export const useTree = <T,>(config: TreeConfig<T>) => {
  const apply = useApplyAfterMount();
  const [tree] = useState(() => ({ current: createTree(config) }));
  const [state, setState] = useState<Partial<TreeState<T>>>(() =>
    tree.current.getState(),
  );

  useEffect(() => {
    tree.current.rebuildTree();
  }, [tree]); // runs only once after mount

  tree.current.setConfig((prev) => ({
    ...prev,
    ...config,
    state: {
      ...state,
      ...config.state,
    },
    setState: (state) => {
      apply(() => {
        setState(state);
        config.setState?.(state);
      });
    },
  }));

  return tree.current;
};
