import { TMerged } from "./deep-merge";
import { DragAndDropFeature } from "../features/drag-and-drop/types";
import { MainFeature } from "../features/main/types";
import { SelectionFeature } from "../features/selection/types";
import { FlatTreeItem, TreeFeature } from "../features/tree/types";

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

export type TreeState<T> = TMerged<Features<T>[number]>["state"];
export type TreeConfig<T> = TMerged<Features<T>[number]>["config"];
export type TreeInstance<T> = TMerged<Features<T>[number]>["treeInstance"];
export type ItemInstance<T> = TMerged<Features<T>[number]>["itemInstance"];

export type FeatureDef<D extends FeatureTypeDef, T = any> = {
  getInitialState?: (initialState: Partial<TreeState<T>>) => D["state"];
  getDefaultConfig?: (defaultConfig: Partial<TreeConfig<T>>) => D["config"];
  createTreeInstance?: (
    instance: TreeInstance<T>,
    config: D["config"],
    state: D["state"]
  ) => D["treeInstance"];
  createItemInstance?: (
    instance: ItemInstance<T>,
    flatItem: FlatTreeItem<T>,
    config: D["config"],
    tree: TreeInstance<T>
  ) => D["itemInstance"];

  overrides?: FeatureDef<any>[];

  getItemProps?: (
    itemData: T,
    itemInstance: ItemInstance<T>,
    instance: TreeInstance<T>
  ) => Record<string, any>;
  getContainerProps?: (instance: TreeInstance<T>) => Record<string, any>;
};
