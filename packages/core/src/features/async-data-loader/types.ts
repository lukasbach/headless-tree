import { SetStateFn } from "../../types/core";
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
    setLoadingItems?: SetStateFn<string[]>;
    onLoadedItem?: (itemId: string, item: T) => void;
    onLoadedChildren?: (itemId: string, childrenIds: string[]) => void;
    asyncDataLoader?: AsyncTreeDataLoader<T>;
  };
  treeInstance: SyncDataLoaderFeatureDef<T>["treeInstance"];
  itemInstance: SyncDataLoaderFeatureDef<T>["itemInstance"] & {
    /** Invalidate fetched data for item, and triggers a refetch and subsequent rerender if the item is visible */
    invalidateItemData: () => void;
    invalidateChildrenIds: () => void;
    updateCachedChildrenIds: (childrenIds: string[]) => void;
    isLoading: () => boolean;
  };
  hotkeys: SyncDataLoaderFeatureDef<T>["hotkeys"];
};
