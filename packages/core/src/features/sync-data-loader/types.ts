export type TreeDataLoader<T> =
  | {
      getItem: (itemId: string) => T | Promise<T>;
      getChildren: (itemId: string) => string[] | Promise<string[]>;
    }
  | {
      getItem: (itemId: string) => T | Promise<T>;
      getChildrenWithData: (
        itemId: string,
      ) => { id: string; data: T }[] | Promise<{ id: string; data: T }[]>;
    };

export type SyncDataLoaderFeatureDef<T> = {
  state: {};
  config: {
    rootItemId: string;
    dataLoader: TreeDataLoader<T>;
  };
  treeInstance: {
    retrieveItemData: (itemId: string, skipFetch?: boolean) => T;
    retrieveChildrenIds: (itemId: string, skipFetch?: boolean) => string[];
  };
  itemInstance: {
    isLoading: () => boolean;
  };
  hotkeys: never;
};
