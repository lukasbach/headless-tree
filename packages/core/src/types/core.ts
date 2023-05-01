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

export type EmptyFeatureDef = {
  state: {};
  config: {};
  treeInstance: {};
  itemInstance: {};
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
  | DragAndDropFeatureDef<T>;

type MergedFeatures<F extends FeatureDef> = {
  state: UnionToIntersection<F["state"]>;
  config: UnionToIntersection<F["config"]>;
  treeInstance: UnionToIntersection<F["treeInstance"]>;
  itemInstance: UnionToIntersection<F["itemInstance"]>;
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

export type FeatureImplementation<
  T = any,
  D extends FeatureDef = any,
  F extends FeatureDef = EmptyFeatureDef
> = {
  key: string;
  dependingFeatures?: string[];

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
};
