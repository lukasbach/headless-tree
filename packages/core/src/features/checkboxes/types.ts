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
    propagateCheckedState?: boolean;
  };
  treeInstance: {
    setCheckedItems: (checkedItems: string[]) => void;
  };
  itemInstance: {
    /** Will recursively load descendants if propagateCheckedState=true and async data loader is used. If not,
     * this will return immediately. */
    setChecked: () => Promise<void>;

    /** Will recursively load descendants if propagateCheckedState=true and async data loader is used. If not,
     * this will return immediately. */
    setUnchecked: () => Promise<void>;

    /** Will recursively load descendants if propagateCheckedState=true and async data loader is used. If not,
     * this will return immediately. */
    toggleCheckedState: () => Promise<void>;

    getCheckedState: () => CheckedState;
    getCheckboxProps: () => Record<string, any>;
  };
  hotkeys: never;
};
