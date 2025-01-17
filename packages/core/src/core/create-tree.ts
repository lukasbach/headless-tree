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
import { buildStaticInstance } from "./build-static-instance";

const verifyFeatures = (features: FeatureImplementation[] | undefined) => {
  const loadedFeatures = features?.map((feature) => feature.key);
  for (const feature of features ?? []) {
    const missingDependency = feature.deps?.find(
      (dep) => !loadedFeatures?.includes(dep),
    );
    if (missingDependency) {
      throw new Error(`${feature.key} needs ${missingDependency}`);
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

const getSubtreeRange = (
  subtreeRootId: string,
  itemMetaMap: Record<string, ItemMeta>,
  itemInstances: ItemInstance<unknown>[],
) => {
  const subtreeRootMeta = itemMetaMap[subtreeRootId];
  const start = subtreeRootMeta.index;
  console.log(
    `start is ${subtreeRootMeta.itemId}, next is ${itemInstances[start + subtreeRootMeta.posInSet + 1].getId()}`,
    [...itemInstances.map((i) => i.getId())],
  );
  const nextItem = itemInstances[start + subtreeRootMeta.posInSet + 1];
  // const end = itemInstances.findIndex(
  //   (item) => item.getId() === nextItem.getId(),
  // );
  const end = itemMetaMap[nextItem.getId()].index - 1;
  return [start, end];
};

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
    (acc, feature) => feature.getDefaultConfig?.(acc, treeInstance) ?? acc,
    initialConfig,
  ) as TreeConfig<T>;
  const stateHandlerNames = additionalFeatures.reduce(
    (acc, feature) => ({ ...acc, ...feature.stateHandlerNames }),
    {} as Record<string, string>,
  );

  let treeElement: HTMLElement | undefined | null;
  const treeDataRef: { current: any } = { current: {} };

  const itemInstancesMap: Record<string, ItemInstance<T>> = {};
  const itemInstances: ItemInstance<T>[] = [];
  const itemElementsMap: Record<string, HTMLElement | undefined | null> = {};
  const itemDataRefs: Record<string, { current: any }> = {};
  const itemMetaMap: Record<string, ItemMeta> = {};

  const hotkeyPresets = {} as HotkeysConfig<T>;

  const rebuildItemMeta = (withinItemId?: string) => {
    const [oldRangeStart, oldRangeEnd] = withinItemId
      ? getSubtreeRange(withinItemId, itemMetaMap, itemInstances)
      : [0, itemInstances.length];
    console.log("rebuildItemMeta", {
      withinItemId,
      oldRangeStart,
      oldRangeEnd,
    });
    const newItemInstances: ItemInstance<T>[] = [];
    // itemMetaMap = {};

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

    for (const item of treeInstance.getItemsMeta(withinItemId)) {
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
        newItemInstances.push(instance);
      } else {
        newItemInstances.push(itemInstancesMap[item.itemId]);
      }
    }

    // TODO of course all items below need to be updated as well... index shifts..
    // TODO do we really need a global index, is 1-3-4-2 as index sufficient?

    console.log("!!", {
      withinItemId,
      itemMetaMap,
      oldRangeStart,
      oldRangeEnd,
      newItemInstances: newItemInstances.map((i) => i.getId()),
      oldItemInstances: [
        ...itemInstances.slice(oldRangeStart, oldRangeEnd),
      ].map((i) => i.getId()),
    });

    // push indices for items below down/up
    const oldRangeDistance = oldRangeEnd - oldRangeStart;
    const newRangeDistance = newItemInstances.length + 1; // +1 for subtree root
    const distanceDiff = newRangeDistance - oldRangeDistance;
    for (let i = oldRangeEnd + 1; i < itemInstances.length; i++) {
      const item = itemInstances[i];
      const oldMeta = itemMetaMap[item.getId()];
      itemMetaMap[item.getId()] = {
        ...oldMeta,
        index: oldMeta.index + distanceDiff,
      };
    }

    // update stale subtree with new items
    itemInstances.splice(
      oldRangeStart + 1,
      oldRangeEnd - oldRangeStart,
      ...newItemInstances,
    );

    console.log(
      "DONE\n",
      itemInstances
        .map((i) => `${i.getId()}#${itemMetaMap[i.getId()].index}`)
        .join("\n"),
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
    treeInstance: {
      getState: () => state,
      setState: ({}, updater) => {
        // Not necessary, since I think the subupdate below keeps the state fresh anyways?
        // state = typeof updater === "function" ? updater(state) : updater;
        config.setState?.(state); // TODO this cant be right... This doesnt allow external state updates
      },
      applySubStateUpdate: <K extends keyof TreeState<any>>(
        _,
        stateName: K,
        updater,
      ) => {
        state[stateName] =
          typeof updater === "function" ? updater(state[stateName]) : updater;
        config[stateHandlerNames[stateName]]!(state[stateName]);
      },
      // TODO rebuildSubTree: (itemId: string) => void;
      rebuildTree: (_, withinItemId) => {
        rebuildItemMeta(withinItemId);
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
