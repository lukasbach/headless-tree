import { SetStateFn } from "../../types/core";
import { SyncDataLoaderFeatureDef } from "../sync-data-loader/types";

type AwaitingLoaderCallbacks = Record<string, (() => void)[]>;

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
  };
  treeInstance: SyncDataLoaderFeatureDef<T>["treeInstance"] & {
    /** @deprecated use loadItemData instead */
    waitForItemDataLoaded: (itemId: string) => Promise<void>;
    /** @deprecated use loadChildrenIds instead */
    waitForItemChildrenLoaded: (itemId: string) => Promise<void>;
    loadItemData: (itemId: string) => Promise<T>;
    loadChildrenIds: (itemId: string) => Promise<string[]>;
  };
  itemInstance: SyncDataLoaderFeatureDef<T>["itemInstance"] & {
    /** Invalidate fetched data for item, and triggers a refetch and subsequent rerender if the item is visible
     * @param optimistic If true, the item will not trigger a state update on `loadingItemData`, and
     * the tree will continue to display the old data until the new data has loaded. */
    invalidateItemData: (optimistic?: boolean) => Promise<void>;

    /** Invalidate fetched children ids for item, and triggers a refetch and subsequent rerender if the item is visible
     * @param optimistic If true, the item will not trigger a state update on `loadingItemChildrens`, and
     * the tree will continue to display the old data until the new data has loaded. */
    invalidateChildrenIds: (optimistic?: boolean) => Promise<void>;

    updateCachedChildrenIds: (childrenIds: string[]) => void;
    isLoading: () => boolean;
  };
  hotkeys: SyncDataLoaderFeatureDef<T>["hotkeys"];
};
