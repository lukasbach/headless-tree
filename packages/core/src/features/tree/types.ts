import { ItemInstance, SetStateFn, TreeInstance } from "../../types/core";

export interface ItemMeta {
  itemId: string;
  parentId: string;
  level: number;
  index: number;
  setSize: number;
  posInSet: number;
}

export interface TreeItemDataRef {
  memoizedValues: Record<string, any>;
  memoizedDeps: Record<string, any[] | undefined>;
}

export type TreeFeatureDef<T> = {
  state: {
    expandedItems: string[];
    focusedItem: string | null;
  };
  config: {
    isItemFolder: (item: ItemInstance<T>) => boolean; // TODO:breaking use item data as payload
    getItemName: (item: ItemInstance<T>) => string;

    onPrimaryAction?: (item: ItemInstance<T>) => void;
    scrollToItem?: (item: ItemInstance<T>) => void;

    setExpandedItems?: SetStateFn<string[]>;
    setFocusedItem?: SetStateFn<string | null>;
  };
  treeInstance: {
    /** @internal */
    getItemsMeta: () => ItemMeta[];

    getFocusedItem: () => ItemInstance<T>;
    getRootItem: () => ItemInstance<T>;
    focusNextItem: () => void;
    focusPreviousItem: () => void;
    updateDomFocus: () => void;

    /** Pass to the container rendering the tree children. The `treeLabel` parameter
     * will be passed as `aria-label` parameter, and is recommended to be set. */
    getContainerProps: (treeLabel?: string) => Record<string, any>;
  };
  itemInstance: {
    getId: () => string;
    getKey: () => string;
    getProps: () => Record<string, any>;
    getItemName: () => string;
    getItemData: () => T;
    equals: (other?: ItemInstance<any> | null) => boolean;
    expand: () => void;
    collapse: () => void;
    isExpanded: () => boolean;
    isDescendentOf: (parentId: string) => boolean;
    isFocused: () => boolean;
    isFolder: () => boolean;
    setFocused: () => void;
    getParent: () => ItemInstance<T> | undefined;
    getChildren: () => ItemInstance<T>[];
    getIndexInParent: () => number;
    primaryAction: () => void;
    getTree: () => TreeInstance<T>;
    getItemAbove: () => ItemInstance<T> | undefined;
    getItemBelow: () => ItemInstance<T> | undefined;
    scrollTo: (
      scrollIntoViewArg?: boolean | ScrollIntoViewOptions,
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
