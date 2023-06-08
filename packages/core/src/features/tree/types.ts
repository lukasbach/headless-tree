import { ItemInstance, SetStateFn, TreeInstance } from "../../types/core";

export type ItemMeta = {
  itemId: string;
  parentId: string;
  level: number;
  index: number;
  setSize: number;
  posInSet: number;
};

export type TreeItemDataRef = {
  memoizedValues: Record<string, any>;
  memoizedDeps: Record<string, any[] | undefined>;
};

export type TreeFeatureDef<T> = {
  state: {
    expandedItems: string[];
    focusedItem: string | null;
  };
  config: {
    isItemFolder: (item: ItemInstance<T>) => boolean;
    getItemName: (item: ItemInstance<T>) => string;

    onPrimaryAction?: (item: ItemInstance<T>) => void;
    scrollToItem?: (item: ItemInstance<T>) => void;

    setExpandedItems?: SetStateFn<string[]>;
    setFocusedItem?: SetStateFn<string | null>;
  };
  treeInstance: {
    /** @internal */
    getItemsMeta: () => ItemMeta[];

    expandItem: (itemId: string) => void;
    collapseItem: (itemId: string) => void;
    isItemExpanded: (itemId: string) => boolean;

    focusItem: (itemId: string) => void;
    getFocusedItem: () => ItemInstance<any>;
    focusNextItem: () => void;
    focusPreviousItem: () => void;
    updateDomFocus: () => void;

    getContainerProps: () => Record<string, any>;
  };
  itemInstance: {
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
    getParent: () => ItemInstance<T>;
    getChildren: () => ItemInstance<T>[];
    getIndexInParent: () => number;
    primaryAction: () => void;
    getTree: () => TreeInstance<T>;
    getItemAbove: () => ItemInstance<T> | null;
    getItemBelow: () => ItemInstance<T> | null;
    getMemoizedProp: <X>(name: string, create: () => X, deps?: any[]) => X;
    scrollTo: (
      scrollIntoViewArg?: boolean | ScrollIntoViewOptions
    ) => Promise<void>;
  };
  hotkeys:
    | "focusNextItem"
    | "focusPreviousItem"
    | "expandOrDown"
    | "collapseOrUp"
    | "focusFirstItem"
    | "focusLastItem";
};
