import {
  FeatureImplementation,
  HotkeysConfig,
  ItemInstance,
  OnChangeFn,
  TreeConfig,
  TreeState,
} from "../../types/core";

export type MainFeatureDef<T = any> = {
  state: {};
  config: {
    features?: FeatureImplementation<any>[];
    state?: Partial<TreeState<T>>;
    onStateChange?: OnChangeFn<TreeState<T>>;
  };
  treeInstance: {
    setState: OnChangeFn<TreeState<T>>;
    getState: () => TreeState<T>;
    setConfig: OnChangeFn<TreeConfig<T>>;
    getConfig: () => TreeConfig<T>;
    getItemInstance: (itemId: string) => ItemInstance<T>;
    getItems: () => ItemInstance<T>[];
    registerElement: (element: HTMLElement | null) => void;
    getElement: () => HTMLElement | undefined | null;
    /** @internal */
    getDataRef: <D>() => { current: D };
    /* @internal */
    getHotkeyPresets: () => HotkeysConfig<T>;
  };
  itemInstance: {
    registerElement: (element: HTMLElement | null) => void;
    getElement: () => HTMLElement | undefined | null;
    /** @internal */
    getDataRef: <D>() => { current: D };
  };
  hotkeys: never;
};