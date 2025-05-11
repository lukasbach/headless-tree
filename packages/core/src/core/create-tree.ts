import {
  FeatureImplementation,
  HotkeysConfig,
  ItemInstance,
  TreeConfig,
  TreeInstance,
  TreeState,
  Updater,
} from "../types/core";
import { treeFeature } from "../features/tree/feature";
import { ItemMeta } from "../features/tree/types";
import { buildStaticInstance } from "./build-static-instance";
import { throwError } from "../utilities/errors";

const verifyFeatures = (features: FeatureImplementation[] | undefined) => {
  const loadedFeatures = features?.map((feature) => feature.key);
  for (const feature of features ?? []) {
    const missingDependency = feature.deps?.find(
      (dep) => !loadedFeatures?.includes(dep),
    );
    if (missingDependency) {
      throw throwError(`${feature.key} needs ${missingDependency}`);
    }
  }
};

// Check all possible pairs and sort the array
const exhaustiveSort = <T>(
  arr: T[],
  compareFn: (param1: T, param2: T) => number,
) => {
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (compareFn(arr[j], arr[i]) < 0) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }

  return arr;
};

const compareFeatures =
  (originalOrder: FeatureImplementation[]) =>
  (feature1: FeatureImplementation, feature2: FeatureImplementation) => {
    if (feature2.key && feature1.overwrites?.includes(feature2.key)) {
      return 1;
    }
    if (feature1.key && feature2.overwrites?.includes(feature1.key)) {
      return -1;
    }

    return originalOrder.indexOf(feature1) - originalOrder.indexOf(feature2);
  };

const sortFeatures = (features: FeatureImplementation[] = []) =>
  exhaustiveSort(features, compareFeatures(features));

