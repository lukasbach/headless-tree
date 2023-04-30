import { OnChangeFn } from "../../types/core";

export type TreeDataLoader<T> = {
  // TODO async interfaces with asyncFeature
  getItem: (itemId: string) => T;
  getChildren: (itemId: string) => string[];
  itemChangeSignal?: any;
  childrenChangeSignal?: any;
};

export type FlatTreeItem<T> = {
  itemId: string;
  parentId: string;
  depth: number;
  index: number;
  isLoading: boolean;
};

export type TreeFeature<T> = {
  state: {
    rootItemId: string;
    expandedItems: string[];
    focusedItem: string | null;
  };
  config: {
    dataLoader: TreeDataLoader<T>;
    isItemFolder: (item: T) => boolean;
    getItemName: (item: T) => string;

    onChangeExpandedItems: OnChangeFn<string[]>;
    onChangeFocusedItem: OnChangeFn<string | null>;
  };
  treeInstance: {
    getFlatItems: () => FlatTreeItem<T>[];
  };
  itemInstance: {};
};
