import { FeatureImplementation } from "../../types/core";
import { SelectionFeatureDef } from "./types";
import { MainFeatureDef } from "../main/types";
import { TreeFeatureDef } from "../tree/types";

export const selectionFeature: FeatureImplementation<
  any,
  SelectionFeatureDef<any>,
  MainFeatureDef | TreeFeatureDef<any> | SelectionFeatureDef<any>
> = {
  key: "selection",
  dependingFeatures: ["main", "tree"],

  createItemInstance: (prev) => ({
    ...prev,
    getProps: () => {
      return {
        ...prev.getProps(),
        "data-selection": 123,
      };
    },
  }),
};
