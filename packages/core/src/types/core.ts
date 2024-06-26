import { DragAndDropFeatureDef } from "../features/drag-and-drop/types";
import { MainFeatureDef } from "../features/main/types";
import { SelectionFeatureDef } from "../features/selection/types";
import { TreeFeatureDef } from "../features/tree/types";
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
export type SetStateFn<T> = (updaterOrValue: Updater<T>) => void;

type FunctionMap = Record<string, (...args: any[]) => any>;

export type FeatureDef = {
  state: any;
  config: any;
  treeInstance: FunctionMap;
  itemInstance: FunctionMap;
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
  x: infer R,
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
  // type can't be removed because it's used for individual feature sets as feature deps in feature implementations
  // to my future self, yes I'm already aware this sounds dumb when I first write this
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
  F extends FeatureDef = FeatureDefs<T>,
> = Partial<
  Record<HotkeyName<F> | `custom${string}`, Partial<HotkeyConfig<T>>>
>;

type MayReturnNull<T extends (...x: any[]) => any> = (
  ...args: Parameters<T>
) => ReturnType<T> | null;

export type ItemInstanceOpts<
  ItemInstance extends FunctionMap = FunctionMap,
  TreeInstance extends FunctionMap = FunctionMap,
  Key extends keyof ItemInstance = any,
> = {
  item: ItemInstance;
  tree: TreeInstance;
  itemId: string;
  prev: MayReturnNull<ItemInstance[Key]>;
};

export type TreeInstanceOpts<
  TreeInstance extends FunctionMap = FunctionMap,
  Key extends keyof TreeInstance = any,
> = {
  tree: TreeInstance;
  prev: MayReturnNull<TreeInstance[Key]>;
};

export type FeatureImplementation<
  T = any,
  SelfFeatureDef extends FeatureDef = any,
  DepFeaturesDef extends FeatureDef = EmptyFeatureDef,
  // /** @internal */
  // AllFeatures extends FeatureDef = MergedFeatures<
  //   DepFeaturesDef | SelfFeatureDef
  // >,
  // /** @internal */
  // DepFeatures extends FeatureDef = MergedFeatures<DepFeaturesDef>,
> = {
  key?: string;
  deps?: string[];
  overwrites?: string[];

  stateHandlerNames?: Partial<
    Record<
      keyof MergedFeatures<DepFeaturesDef>["state"],
      keyof MergedFeatures<DepFeaturesDef>["config"]
    >
  >;

  getInitialState?: (
    initialState: Partial<MergedFeatures<DepFeaturesDef>["state"]>,
    tree: MergedFeatures<DepFeaturesDef>["treeInstance"],
  ) => Partial<
    SelfFeatureDef["state"] & MergedFeatures<DepFeaturesDef>["state"]
  >;

  getDefaultConfig?: (
    defaultConfig: Partial<MergedFeatures<DepFeaturesDef>["config"]>,
    tree: MergedFeatures<DepFeaturesDef>["treeInstance"],
  ) => Partial<
    SelfFeatureDef["config"] & MergedFeatures<DepFeaturesDef>["config"]
  >;

  treeInstance?: {
    [key in keyof (SelfFeatureDef["treeInstance"] &
      MergedFeatures<DepFeaturesDef>["treeInstance"])]?: (
      opts: TreeInstanceOpts<
        SelfFeatureDef["treeInstance"] &
          MergedFeatures<DepFeaturesDef>["treeInstance"],
        key
      >,
      ...args: Parameters<
        (SelfFeatureDef["treeInstance"] &
          MergedFeatures<DepFeaturesDef>["treeInstance"])[key]
      >
    ) => void;
  };

  itemInstance?: {
    [key in keyof (SelfFeatureDef["itemInstance"] &
      MergedFeatures<DepFeaturesDef>["itemInstance"])]?: (
      opts: ItemInstanceOpts<
        SelfFeatureDef["itemInstance"] &
          MergedFeatures<DepFeaturesDef>["itemInstance"],
        SelfFeatureDef["treeInstance"] &
          MergedFeatures<DepFeaturesDef>["treeInstance"],
        key
      >,
      ...args: Parameters<
        (SelfFeatureDef["itemInstance"] &
          MergedFeatures<DepFeaturesDef>["itemInstance"])[key]
      >
    ) => void;
  };

  onTreeMount?: (
    instance: MergedFeatures<DepFeaturesDef>["treeInstance"],
    treeElement: HTMLElement,
  ) => void;

  onTreeUnmount?: (
    instance: MergedFeatures<DepFeaturesDef>["treeInstance"],
    treeElement: HTMLElement,
  ) => void;

  onItemMount?: (
    instance: MergedFeatures<DepFeaturesDef>["itemInstance"],
    itemElement: HTMLElement,
    tree: MergedFeatures<DepFeaturesDef>["treeInstance"],
  ) => void;

  onItemUnmount?: (
    instance: MergedFeatures<DepFeaturesDef>["itemInstance"],
    itemElement: HTMLElement,
    tree: MergedFeatures<DepFeaturesDef>["treeInstance"],
  ) => void;

  hotkeys?: HotkeysConfig<T, SelfFeatureDef>;
};
