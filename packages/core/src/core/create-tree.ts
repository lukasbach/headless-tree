import {
  FeatureImplementation,
  HotkeysConfig,
  ItemInstance,
  TreeConfig,
  TreeInstance,
  TreeState,
  Updater,
} from "../types/core";
import { MainFeatureDef } from "../features/main/types";
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

const compareFeatures = (
  feature1: FeatureImplementation,
  feature2: FeatureImplementation,
) => {
  if (feature2.key && feature1.overwrites?.includes(feature2.key)) {
    return 1;
  }
  return -1;
};

const sortFeatures = (features: FeatureImplementation[] = []) =>
  features.sort(compareFeatures);

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

  const mainFeature: FeatureImplementation<
    T,
    MainFeatureDef<T>,
    MainFeatureDef<T>
  > = {
    key: "main",
    treeInstance: {
      getState: () => state,
      setState: ({}, updater) => {
        // Not necessary, since I think the subupdate below keeps the state fresh anyways?
        // state = typeof updater === "function" ? updater(state) : updater;
        config.setState?.(state); // TODO this cant be right... This doesnt allow external state updates
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
      // TODO rebuildSubTree: (itemId: string) => void;
      rebuildTree: () => {
        rebuildItemMeta();
        config.setState?.(state);
      },
      getConfig: () => config,
      setConfig: (_, updater) => {
        config = typeof updater === "function" ? updater(config) : updater;

        if (config.state) {
          state = { ...state, ...config.state };
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
      // TODO just change to a getRef method that memoizes, maybe as part of getProps
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
  rebuildItemMeta();

  return treeInstance;
};
