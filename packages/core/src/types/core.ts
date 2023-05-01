import { DragAndDropFeature } from "../features/drag-and-drop/types";
import { MainFeature } from "../features/main/types";
import { SelectionFeature } from "../features/selection/types";
import { ItemMeta, TreeFeature } from "../features/tree/types";

export type Updater<T> = T | ((old: T) => T);
export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;

export type FeatureTypeDef = {
  state: any;
  config: any;
  treeInstance: any;
  itemInstance: any;
};

type Features<T> = [
  MainFeature<T>,
  TreeFeature<T>,
  SelectionFeature<T>,
  DragAndDropFeature<T>
];

type Feature = {
  state: object;
  config: object;
  treeInstance: object;
  itemInstance: object;
};

type MergeArr<T extends any[], Alt = never> = T extends []
  ? Alt
  : T extends [infer A, infer B, ...infer R]
  ? MergeArr<[A & B, ...R]>
  : T extends [infer A, infer B]
  ? A & B
  : T extends [infer A]
  ? A
  : T[number];

type MergedFeatures<F extends Feature[]> = {
  state: MergeArr<F, { state: {} }>["state"];
  config: MergeArr<F, { config: {} }>["config"];
  treeInstance: MergeArr<F, { treeInstance: {} }>["treeInstance"];
  itemInstance: MergeArr<F, { itemInstance: {} }>["itemInstance"];
};

export type TreeState<T> = MergedFeatures<Features<T>>["state"];
export type TreeConfig<T> = MergedFeatures<Features<T>>["config"];
export type TreeInstance<T> = MergedFeatures<Features<T>>["treeInstance"];
export type ItemInstance<T> = MergedFeatures<Features<T>>["itemInstance"];

export type FeatureDef<
  T = any,
  D extends FeatureTypeDef = any,
  F extends Feature[] = []
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

  dependingFeatures?: FeatureDef<T, F[number]>[];
};
