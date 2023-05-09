import { MainFeatureDef } from "./features/main/types";
import { DragAndDropFeatureDef } from "./features/drag-and-drop/types";

export * from ".";

/** @interface */
export type MainFeatureConfig = MainFeatureDef["config"];
/** @interface */
export type MainFeatureState = MainFeatureDef["state"];
/** @interface */
export type MainFeatureTreeInstance = MainFeatureDef["treeInstance"];
/** @interface */
export type MainFeatureItemInstance = MainFeatureDef["itemInstance"];
export type MainFeatureHotkeys = MainFeatureDef["hotkeys"];

/** @interface */
export type DragAndDropFeatureConfig<T> = DragAndDropFeatureDef<T>["config"];
/** @interface */
export type DragAndDropFeatureState<T> = DragAndDropFeatureDef<T>["state"];
/** @interface */
export type DragAndDropFeatureTreeInstance<T> =
  DragAndDropFeatureDef<T>["treeInstance"];
/** @interface */
export type DragAndDropFeatureItemInstance<T> =
  DragAndDropFeatureDef<T>["itemInstance"];
export type DragAndDropFeatureHotkeys<T> = DragAndDropFeatureDef<T>["hotkeys"];
