import { FeatureImplementation } from "../../types/core";
import { DragAndDropFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";
import { SelectionFeatureDef } from "../selection/types";

export const dragAndDropFeature: FeatureImplementation<
  any,
  DragAndDropFeatureDef<any>,
  | MainFeatureDef
  | TreeFeatureDef<any>
  | SelectionFeatureDef<any>
  | DragAndDropFeatureDef<any>
> = {
  key: "dragAndDrop",
  dependingFeatures: ["main", "tree", "selection"],
};
