export type SyncTreeDataLoader<T> = {
  // TODO async interfaces with asyncFeature
  getItem: (itemId: string) => T;
  getChildren: (itemId: string) => string[];
  itemChangeSignal?: any;
  childrenChangeSignal?: any;
};

export type SyncDataLoaderFeatureDef<T> = {
  state: {
    // loadingItems: string[];
  };
  config: {
    rootItemId: string;
    dataLoader: SyncTreeDataLoader<T>;
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
