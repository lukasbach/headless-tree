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
import { ItemMeta } from "../features/tree/types";

const buildItemInstance = (
  features: FeatureImplementation[],
  tree: TreeInstance<any>,
  itemId: string
) => {
  const itemInstance = {} as ItemInstance<any>;
  for (const feature of features) {
    Object.assign(
      itemInstance,
      feature.createItemInstance?.(
        { ...itemInstance },
        itemInstance,
        tree,
        itemId
      ) ?? {}
    );
  }
  return itemInstance;
};

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
  let itemMetaMap: Record<string, ItemMeta<T>> = {};

  const hotkeyPresets = {} as HotkeysConfig<T>;

  const rebuildItemMeta = (main: FeatureImplementation) => {
    itemInstances = [];
    itemMetaMap = {};
    for (const item of treeInstance.getItemsMeta()) {
      itemMetaMap[item.itemId] = item;
      if (!itemInstancesMap[item.itemId]) {
        const instance = buildItemInstance(
          [main, ...additionalFeatures],
          treeInstance,
          item.itemId
        );
        itemInstancesMap[item.itemId] = instance;
        itemInstances.push(instance);
      } else {
        itemInstances.push(itemInstancesMap[item.itemId]);
      }
    }
    console.log(
      "REBUILT",
      itemInstances.map((i) => i.getId())
      // new Error().stack
    );
  };

  const eachFeature = (fn: (feature: FeatureImplementation<any>) => void) => {
    for (const feature of additionalFeatures) {
      fn(feature);
    }
  };

  const mainFeature: FeatureImplementation<
    T,
    MainFeatureDef<T>,
    MainFeatureDef<T>
  > = {
    key: "main",
    createTreeInstance: (prev) => ({
      ...prev,
      getState: () => state,
      setState: (updater) => {
        state = typeof updater === "function" ? updater(state) : updater;
        config.onStateChange?.(state);
        // TODO only triggered on structural tree changes, not every time.
        // TODO can we find a way to only run this for the changed substructure?
        // rebuildItemMeta(mainFeature);
        eachFeature((feature) => feature.onStateChange?.(treeInstance));
        eachFeature((feature) => feature.onStateOrConfigChange?.(treeInstance));
      },
      rebuildTree: () => {
        rebuildItemMeta(mainFeature);
        config.onStateChange?.(state);
      },
      getConfig: () => config,
      setConfig: (updater) => {
        config = typeof updater === "function" ? updater(config) : updater;

        if (config.state) {
          state = { ...state, ...config.state };
          // TODO maybe remove after todo above
          // rebuildItemMeta(mainFeature);
          eachFeature((feature) => feature.onStateChange?.(treeInstance));
        }

        eachFeature((feature) => feature.onConfigChange?.(treeInstance));
        eachFeature((feature) => feature.onStateOrConfigChange?.(treeInstance));
      },
      getItemInstance: (itemId) => itemInstancesMap[itemId],
      getItems: () => itemInstances,
      registerElement: (element) => {
        // TODO only run if treeElement !== element
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
    createItemInstance: (prev, instance, _, itemId) => ({
      ...prev,
      registerElement: (element) => {
        // TODO only run if treeElement !== element
        const oldElement = itemElementsMap[itemId];
        if (oldElement && !element) {
          eachFeature((feature) =>
            feature.onItemUnmount?.(instance, oldElement!, treeInstance)
          );
        } else if (!oldElement && element) {
          eachFeature((feature) =>
            feature.onItemMount?.(instance, element!, treeInstance)
          );
        }
        itemElementsMap[itemId] = element;
      },
      getElement: () => itemElementsMap[itemId],
      // eslint-disable-next-line no-return-assign
      getDataRef: () => (itemDataRefs[itemId] ??= { current: {} }),
      getItemMeta: () => itemMetaMap[itemId],
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

  rebuildItemMeta(mainFeature);

  return treeInstance;
};
