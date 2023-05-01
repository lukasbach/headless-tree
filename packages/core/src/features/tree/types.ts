import { ItemInstance, OnChangeFn, TreeInstance } from "../../types/core";

export type TreeDataLoader<T> = {
  // TODO async interfaces with asyncFeature
  getItem: (itemId: string) => T;
  getChildren: (itemId: string) => string[];
  itemChangeSignal?: any;
  childrenChangeSignal?: any;
};

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
    rootItemId: string;
    expandedItems: string[];
    focusedItem: string | null;
  };
  config: {
    dataLoader: TreeDataLoader<T>;
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

    getContainerProps: () => Record<string, any>;
  };
  itemInstance: {
    getItemMeta: () => ItemMeta<T>;
    getId: () => string;
    getProps: () => Record<string, any>;
    getItemName: () => string;
    expand: () => void;
    collapse: () => void;
    isExpanded: () => boolean;
    isFocused: () => boolean;
    setFocused: () => void;
  };
};
