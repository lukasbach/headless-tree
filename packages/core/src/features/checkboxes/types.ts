import {
  type ItemInstance,
  SetStateFn,
  type TreeInstance,
} from "../../types/core";

export enum CheckedState {
  Checked = "checked",
  Unchecked = "unchecked",
  Indeterminate = "indeterminate",
}

export type CheckboxesFeatureDef<T> = {
  state: {
    checkedItems: string[];
  };
  config: {
    setCheckedItems?: SetStateFn<string[]>;
    canCheckFolders?: boolean;
    inferCheckedState?: (
      item: ItemInstance<T>,
      tree: TreeInstance<T>,
    ) => CheckedState;
    onToggleCheckedState?: (
      item: ItemInstance<T>,
      tree: TreeInstance<T>,
    ) => void;
  };
  treeInstance: {
    setCheckedItems: (checkedItems: string[]) => void;
  };
  itemInstance: {
    setChecked: () => void;
    setUnchecked: () => void;
    toggleCheckedState: () => void;
    getCheckedState: () => CheckedState;
    getCheckboxProps: () => Record<string, any>;
  };
  hotkeys: never;
};
