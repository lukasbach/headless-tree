import { ItemInstance, SetStateFn } from "../../types/core";

export type RenamingFeatureDef<T> = {
  state: {
    renamingItem?: string | null;
    renamingValue?: string;
  };
  config: {
    setRenamingItem?: SetStateFn<string | null | undefined>;
    setRenamingValue?: SetStateFn<string | undefined>;
    canRename?: (item: ItemInstance<T>) => boolean;
    onRename?: (item: ItemInstance<T>, value: string) => void;
  };
  treeInstance: {
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
    startRenaming: () => void;
  };
  hotkeys: "renameItem" | "abortRenaming" | "completeRenaming";
};
