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
import { PropMemoizationFeatureDef } from "../features/prop-memoization/types";
import { KeyboardDragAndDropFeatureDef } from "../features/keyboard-drag-and-drop/types";
import { CheckboxesFeatureDef } from "../features/checkboxes/types";

export type Updater<T> = T | ((old: T) => T);
export type SetStateFn<T> = (updaterOrValue: Updater<T>) => void;

export type FeatureDef = {
  state: any;
  config: any;
  treeInstance: any;
  itemInstance: any;
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

type MergedFeatures<F extends FeatureDef> = {
  // type can't be removed because it's used for individual feature sets as feature deps in feature implementations
  // to my future self, yes I'm already aware this sounds dumb when I first write this
  state: UnionToIntersection<F["state"]>;
  config: UnionToIntersection<F["config"]>;
  treeInstance: UnionToIntersection<F["treeInstance"]>;
  itemInstance: UnionToIntersection<F["itemInstance"]>;
  hotkeys: F["hotkeys"];
};

export type RegisteredFeatures<T> =
  | MainFeatureDef<T>
  | TreeFeatureDef<T>
  | SelectionFeatureDef<T>
  | CheckboxesFeatureDef<T>
  | DragAndDropFeatureDef<T>
  | KeyboardDragAndDropFeatureDef<T>
  | HotkeysCoreFeatureDef<T>
  | SyncDataLoaderFeatureDef<T>
  | AsyncDataLoaderFeatureDef<T>
  | SearchFeatureDef<T>
  | RenamingFeatureDef<T>
  | ExpandAllFeatureDef
  | PropMemoizationFeatureDef;

type TreeStateType<T> = MergedFeatures<RegisteredFeatures<T>>["state"];
export interface TreeState<T> extends TreeStateType<T> {}

type TreeConfigType<T> = MergedFeatures<RegisteredFeatures<T>>["config"];
export interface TreeConfig<T> extends TreeConfigType<T> {}

type TreeInstanceType<T> = MergedFeatures<
  RegisteredFeatures<T>
>["treeInstance"];
export interface TreeInstance<T> extends TreeInstanceType<T> {}

type ItemInstanceType<T> = MergedFeatures<
  RegisteredFeatures<T>
>["itemInstance"];
export interface ItemInstance<T> extends ItemInstanceType<T> {}

export type HotkeyName = MergedFeatures<RegisteredFeatures<any>>["hotkeys"];

export type HotkeysConfig<T> = Record<HotkeyName, HotkeyConfig<T>>;

export type CustomHotkeysConfig<T> = Partial<
  Record<HotkeyName | `custom${string}`, Partial<HotkeyConfig<T>>>
>;

type MayReturnNull<T extends (...x: any[]) => any> = (
  ...args: Parameters<T>
) => ReturnType<T> | null;

export type ItemInstanceOpts<Key extends keyof ItemInstance<any>> = {
  item: ItemInstance<any>;
  tree: TreeInstance<any>;
  itemId: string;
  prev?: MayReturnNull<ItemInstance<any>[Key]>;
};

export type TreeInstanceOpts<Key extends keyof TreeInstance<any>> = {
  tree: TreeInstance<any>;
  prev?: MayReturnNull<TreeInstance<any>[Key]>;
};

export type FeatureImplementation<T = any> = {
  key?: string;
  deps?: string[];
  overwrites?: string[];

  stateHandlerNames?: Partial<Record<keyof TreeState<T>, keyof TreeConfig<T>>>;

  getInitialState?: (
    initialState: Partial<TreeState<T>>,
    tree: TreeInstance<T>,
  ) => Partial<TreeState<T>>;

  getDefaultConfig?: (
    defaultConfig: Partial<TreeConfig<T>>,
    tree: TreeInstance<T>,
  ) => Partial<TreeConfig<T>>;

  treeInstance?: {
    [key in keyof TreeInstance<T>]?: (
      opts: TreeInstanceOpts<key>,
      ...args: Parameters<TreeInstance<T>[key]>
    ) => void;
  };

  itemInstance?: {
    [key in keyof ItemInstance<T>]?: (
      opts: ItemInstanceOpts<key>,
      ...args: Parameters<ItemInstance<T>[key]>
    ) => void;
  };

  onTreeMount?: (instance: TreeInstance<T>, treeElement: HTMLElement) => void;

  onTreeUnmount?: (instance: TreeInstance<T>, treeElement: HTMLElement) => void;

  onItemMount?: (
    instance: ItemInstance<T>,
    itemElement: HTMLElement,
    tree: TreeInstance<T>,
  ) => void;

  onItemUnmount?: (
    instance: ItemInstance<T>,
    itemElement: HTMLElement,
    tree: TreeInstance<T>,
  ) => void;

  hotkeys?: Partial<HotkeysConfig<T>>;
};
