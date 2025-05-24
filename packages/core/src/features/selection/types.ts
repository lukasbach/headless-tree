import { ItemInstance, SetStateFn } from "../../types/core.js";

export type SelectionFeatureDef<T> = {
  state: {
    selectedItems: string[];
  };
  config: {
    setSelectedItems?: SetStateFn<string[]>;
  };
  treeInstance: {
    setSelectedItems: (selectedItems: string[]) => void;
    getSelectedItems: () => ItemInstance<T>[];
  };
  itemInstance: {
    select: () => void;
    deselect: () => void;
    toggleSelect: () => void;
    isSelected: () => boolean;
    selectUpTo: (ctrl: boolean) => void;
  };
  hotkeys:
    | "toggleSelectedItem"
    | "selectUpwards"
    | "selectDownwards"
    | "selectAll";
};