export const createTree = <T>(
  initialConfig: TreeConfig<T>,
): TreeInstance<T> => {
  const buildInstance = initialConfig.instanceBuilder ?? buildStaticInstance;
  const additionalFeatures = [
    treeFeature,
    ...sortFeatures(initialConfig.features),
  ];
  verifyFeatures(additionalFeatures);
  const features = [...additionalFeatures];

  const [treeInstance, finalizeTree] = buildInstance(
    features,
    "treeInstance",
    (tree) => ({ tree }),
  );

  let state = additionalFeatures.reduce(
    (acc, feature) => feature.getInitialState?.(acc, treeInstance) ?? acc,
    initialConfig.initialState ?? initialConfig.state ?? {},
  ) as TreeState<T>;
  let config = additionalFeatures.reduce(
    (acc, feature) =>
      (feature.getDefaultConfig?.(acc, treeInstance) as TreeConfig<T>) ?? acc,
    initialConfig,
  ) as TreeConfig<T>;
  const stateHandlerNames = additionalFeatures.reduce(
    (acc, feature) => ({ ...acc, ...feature.stateHandlerNames }),
    {} as Record<string, keyof TreeConfig<T>>,
  );

  let treeElement: HTMLElement | undefined | null;
  const treeDataRef: { current: any } = { current: {} };

  const itemInstancesMap: Record<string, ItemInstance<T>> = {};
  let itemInstances: ItemInstance<T>[] = [];
  const itemElementsMap: Record<string, HTMLElement | undefined | null> = {};
  const itemDataRefs: Record<string, { current: any }> = {};
  let itemMetaMap: Record<string, ItemMeta> = {};

  const hotkeyPresets = {} as HotkeysConfig<T>;

  const rebuildItemMeta = () => {
    // TODO can we find a way to only run this for the changed substructure?
    itemInstances = [];
    itemMetaMap = {};

    const [rootInstance, finalizeRootInstance] = buildInstance(
      features,
      "itemInstance",
      (item) => ({ item, tree: treeInstance, itemId: config.rootItemId }),
    );
    finalizeRootInstance();
    itemInstancesMap[config.rootItemId] = rootInstance;
    itemMetaMap[config.rootItemId] = {
      itemId: config.rootItemId,
      index: -1,
      parentId: null!,
      level: -1,
      posInSet: 0,
      setSize: 1,
    };

    for (const item of treeInstance.getItemsMeta()) {
      itemMetaMap[item.itemId] = item;
      if (!itemInstancesMap[item.itemId]) {
        const [instance, finalizeInstance] = buildInstance(
          features,
          "itemInstance",
          (instance) => ({
            item: instance,
            tree: treeInstance,
            itemId: item.itemId,
          }),
        );
        finalizeInstance();
        itemInstancesMap[item.itemId] = instance;
        itemInstances.push(instance);
      } else {
        itemInstances.push(itemInstancesMap[item.itemId]);
      }
    }
  };

  const eachFeature = (fn: (feature: FeatureImplementation<any>) => void) => {
    for (const feature of additionalFeatures) {
      fn(feature);
    }
  };

  const mainFeature: FeatureImplementation<T> = {
    key: "main",
    treeInstance: {
      getState: () => state,
      setState: ({}, updater) => {
        // Not necessary, since I think the subupdate below keeps the state fresh anyways?
        // state = typeof updater === "function" ? updater(state) : updater;
        config.setState?.(state); // TODO this cant be right... This doesnt allow external state updates
        // TODO this is never used, remove
      },
      applySubStateUpdate: <K extends keyof TreeState<any>>(
        {},
        stateName: K,
        updater: Updater<TreeState<T>[K]>,
      ) => {
        state[stateName] =
          typeof updater === "function" ? updater(state[stateName]) : updater;
        const externalStateSetter = config[
          stateHandlerNames[stateName]
        ] as Function;
        externalStateSetter?.(state[stateName]);
      },
      buildItemInstance: ({}, itemId) => {
        const [instance, finalizeInstance] = buildInstance(
          features,
          "itemInstance",
          (instance) => ({
            item: instance,
            tree: treeInstance,
            itemId,
          }),
        );
        finalizeInstance();
        return instance;
      },
      // TODO rebuildSubTree: (itemId: string) => void;
      rebuildTree: () => {
        rebuildItemMeta();
        config.setState?.(state);
      },
      getConfig: () => config,
      setConfig: (_, updater) => {
        const newConfig =
          typeof updater === "function" ? updater(config) : updater;
        const hasChangedExpandedItems =
          newConfig.state?.expandedItems &&
          newConfig.state?.expandedItems !== state.expandedItems;
        config = newConfig;

        if (newConfig.state) {
          state = { ...state, ...newConfig.state };
        }
        if (hasChangedExpandedItems) {
          // if expanded items where changed from the outside
          rebuildItemMeta();
          config.setState?.(state);
        }
      },
      getItemInstance: ({}, itemId) => itemInstancesMap[itemId],
      getItems: () => itemInstances,
      registerElement: ({}, element) => {
        if (treeElement === element) {
          return;
        }

        if (treeElement && !element) {
          eachFeature((feature) =>
            feature.onTreeUnmount?.(treeInstance, treeElement!),
          );
        } else if (!treeElement && element) {
          eachFeature((feature) =>
            feature.onTreeMount?.(treeInstance, element),
          );
        }
        treeElement = element;
      },
      getElement: () => treeElement,
      getDataRef: () => treeDataRef,
      getHotkeyPresets: () => hotkeyPresets,
    },
    itemInstance: {
      registerElement: ({ itemId, item }, element) => {
        if (itemElementsMap[itemId] === element) {
          return;
        }

        const oldElement = itemElementsMap[itemId];
        if (oldElement && !element) {
          eachFeature((feature) =>
            feature.onItemUnmount?.(item, oldElement!, treeInstance),
          );
        } else if (!oldElement && element) {
          eachFeature((feature) =>
            feature.onItemMount?.(item, element!, treeInstance),
          );
        }
        itemElementsMap[itemId] = element;
      },
      getElement: ({ itemId }) => itemElementsMap[itemId],
      // eslint-disable-next-line no-return-assign
      getDataRef: ({ itemId }) => (itemDataRefs[itemId] ??= { current: {} }),
      getItemMeta: ({ itemId }) => itemMetaMap[itemId],
    },
  };

  features.unshift(mainFeature);

  for (const feature of features) {
    Object.assign(hotkeyPresets, feature.hotkeys ?? {});
  }

  finalizeTree();

  return treeInstance;
};
