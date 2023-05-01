import { OnChangeFn } from "../../types/core";

export type SelectionFeatureDef<T> = {
  state: {
    selectedItems: string[];
  };
  config: {
    onChangeSelectedItems?: OnChangeFn<string[]>;
  };
  treeInstance: {};
  itemInstance: {};
};
