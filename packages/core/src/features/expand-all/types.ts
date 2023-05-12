export type ExpandAllFeatureDef = {
  state: {};
  config: {};
  treeInstance: {
    expandAll: (cancelToken?: { current: boolean }) => Promise<void>;
    collapseAll: () => Promise<void>;
  };
  itemInstance: {
    expandAll: (cancelToken?: { current: boolean }) => Promise<void>;
    collapseAll: () => Promise<void>;
  };
  hotkeys: never;
};
