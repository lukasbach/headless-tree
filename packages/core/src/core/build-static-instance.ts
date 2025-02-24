/* eslint-disable no-continue,no-labels,no-extra-label */

import { InstanceBuilder } from "../features/main/types";

export const buildStaticInstance: InstanceBuilder = (
  features,
  instanceType,
  buildOpts,
) => {
  const instance: any = {};
  const finalize = () => {
    const opts = buildOpts(instance);
    featureLoop: for (let i = 0; i < features.length; i++) {
      // Loop goes in forward order, each features overwrite previous ones and wraps those in a prev() fn
      const definition = features[i][instanceType];
      if (!definition) continue featureLoop;
      methodLoop: for (const [key, method] of Object.entries(definition)) {
        if (!method) continue methodLoop;
        const prev = instance[key];
        instance[key] = (...args: any[]) => {
          return method({ ...opts, prev }, ...args);
        };
      }
    }
  };
  return [instance as any, finalize];
};
