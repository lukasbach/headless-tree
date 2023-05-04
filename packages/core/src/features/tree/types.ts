import { ItemInstance, OnChangeFn } from "../../types/core";

export type ItemMeta<T> = {
  itemId: string;
  parentId: string;
  level: number;
  index: number;
  setSize: number;
  posInSet: number;
};

export type TreeFeatureDef<T> = {
  state: {
    expandedItems: string[];
    focusedItem: string | null;
  };
  config: {
    isItemFolder: (item: T) => boolean;
    getItemName: (item: T) => string;

    onChangeExpandedItems?: OnChangeFn<string[]>;
    onChangeFocusedItem?: OnChangeFn<string | null>;
  };
  treeInstance: {
    /** @internal */
    getItemsMeta: () => ItemMeta<T>[];

    expandItem: (itemId: string) => void;
    collapseItem: (itemId: string) => void;
    isItemExpanded: (itemId: string) => boolean;

    focusItem: (itemId: string) => void;
    getFocusedItem: () => ItemInstance<any>;
    focusNextItem: () => void;
    focusPreviousItem: () => void;
    updateDomFocus: (scrollIntoView?: boolean) => void;

    getContainerProps: () => Record<string, any>;
  };
  itemInstance: {
    getItemMeta: () => ItemMeta<T>;
    getId: () => string;
    getProps: () => Record<string, any>;
    getItemName: () => string;
    getItemData: () => T;
    expand: () => void;
    collapse: () => void;
    isExpanded: () => boolean;
    isFocused: () => boolean;
    isFolder: () => boolean;
    setFocused: () => void;
    getParent: () => ItemInstance<T> | null;
    getIndexInParent: () => number;
  };
  hotkeys:
    | "focusNextItem"
    | "focusPreviousItem"
    | "expandOrDown"
    | "collapseOrUp";
};
