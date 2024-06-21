import {
  FeatureImplementation,
  ItemInstance,
  TreeInstance,
} from "../types/core";

// TODO consider not proxyfying tree instances, since we dont benefit from that and
// TODO memoizing stuff on consumer-side based on tree methods might be a realistic use case

const findNextInstanceMethodIndex = (
  features: FeatureImplementation[],
  instanceType: "itemInstance" | "treeInstance",
  methodKey: string,
  featureSearchIndex: number,
) => {
  for (let i = featureSearchIndex; i >= 0; i--) {
    if (features[i][instanceType]?.[methodKey]) {
      return i;
    }
  }
  return null;
};

const invokeInstanceMethod = (
  features: FeatureImplementation[],
  instanceType: "itemInstance" | "treeInstance",
  opts: any,
  methodKey: string,
  featureSearchIndex: number,
  args: any[],
) => {
  const nextIndex = findNextInstanceMethodIndex(
    features,
    instanceType,
    methodKey,
    featureSearchIndex,
  );

  if (nextIndex !== null) {
    return features[nextIndex][instanceType]?.[methodKey]?.(
      {
        ...opts,
        prev: (...newArgs) =>
          invokeInstanceMethod(
            features,
            instanceType,
            opts,
            methodKey,
            nextIndex - 1,
            newArgs,
          ),
      },
      ...args,
    );
  }

  return null;
};

const makeProxyGet = (
  features: FeatureImplementation[],
  instanceType: "itemInstance" | "treeInstance",
  opts: any,
) => {
  let runKey: string;
  const method = (...args) => {
    const nextIndex = findNextInstanceMethodIndex(
      features,
      instanceType,
      runKey,
      features.length - 1,
    );
    if (nextIndex === null) {
      return null;
    }
    return invokeInstanceMethod(
      features,
      instanceType,
      opts,
      runKey,
      nextIndex,
      args,
    );
  };
  return (target: any, key: string | symbol) => {
    if (typeof key === "symbol") {
      return target[key];
    }
    if (key === "toJSON") {
      return {};
    }
    // Key is defined outside so that method can keep its
    // reference without having to be regenerated
    // important for memoization of methods
    runKey = key;
    return method;
  };
};

export const buildItemInstance = (
  features: FeatureImplementation[],
  tree: TreeInstance<any>,
  itemId: string,
) => {
  // demo with prototypes: https://jsfiddle.net/bgenc58r/
  const opts = { tree, itemId } as any;
  const item = new Proxy(
    {},
    {
      get: makeProxyGet(features, "itemInstance", opts),
    },
  );
  opts.item = item;
  return item as ItemInstance<any>;
};

export const buildTreeInstance = (features: FeatureImplementation[]) => {
  const opts = {} as any;
  const tree = new Proxy(
    {},
    {
      get: makeProxyGet(features, "treeInstance", opts),
    },
  );
  opts.tree = tree;
  return tree as TreeInstance<any>;
};
