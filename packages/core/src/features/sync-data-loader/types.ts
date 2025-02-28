export interface SyncTreeDataLoader<T> {
  getItem: (itemId: string) => T;
  getChildren: (itemId: string) => string[];
}

export type SyncDataLoaderFeatureDef<T> = {
  state: {};
  config: {
    rootItemId: string;
    dataLoader?: SyncTreeDataLoader<T>;
  };
  treeInstance: {
    retrieveItemData: (itemId: string) => T;
    retrieveChildrenIds: (itemId: string) => string[];
  };
  itemInstance: {
    isLoading: () => boolean;
  };
  hotkeys: never;
};
