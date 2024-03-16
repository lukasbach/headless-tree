import {
  FeatureImplementation,
  HotkeysConfig,
  ItemInstance,
  SetStateFn,
  TreeConfig,
  TreeState,
  Updater,
} from "../../types/core";
import { ItemMeta } from "../tree/types";

export type MainFeatureDef<T = any> = {
  state: {};
  config: {
    features?: FeatureImplementation<any>[];
    initialState?: Partial<TreeState<T>>;
    state?: Partial<TreeState<T>>;
    setState?: SetStateFn<TreeState<T>>;
  };
  treeInstance: {
    /** @internal */
    applySubStateUpdate: <K extends keyof TreeState<any>>(
      stateName: K,
      updater: Updater<TreeState<T>[K]>,
    ) => void;
    setState: SetStateFn<TreeState<T>>;
    getState: () => TreeState<T>;
    setConfig: SetStateFn<TreeConfig<T>>;
    getConfig: () => TreeConfig<T>;
    getItemInstance: (itemId: string) => ItemInstance<T>;
    getItems: () => ItemInstance<T>[];
    registerElement: (element: HTMLElement | null) => void;
    getElement: () => HTMLElement | undefined | null;
    /** @internal */
    getDataRef: <D>() => { current: D };
    /* @internal */
    getHotkeyPresets: () => HotkeysConfig<T>;
    rebuildTree: () => void;
  };
  itemInstance: {
    registerElement: (element: HTMLElement | null) => void;
    getItemMeta: () => ItemMeta;
    getElement: () => HTMLElement | undefined | null;
    /** @internal */
    getDataRef: <D>() => { current: D };
  };
  hotkeys: never;
};
