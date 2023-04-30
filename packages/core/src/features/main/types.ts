import {
  FeatureDef,
  ItemInstance,
  OnChangeFn,
  TreeConfig,
  TreeState,
} from "../../types/core";

export type MainFeature<T> = {
  state: {};
  config: {
    features?: FeatureDef<any>[];
    state?: TreeState<T>;
    onStateChange?: OnChangeFn<TreeState<T>>;
  };
  treeInstance: {
    setState: OnChangeFn<TreeState<T>>;
    getState: () => TreeState<T>;
    setConfig: OnChangeFn<TreeConfig<T>>;
    getConfig: () => TreeConfig<T>;
    getItemInstance: (itemId: string) => ItemInstance<T>;
  };
  itemInstance: {};
};
