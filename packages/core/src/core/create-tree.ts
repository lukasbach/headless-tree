import {
  FeatureImplementation,
  ItemInstance,
  TreeConfig,
  TreeInstance,
  TreeState,
} from "../types/core";
import { MainFeatureDef } from "../features/main/types";
import { treeFeature } from "../features/tree/feature";

export const createTree = <T>(initialConfig: TreeConfig<T>) => {
  const additionalFeatures = [treeFeature, ...(initialConfig.features ?? [])];
  let state = additionalFeatures.reduce(
    (acc, feature) => feature.getInitialState?.(acc) ?? acc,
    initialConfig.state ?? {}
  ) as TreeState<T>;
  let config = additionalFeatures.reduce(
    (acc, feature) => feature.getDefaultConfig?.(acc) ?? acc,
    initialConfig
  ) as TreeConfig<T>;

  let treeInstance: TreeInstance<T> = {} as any;

  const itemInstancesMap: Record<string, ItemInstance<T>> = {};
  let itemInstances: ItemInstance<T>[] = [];

  const rebuildItemInstances = () => {
    itemInstances = [];
    for (const item of treeInstance.getItemsMeta()) {
      const itemInstance = {} as ItemInstance<T>;
      for (const feature of additionalFeatures) {
        Object.assign(
          itemInstance,
          feature.createItemInstance?.(itemInstance, item, treeInstance) ?? {}
        );
      }
      itemInstancesMap[item.itemId] = itemInstance;
      itemInstances.push(itemInstance);
    }
  };

  const mainFeature: FeatureImplementation<MainFeatureDef<T>> = {
    createTreeInstance: () => ({
      getState: () => state,
      setState: (updater) => {
        state = typeof updater === "function" ? updater(state) : updater;
        config.onStateChange?.(state);
        rebuildItemInstances();
      },
      getConfig: () => config,
      setConfig: (updater) => {
        config = typeof updater === "function" ? updater(config) : updater;
      },

      getItemInstance: (itemId) => itemInstancesMap[itemId],

      getItems: () => itemInstances,
    }),
  };

  // todo sort features
  const features = [mainFeature, ...additionalFeatures];

  treeInstance = features.reduce(
    (acc, feature) => feature.createTreeInstance?.(acc) ?? acc,
    {} as TreeInstance<T>
  ) as TreeInstance<T>;

  rebuildItemInstances();

  return treeInstance;
};
