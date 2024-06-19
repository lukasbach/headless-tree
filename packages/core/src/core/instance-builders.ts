import {
  FeatureImplementation,
  ItemInstance,
  TreeInstance,
} from "../types/core";

const invokeInstanceMethod = (
  features: FeatureImplementation[],
  instanceType: "itemInstance" | "treeInstance",
  opts: any,
  methodKey: string,
  featureSearchIndex: number,
  args: any[],
  isPrevCall: boolean,
) => {
  for (let i = featureSearchIndex; i >= 0; i--) {
    const feature = features[i];
    const itemInstanceMethod = feature[instanceType]?.[methodKey];
    if (itemInstanceMethod) {
      return itemInstanceMethod(
        {
          ...opts,
          prev: (...newArgs) =>
            invokeInstanceMethod(
              features,
              instanceType,
              opts,
              methodKey,
              i - 1,
              newArgs,
              true,
            ),
        },
        ...args,
      );
    }
  }
  if (isPrevCall) {
    return null;
  }
  throw new Error(`HeadlessTree: feature missing for method ${methodKey}`);
};

export const buildItemInstance = (
  features: FeatureImplementation[],
  tree: TreeInstance<any>,
  itemId: string,
) => {
  // demo with prototypes: https://jsfiddle.net/bgenc58r/
  const item = new Proxy(
    {},
    {
      get(target, key: string | symbol) {
        if (typeof key === "symbol") {
          return target[key];
        }
        if (key === "toJSON") {
          return { itemId };
        }
        return (...args) => {
          return invokeInstanceMethod(
            features,
            "itemInstance",
            { tree, item, itemId },
            key,
            features.length - 1,
            args,
            false,
          );
        };
      },
    },
  );
  return item as ItemInstance<any>;
};

// TODO important; the (...args) => ... should be a fixed instance that is returned consistently;
// TODO otherwise the Render Performance -> Memoized Slow Item Renderers story will not work
// TODO since the ref method changes everytime (and potentially other methods); if properly fixed, remove getMemoizedProp
export const buildTreeInstance = (features: FeatureImplementation[]) => {
  const tree = new Proxy(
    {},
    {
      get(target: any, key: string | symbol) {
        if (typeof key === "symbol") {
          return target[key];
        }
        if (key === "toJSON") {
          return {};
        }
        return (...args) => {
          return invokeInstanceMethod(
            features,
            "treeInstance",
            { tree },
            key,
            features.length - 1,
            args,
            false,
          );
        };
      },
    },
  );
  return tree as TreeInstance<any>;
};
