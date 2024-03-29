import { ItemInstance, SetStateFn } from "../../types/core";

export type RenamingFeatureDef<T> = {
  state: {
    renamingItem?: string | null;
    renamingValue?: string;
  };
  config: {
    setRenamingItem?: SetStateFn<string | null>;
    setRenamingValue?: SetStateFn<string | undefined>;
    canRename?: (item: ItemInstance<T>) => boolean;
    onRename?: (item: ItemInstance<T>, value: string) => void;
  };
  treeInstance: {
    startRenamingItem: (itemId: string) => void;
    getRenamingItem: () => ItemInstance<T> | null;
    getRenamingValue: () => string;
    abortRenaming: () => void;
    completeRenaming: () => void;
    isRenamingItem: () => boolean;
  };
  itemInstance: {
    getRenameInputProps: () => any;
    canRename: () => boolean;
    isRenaming: () => boolean;
  };
  hotkeys: "renameItem" | "abortRenaming" | "completeRenaming";
};
