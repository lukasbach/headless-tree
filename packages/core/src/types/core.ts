import { DragAndDropFeatureDef } from "../features/drag-and-drop/types";
import { MainFeatureDef } from "../features/main/types";
import { SelectionFeatureDef } from "../features/selection/types";
import { ItemMeta, TreeFeatureDef } from "../features/tree/types";
import {
  HotkeyConfig,
  HotkeysCoreFeatureDef,
} from "../features/hotkeys-core/types";

export type Updater<T> = T | ((old: T) => T);
export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;

export type FeatureDef = {
  state: object;
  config: object;
  treeInstance: object;
  itemInstance: object;
  hotkeys: string;
};

export type EmptyFeatureDef = {
  state: {};
  config: {};
  treeInstance: {};
  itemInstance: {};
  hotkeys: never;
};

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;

export type DefaultFeatures<T> = MainFeatureDef | TreeFeatureDef<T>;

type FeatureDefs<T> =
  | MainFeatureDef
  | TreeFeatureDef<T>
  | SelectionFeatureDef<T>
  | DragAndDropFeatureDef<T>
  | HotkeysCoreFeatureDef<T>;

type MergedFeatures<F extends FeatureDef> = {
  state: UnionToIntersection<F["state"]>;
  config: UnionToIntersection<F["config"]>;
  treeInstance: UnionToIntersection<F["treeInstance"]>;
  itemInstance: UnionToIntersection<F["itemInstance"]>;
  hotkeys: F["hotkeys"];
};

export type TreeState<
  T,
  F extends FeatureDef = FeatureDefs<T>
> = MergedFeatures<F>["state"];
export type TreeConfig<
  T,
  F extends FeatureDef = FeatureDefs<T>
> = MergedFeatures<F>["config"];
export type TreeInstance<
  T,
  F extends FeatureDef = FeatureDefs<T>
> = MergedFeatures<F>["treeInstance"];
export type ItemInstance<
  T,
  F extends FeatureDef = FeatureDefs<T>
> = MergedFeatures<F>["itemInstance"];
export type HotkeyName<F extends FeatureDef = FeatureDefs<any>> =
  MergedFeatures<F>["hotkeys"];

export type HotkeysConfig<T, F extends FeatureDef = FeatureDefs<T>> = Record<
  HotkeyName<F>,
  HotkeyConfig<T>
>;

export type CustomHotkeysConfig<
  T,
  F extends FeatureDef = FeatureDefs<T>
> = Partial<
  Record<HotkeyName<F> | `custom${string}`, Partial<HotkeyConfig<T>>>
>;

export type FeatureImplementation<
  T = any,
  D extends FeatureDef = any,
  F extends FeatureDef = EmptyFeatureDef
> = {
  key: string;
  dependingFeatures?: string[];

  getInitialState?: (
    initialState: Partial<MergedFeatures<F>["state"]>,
    tree: MergedFeatures<F>["treeInstance"]
  ) => Partial<D["state"] & MergedFeatures<F>["state"]>;

  getDefaultConfig?: (
    defaultConfig: Partial<MergedFeatures<F>["config"]>,
    tree: MergedFeatures<F>["treeInstance"]
  ) => Partial<D["config"] & MergedFeatures<F>["config"]>;

  createTreeInstance?: (
    prev: MergedFeatures<F>["treeInstance"],
    instance: MergedFeatures<F>["treeInstance"]
  ) => D["treeInstance"] & MergedFeatures<F>["treeInstance"];

  createItemInstance?: (
    prev: MergedFeatures<F>["itemInstance"],
    instance: MergedFeatures<F>["itemInstance"],
    itemMeta: ItemMeta<T>,
    tree: MergedFeatures<F>["treeInstance"]
  ) => D["itemInstance"] & MergedFeatures<F>["itemInstance"];

  onTreeMount?: (
    instance: MergedFeatures<F>["treeInstance"],
    treeElement: HTMLElement
  ) => void;

  onTreeUnmount?: (
    instance: MergedFeatures<F>["treeInstance"],
    treeElement: HTMLElement
  ) => void;

  onItemMount?: (
    instance: MergedFeatures<F>["itemInstance"],
    itemElement: HTMLElement,
    tree: MergedFeatures<F>["treeInstance"]
  ) => void;

  onItemUnmount?: (
    instance: MergedFeatures<F>["itemInstance"],
    itemElement: HTMLElement,
    tree: MergedFeatures<F>["treeInstance"]
  ) => void;

  onStateChange?: (instance: MergedFeatures<F>["treeInstance"]) => void;
  onConfigChange?: (instance: MergedFeatures<F>["treeInstance"]) => void;
  onStateOrConfigChange?: (instance: MergedFeatures<F>["treeInstance"]) => void;

  hotkeys?: HotkeysConfig<T, D>;
};
