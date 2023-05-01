import { DragAndDropFeatureDef } from "../features/drag-and-drop/types";
import { MainFeatureDef } from "../features/main/types";
import { SelectionFeatureDef } from "../features/selection/types";
import { ItemMeta, TreeFeatureDef } from "../features/tree/types";

export type Updater<T> = T | ((old: T) => T);
export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;

export type FeatureDef = {
  state: object;
  config: object;
  treeInstance: object;
  itemInstance: object;
};

export type FeatureDefsMap<T> = {
  main: MainFeatureDef;
  tree: TreeFeatureDef<T>;
  selection: SelectionFeatureDef<T>;
  dragAndDrop: DragAndDropFeatureDef<T>;
};

export type DefaultFeatures = ["main", "tree"];

export type ResolveFeatureDefs<T extends (keyof FeatureDefsMap<any>)[]> = {
  [K in keyof T]: FeatureDefsMap<any>[T[K]];
};

type FeatureDefs<T> = [
  MainFeatureDef,
  TreeFeatureDef<T>,
  SelectionFeatureDef<T>,
  DragAndDropFeatureDef<T>
];

type MergeArr<T extends any[], Alt = never> = T extends []
  ? Alt
  : T extends [infer A, infer B, ...infer R]
  ? MergeArr<[A & B, ...R]>
  : T extends [infer A, infer B]
  ? A & B
  : T extends [infer A]
  ? A
  : T[number];

type MergedFeatures<F extends FeatureDef[]> = {
  state: MergeArr<F, { state: {} }>["state"];
  config: MergeArr<F, { config: {} }>["config"];
  treeInstance: MergeArr<F, { treeInstance: {} }>["treeInstance"];
  itemInstance: MergeArr<F, { itemInstance: {} }>["itemInstance"];
};

export type TreeState<T> = MergedFeatures<FeatureDefs<T>>["state"];
export type TreeConfig<T> = MergedFeatures<FeatureDefs<T>>["config"];
export type TreeInstance<T> = MergedFeatures<FeatureDefs<T>>["treeInstance"];
export type ItemInstance<T> = MergedFeatures<FeatureDefs<T>>["itemInstance"];

export type FeatureImplementation<
  T = any,
  D extends FeatureDef = any,
  F extends FeatureDef[] = []
> = {
  getInitialState?: (
    initialState: Partial<MergedFeatures<F>["state"]>
  ) => Partial<D["state"] & MergedFeatures<F>["state"]>;
  getDefaultConfig?: (
    defaultConfig: Partial<MergedFeatures<F>["config"]>
  ) => Partial<D["config"] & MergedFeatures<F>["config"]>;
  createTreeInstance?: (
    instance: MergedFeatures<F>["treeInstance"]
  ) => D["treeInstance"] & MergedFeatures<F>["treeInstance"];
  createItemInstance?: (
    instance: MergedFeatures<F>["itemInstance"],
    itemMeta: ItemMeta<T>,
    tree: MergedFeatures<F>["treeInstance"]
  ) => D["itemInstance"] & MergedFeatures<F>["itemInstance"];

  dependingFeatures?: FeatureImplementation<T, F[number]>[];
};
