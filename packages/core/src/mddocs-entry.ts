import { MainFeatureDef } from "./features/main/types";

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
