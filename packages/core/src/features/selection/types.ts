import { ItemInstance, OnChangeFn } from "../../types/core";

export type SelectionFeatureDef<T> = {
  state: {
    selectedItems: string[];
  };
  config: {
    onChangeSelectedItems?: OnChangeFn<string[]>;
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
    | "toggleSelectItem"
    | "selectUpwards"
    | "selectDownwards"
    | "selectUpwardsCtrl"
    | "selectDownwardsCtrl"
    | "selectAll";
};
