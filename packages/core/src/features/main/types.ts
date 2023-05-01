import {
  ItemInstance,
  OnChangeFn,
  TreeConfig,
  TreeState,
} from "../../types/core";

export type MainFeatureDef<T = any> = {
  state: {};
  config: {
    state?: Partial<TreeState<T>>;
    onStateChange?: OnChangeFn<TreeState<T>>;
  };
  treeInstance: {
    setState: OnChangeFn<TreeState<T>>;
    getState: () => TreeState<T>;
    setConfig: OnChangeFn<TreeConfig<T>>;
    getConfig: () => TreeConfig<T>;
    getItemInstance: (itemId: string) => ItemInstance<T>;
    getItems: () => ItemInstance<T>[];
  };
  itemInstance: {};
};
