import { OnChangeFn } from "../../types/core";
import { SyncDataLoaderFeatureDef } from "../sync-data-loader/types";

export type AsyncTreeDataLoader<T> = {
  getItem: (itemId: string) => Promise<T>;
  getChildren: (itemId: string) => Promise<string[]>;
  getChildrenWithData?: (itemId: string) => Promise<{ id: string; data: T }[]>;
};

export type AsyncDataLoaderRef<T = any> = {
  itemData: Record<string, T>;
  childrenIds: Record<string, string[]>;
};

/**
 * @category Async Data Loader/General
 * */
export type AsyncDataLoaderFeatureDef<T> = {
  state: {
    loadingItems: string[];
  };
  config: {
    rootItemId: string;
    createLoadingItemData?: () => T;
    // TODO does this need to rebuild the tree?
    onChangeLoadingItems?: OnChangeFn<string[]>;
    onLoadedItem?: (itemId: string, item: T) => void;
    onLoadedChildren?: (itemId: string, childrenIds: string[]) => void;
    asyncDataLoader?: AsyncTreeDataLoader<T>;
  };
  treeInstance: SyncDataLoaderFeatureDef<T>["treeInstance"] & {
    /** Invalidate fetched data for item, and triggers a refetch and subsequent rerender if the item is visible */
    invalidateItemData: (itemId: string) => void;
    invalidateChildrenIds: (itemId: string) => void;
  };
  itemInstance: SyncDataLoaderFeatureDef<T>["itemInstance"] & {
    invalidateItemData: () => void;
    invalidateChildrenIds: () => void;
    isLoading: () => void;
  };
  hotkeys: SyncDataLoaderFeatureDef<T>["hotkeys"];
};
