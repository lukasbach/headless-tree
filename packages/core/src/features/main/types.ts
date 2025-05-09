import {
  FeatureImplementation,
  HotkeysConfig,
  ItemInstance,
  SetStateFn,
  TreeConfig,
  TreeInstance,
  TreeState,
  Updater,
} from "../../types/core";
import { ItemMeta } from "../tree/types";

export type InstanceTypeMap = {
  itemInstance: ItemInstance<any>;
  treeInstance: TreeInstance<any>;
};

export type InstanceBuilder = <T extends keyof InstanceTypeMap>(
  features: FeatureImplementation[],
  instanceType: T,
  buildOpts: (self: any) => any,
) => [instance: InstanceTypeMap[T], finalize: () => void];

export type MainFeatureDef<T = any> = {
  state: {};
  config: {
    features?: FeatureImplementation<any>[];
    initialState?: Partial<TreeState<T>>;
    state?: Partial<TreeState<T>>;
    setState?: SetStateFn<Partial<TreeState<T>>>;
    instanceBuilder?: InstanceBuilder;
  };
  treeInstance: {
    /** @internal */
    applySubStateUpdate: <K extends keyof TreeState<any>>(
      stateName: K,
      updater: Updater<TreeState<T>[K]>,
    ) => void;
    /** @internal */
    buildItemInstance: (itemId: string) => ItemInstance<T>;
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
