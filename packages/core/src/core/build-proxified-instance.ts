import { FeatureImplementation } from "../types/core";
import { InstanceBuilder, InstanceTypeMap } from "../features/main/types";
import { throwError } from "../utilities/errors";

const noop = () => {};

const findPrevInstanceMethod = (
  features: FeatureImplementation[],
  instanceType: keyof InstanceTypeMap,
  methodKey: string,
  featureSearchIndex: number,
) => {
  for (let i = featureSearchIndex; i >= 0; i--) {
    const feature = features[i];
    const itemInstanceMethod = (feature[instanceType] as any)?.[methodKey];
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
  const itemInstanceMethod = (features[featureIndex][instanceType] as any)?.[
    methodKey
  ]!;
  return itemInstanceMethod(
    {
      ...opts,
      prev:
        prevIndex !== null
          ? (...newArgs: any[]) =>
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
      has(target, key: string | symbol) {
        if (typeof key === "symbol") {
          return false;
        }
        if (key === "toJSON") {
          return false;
        }
        const hasInstanceMethod = findPrevInstanceMethod(
          features,
          instanceType,
          key,
          features.length - 1,
        );
        return Boolean(hasInstanceMethod);
      },
      get(target, key: string | symbol) {
        if (typeof key === "symbol") {
          return undefined;
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
            throw throwError(`feature missing for method ${key}`);
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
