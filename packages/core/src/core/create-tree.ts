import {
  DefaultFeatures,
  EmptyFeatureDef,
  FeatureDef,
  FeatureImplementation,
  ItemInstance,
  TreeConfig,
  TreeInstance,
  TreeState,
} from "../types/core";
import { MainFeatureDef } from "../features/main/types";
import { treeFeature } from "../features/tree/feature";
import { selectionFeature } from "../features/selection/feature";

export const createTree = <T = any, F extends FeatureDef = EmptyFeatureDef>(
  features: FeatureImplementation<T, F>[],
  initialConfig: TreeConfig<T, F | DefaultFeatures<T>>
): TreeInstance<T, F | DefaultFeatures<T>> => {
  const additionalFeatures = [treeFeature, ...features];
  let state = additionalFeatures.reduce(
    (acc, feature) => feature.getInitialState?.(acc) ?? acc,
    (initialConfig as any).state ?? {}
  ) as TreeState<T>;
  let config = additionalFeatures.reduce(
    (acc, feature) => feature.getDefaultConfig?.(acc as any) ?? acc,
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
    key: "main",
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
  const allFeatures = [mainFeature, ...additionalFeatures];

  treeInstance = allFeatures.reduce(
    (acc, feature) => feature.createTreeInstance?.(acc) ?? acc,
    {} as TreeInstance<T>
  ) as TreeInstance<T>;

  rebuildItemInstances();

  return treeInstance as any;
};

const x = createTree([selectionFeature], {});
