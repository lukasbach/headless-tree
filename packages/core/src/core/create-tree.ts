import {
  FeatureImplementation,
  HotkeysConfig,
  ItemInstance,
  TreeConfig,
  TreeInstance,
  TreeState,
} from "../types/core";
import { MainFeatureDef } from "../features/main/types";
import { treeFeature } from "../features/tree/feature";

export const createTree = <T>(
  initialConfig: TreeConfig<T>
): TreeInstance<T> => {
  const treeInstance: TreeInstance<T> = {} as any;

  const additionalFeatures = [treeFeature, ...(initialConfig.features ?? [])];
  let state = additionalFeatures.reduce(
    (acc, feature) => feature.getInitialState?.(acc, treeInstance) ?? acc,
    initialConfig.state ?? {}
  ) as TreeState<T>;
  let config = additionalFeatures.reduce(
    (acc, feature) => feature.getDefaultConfig?.(acc, treeInstance) ?? acc,
    initialConfig
  ) as TreeConfig<T>;

  let treeElement: HTMLElement | undefined | null;
  const treeDataRef: { current: any } = { current: {} };

  const itemInstancesMap: Record<string, ItemInstance<T>> = {};
  let itemInstances: ItemInstance<T>[] = [];
  const itemElementsMap: Record<string, HTMLElement | undefined | null> = {};
  const itemDataRefs: Record<string, { current: any }> = {};

  const hotkeyPresets = {} as HotkeysConfig<T>;

  const rebuildItemInstances = (main: FeatureImplementation) => {
    itemInstances = [];
    for (const item of treeInstance.getItemsMeta()) {
      const itemInstance = {} as ItemInstance<T>;
      for (const feature of [main, ...additionalFeatures]) {
        Object.assign(
          itemInstance,
          feature.createItemInstance?.(
            { ...itemInstance },
            itemInstance,
            item,
            treeInstance
          ) ?? {}
        );
      }
      itemInstancesMap[item.itemId] = itemInstance;
      itemInstances.push(itemInstance);
    }
    console.log("Rebuild instances", treeInstance.getItemsMeta());
  };

  const eachFeature = (fn: (feature: FeatureImplementation<any>) => void) => {
    for (const feature of additionalFeatures) {
      fn(feature);
    }
  };

  const mainFeature: FeatureImplementation<T, MainFeatureDef<T>> = {
    key: "main",
    createTreeInstance: (prev) => ({
      ...prev,
      getState: () => state,
      setState: (updater) => {
        state = typeof updater === "function" ? updater(state) : updater;
        config.onStateChange?.(state);
        rebuildItemInstances(mainFeature);
        eachFeature((feature) => feature.onStateChange?.(treeInstance));
        eachFeature((feature) => feature.onStateOrConfigChange?.(treeInstance));
      },
      getConfig: () => config,
      setConfig: (updater) => {
        config = typeof updater === "function" ? updater(config) : updater;

        if (config.state) {
          state = { ...state, ...config.state };
          rebuildItemInstances(mainFeature);
          eachFeature((feature) => feature.onStateChange?.(treeInstance));
        }

        eachFeature((feature) => feature.onConfigChange?.(treeInstance));
        eachFeature((feature) => feature.onStateOrConfigChange?.(treeInstance));
      },
      getItemInstance: (itemId) => itemInstancesMap[itemId],
      getItems: () => itemInstances,
      registerElement: (element) => {
        if (treeElement && !element) {
          eachFeature((feature) =>
            feature.onTreeUnmount?.(treeInstance, treeElement!)
          );
        } else if (!treeElement && element) {
          eachFeature((feature) =>
            feature.onTreeMount?.(treeInstance, element)
          );
        }
        treeElement = element;
      },
      getElement: () => treeElement,
      getDataRef: () => treeDataRef,
      getHotkeyPresets: () => hotkeyPresets,
    }),
    createItemInstance: (prev, instance, itemMeta) => ({
      ...prev,
      registerElement: (element) => {
        const oldElement = itemElementsMap[itemMeta.itemId];
        if (oldElement && !element) {
          eachFeature((feature) =>
            feature.onItemUnmount?.(instance, oldElement!, treeInstance)
          );
        } else if (!oldElement && element) {
          eachFeature((feature) =>
            feature.onItemMount?.(instance, element!, treeInstance)
          );
        }
        itemElementsMap[itemMeta.itemId] = element;
      },
      getElement: () => itemElementsMap[itemMeta.itemId],
      // eslint-disable-next-line no-return-assign
      getDataRef: () => (itemDataRefs[itemMeta.itemId] ??= { current: {} }),
    }),
  };

  // todo sort features
  const features = [mainFeature, ...additionalFeatures];

  for (const feature of features) {
    Object.assign(
      treeInstance,
      feature.createTreeInstance?.({ ...treeInstance }, treeInstance) ?? {}
    );
    Object.assign(hotkeyPresets, feature.hotkeys ?? {});
  }

  rebuildItemInstances(mainFeature);

  return treeInstance;
};
