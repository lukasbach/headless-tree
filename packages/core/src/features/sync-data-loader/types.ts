export interface TreeDataLoader<T> {
  getItem: (itemId: string) => T | Promise<T>;
  getChildren: (itemId: string) => string[] | Promise<string[]>;
}

export type SyncDataLoaderFeatureDef<T> = {
  state: {};
  config: {
    rootItemId: string;
    dataLoader: TreeDataLoader<T>;
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
