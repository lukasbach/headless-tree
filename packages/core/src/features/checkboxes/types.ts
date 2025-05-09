import { SetStateFn } from "../../types/core";

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
