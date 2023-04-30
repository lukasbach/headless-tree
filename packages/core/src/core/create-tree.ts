import {
  FeatureDef,
  ItemInstance,
  TreeConfig,
  TreeInstance,
  TreeState,
} from "../types/core";
import { MainFeature } from "../features/main/types";
import { treeFeature } from "../features/tree/feature";

export const createTree = <T>(initialConfig: TreeConfig<T>) => {
  let state: TreeState<T> = initialConfig.features?.reduce(
    (acc, feature) => feature.getInitialState?.(acc) ?? acc,
    initialConfig.state ?? {}
  );
  let config: TreeConfig<T> = initialConfig.features?.reduce(
    (acc, feature) => feature.getDefaultConfig?.(acc) ?? acc,
    initialConfig
  );

  let treeInstance: TreeInstance<T> = {} as any;

  const itemInstances: Record<string, ItemInstance<T>> = {};

  const additionalFeatures = [treeFeature, ...(initialConfig.features ?? [])];

  const mainFeature: FeatureDef<MainFeature<T>> = {
    createTreeInstance: () => ({
      getState: () => state,
      setState: (updater) => {
        config.onStateChange?.(updater);
        state = typeof updater === "function" ? updater(state) : updater;

        for (const item of treeInstance.getFlatItems()) {
          itemInstances[item.itemId] = additionalFeatures.reduce(
            (acc, feature) =>
              feature.createItemInstance?.(acc, item, config, treeInstance) ??
              acc,
            {} as ItemInstance<T>
          );
        }
      },
      getConfig: () => config,
      setConfig: (updater) => {
        config = typeof updater === "function" ? updater(config) : updater;
      },

      getItemInstance: (itemId) => itemInstances[itemId],
    }),
  };

  // todo sort features
  const features = [mainFeature, ...additionalFeatures];

  treeInstance = features.reduce(
    (acc, feature) => feature.createTreeInstance?.(acc, config, state) ?? acc,
    {} as TreeInstance<T>
  );

  return treeInstance;
};
