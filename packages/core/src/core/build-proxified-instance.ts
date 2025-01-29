import { FeatureImplementation } from "../types/core";
import { InstanceBuilder, InstanceTypeMap } from "../features/main/types";

const noop = () => {};

const findPrevInstanceMethod = (
  features: FeatureImplementation[],
  instanceType: keyof InstanceTypeMap,
  methodKey: string,
  featureSearchIndex: number,
) => {
  for (let i = featureSearchIndex; i >= 0; i--) {
    const feature = features[i];
    const itemInstanceMethod = feature[instanceType]?.[methodKey];
    if (itemInstanceMethod) {
      return i;
    }
  }
  return null;
};

const invokeInstanceMethod = (
  features: FeatureImplementation[],
  instanceType: keyof InstanceTypeMap,
  opts: any,
  methodKey: string,
  featureIndex: number,
  args: any[],
) => {
  const prevIndex = findPrevInstanceMethod(
    features,
    instanceType,
    methodKey,
    featureIndex - 1,
  );
  const itemInstanceMethod = features[featureIndex][instanceType]?.[methodKey]!;
  return itemInstanceMethod(
    {
      ...opts,
      prev:
        prevIndex !== null
          ? (...newArgs) =>
              invokeInstanceMethod(
                features,
                instanceType,
                opts,
                methodKey,
                prevIndex,
                newArgs,
              )
          : null,
    },
    ...args,
  );
};

export const buildProxiedInstance: InstanceBuilder = (
  features,
  instanceType,
  buildOpts,
) => {
  // demo with prototypes: https://jsfiddle.net/bgenc58r/
  const opts = {};
  const item = new Proxy(
    {},
    {
      get(target, key: string | symbol) {
        if (typeof key === "symbol") {
          throw new Error(`HeadlessTree: symbol access`);
        }
        if (key === "toJSON") {
          return {};
        }
        return (...args: any[]) => {
          const featureIndex = findPrevInstanceMethod(
            features,
            instanceType,
            key,
            features.length - 1,
          );

          if (featureIndex === null) {
            throw new Error(`HeadlessTree: feature missing for method ${key}`);
          }
          return invokeInstanceMethod(
            features,
            instanceType,
            opts,
            key,
            featureIndex,
            args,
          );
        };
      },
    },
  );
  Object.assign(opts, buildOpts(item));
  return [item as any, noop];
};
