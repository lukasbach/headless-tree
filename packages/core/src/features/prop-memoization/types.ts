export interface PropMemoizationDataRef {
  memo?: {
    tree?: Record<string, any>;
    item?: Record<string, any>;
    search?: Record<string, any>;
    rename?: Record<string, any>;
  };
}

export type PropMemoizationFeatureDef = {
  state: {};
  config: {};
  treeInstance: {};
  itemInstance: {};
  hotkeys: never;
};
