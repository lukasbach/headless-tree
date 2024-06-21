/* eslint-disable no-continue,no-labels,no-extra-label */

import { InstanceBuilder } from "../features/main/types";

export const buildStaticInstance: InstanceBuilder = (
  features,
  instanceType,
  buildOpts,
) => {
  const instance = {};
  const finalize = () => {
    const opts = buildOpts(instance);
    featureLoop: for (let i = 0; i < features.length; i++) {
      // Loop goes in forward order, because later features overwrite previous ones
      // TODO loop order correct? I think so...
      const definition = features[i][instanceType];
      if (!definition) continue featureLoop;
      methodLoop: for (const [key, method] of Object.entries(definition)) {
        if (!method) continue methodLoop;
        const prev = instance[key];
        instance[key] = (...args) => {
          return method({ ...opts, prev }, ...args);
        };
      }
    }
  };
  return [instance as any, finalize];
};
