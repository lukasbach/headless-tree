import { OnChangeFn } from "../../types/core";

export type SelectionFeature<T> = {
  state: {
    selectedItems: string[];
  };
  config: {
    onChangeSelectedItems: OnChangeFn<string[]>;
  };
  treeInstance: {};
  itemInstance: {};
};
