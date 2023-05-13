import { DragAndDropFeatureDef } from "../features/drag-and-drop/types";
import { MainFeatureDef } from "../features/main/types";
import { SelectionFeatureDef } from "../features/selection/types";
import { ItemMeta, TreeFeatureDef } from "../features/tree/types";
import {
  HotkeyConfig,
  HotkeysCoreFeatureDef,
} from "../features/hotkeys-core/types";
import { SyncDataLoaderFeatureDef } from "../features/sync-data-loader/types";
import { AsyncDataLoaderFeatureDef } from "../features/async-data-loader/types";
import { SearchFeatureDef } from "../features/search/types";
import { RenamingFeatureDef } from "../features/renaming/types";
import { ExpandAllFeatureDef } from "../features/expand-all/types";

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

export type FeatureDefs<T> =
  | MainFeatureDef
  | TreeFeatureDef<T>
  | SelectionFeatureDef<T>
  | DragAndDropFeatureDef<T>
  | HotkeysCoreFeatureDef<T>
  | SyncDataLoaderFeatureDef<T>
  | AsyncDataLoaderFeatureDef<T>
  | SearchFeatureDef<T>
  | RenamingFeatureDef<T>
  | ExpandAllFeatureDef;

type MergedFeatures<F extends FeatureDef> = {
  state: UnionToIntersection<F["state"]>;
  config: UnionToIntersection<F["config"]>;
  treeInstance: UnionToIntersection<F["treeInstance"]>;
  itemInstance: UnionToIntersection<F["itemInstance"]>;
  hotkeys: F["hotkeys"];
};

type TreeStateType<T> = MainFeatureDef["state"] &
  TreeFeatureDef<T>["state"] &
  SelectionFeatureDef<T>["state"] &
  DragAndDropFeatureDef<T>["state"] &
  HotkeysCoreFeatureDef<T>["state"] &
  SyncDataLoaderFeatureDef<T>["state"] &
  AsyncDataLoaderFeatureDef<T>["state"] &
  SearchFeatureDef<T>["state"] &
  RenamingFeatureDef<T>["state"] &
  ExpandAllFeatureDef["state"];
export interface TreeState<T> extends TreeStateType<T> {}

type TreeConfigType<T> = MainFeatureDef["config"] &
  TreeFeatureDef<T>["config"] &
  SelectionFeatureDef<T>["config"] &
  DragAndDropFeatureDef<T>["config"] &
  HotkeysCoreFeatureDef<T>["config"] &
  SyncDataLoaderFeatureDef<T>["config"] &
  AsyncDataLoaderFeatureDef<T>["config"] &
  SearchFeatureDef<T>["config"] &
  RenamingFeatureDef<T>["config"] &
  ExpandAllFeatureDef["config"];
export interface TreeConfig<T> extends TreeConfigType<T> {}

type TreeInstanceType<T> = MainFeatureDef["treeInstance"] &
  TreeFeatureDef<T>["treeInstance"] &
  SelectionFeatureDef<T>["treeInstance"] &
  DragAndDropFeatureDef<T>["treeInstance"] &
  HotkeysCoreFeatureDef<T>["treeInstance"] &
  SyncDataLoaderFeatureDef<T>["treeInstance"] &
  AsyncDataLoaderFeatureDef<T>["treeInstance"] &
  SearchFeatureDef<T>["treeInstance"] &
  RenamingFeatureDef<T>["treeInstance"] &
  ExpandAllFeatureDef["treeInstance"];
export interface TreeInstance<T> extends TreeInstanceType<T> {}

type ItemInstanceType<T> = MainFeatureDef["itemInstance"] &
  TreeFeatureDef<T>["itemInstance"] &
  SelectionFeatureDef<T>["itemInstance"] &
  DragAndDropFeatureDef<T>["itemInstance"] &
  HotkeysCoreFeatureDef<T>["itemInstance"] &
  SyncDataLoaderFeatureDef<T>["itemInstance"] &
  AsyncDataLoaderFeatureDef<T>["itemInstance"] &
  SearchFeatureDef<T>["itemInstance"] &
  RenamingFeatureDef<T>["itemInstance"] &
  ExpandAllFeatureDef["itemInstance"];
export interface ItemInstance<T> extends ItemInstanceType<T> {}

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
    item: MergedFeatures<F>["itemInstance"],
    tree: MergedFeatures<F>["treeInstance"],
    itemId: string
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
