import { SetStateFn } from "../../types/core";
import { SyncDataLoaderFeatureDef } from "../sync-data-loader/types";

type AwaitingLoaderCallbacks = Record<string, (() => void)[]>;

// TODO unify type with syncDataLoader
export interface AsyncTreeDataLoader<T> {
  getItem: (itemId: string) => Promise<T>;
  getChildren: (itemId: string) => Promise<string[]>;
  getChildrenWithData?: (itemId: string) => Promise<{ id: string; data: T }[]>;
}

export interface AsyncDataLoaderDataRef<T = any> {
  itemData: Record<string, T>;
  childrenIds: Record<string, string[]>;
  awaitingItemDataLoading: AwaitingLoaderCallbacks;
  awaitingItemChildrensLoading: AwaitingLoaderCallbacks;
}

/**
 * @category Async Data Loader/General
 * */
export type AsyncDataLoaderFeatureDef<T> = {
  state: {
    loadingItemData: string[];
    loadingItemChildrens: string[];
  };
  config: {
    rootItemId: string;

    /** Will be called when HT retrieves item data for an item whose item data is asynchronously being loaded.
     * Can be used to create placeholder data to use for rendering the tree item while it is loaded. If not defined,
     * the tree item data will be null. */
    createLoadingItemData?: () => T;

    setLoadingItemData?: SetStateFn<string[]>;
    setLoadingItemChildrens?: SetStateFn<string[]>;
    onLoadedItem?: (itemId: string, item: T) => void;
    onLoadedChildren?: (itemId: string, childrenIds: string[]) => void;
    asyncDataLoader?: AsyncTreeDataLoader<T>;
  };
  treeInstance: SyncDataLoaderFeatureDef<T>["treeInstance"] & {
    waitForItemDataLoaded: (itemId: string) => Promise<void>;
    waitForItemChildrenLoaded: (itemId: string) => Promise<void>;
  };
  itemInstance: SyncDataLoaderFeatureDef<T>["itemInstance"] & {
    /** Invalidate fetched data for item, and triggers a refetch and subsequent rerender if the item is visible */
    invalidateItemData: () => void;
    invalidateChildrenIds: () => void;
    updateCachedChildrenIds: (childrenIds: string[]) => void;
    isLoading: () => boolean;
  };
  hotkeys: SyncDataLoaderFeatureDef<T>["hotkeys"];
};
