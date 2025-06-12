import { SetStateFn } from "../../types/core";

export type CheckboxesState = {
  // TODO uncheckedFolders!??
  // add uncheckedFolders, then just do the trivial state update and have a seperate "simplifier" method
  checkedItems?: string[];
  uncheckedItems?: string[];
  checkedFolders?: string[];
  indeterminates?: string[];
};

export enum CheckedState {
  Checked = "checked",
  Unchecked = "unchecked",
  Indeterminate = "indeterminate",
}

export type CheckboxesFeatureDef<T> = {
  state: {
    checkedState: CheckboxesState;
  };
  config: {
    setCheckedState?: SetStateFn<CheckboxesState>;
    inheritCheckedState?: boolean;
  };
  treeInstance: {
    setCheckedState: (checkedState: CheckboxesState) => void;
    getCheckedItemIds: () => string[];
  };
  itemInstance: {
    setChecked: (inherit?: boolean) => void;
    setUnchecked: (inherit?: boolean) => void;
    toggleCheckedState: () => void;
    getCheckedState: () => CheckedState;
    getCheckboxProps: () => Record<string, any>;
  };
  hotkeys: never;
};
