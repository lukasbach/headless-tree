export const memo = <D extends any[], R>(fn: (...args: D) => R, deps: D) => {
  let value: R | undefined;
  let oldDeps: D | null = null;

  return () => {
    if (!value) {
      value = fn(...deps);
      oldDeps = deps;
      return value;
    }

    const match =
      oldDeps &&
      oldDeps.length === deps.length &&
      !oldDeps.some((dep, i) => dep !== deps[i]);

    if (match) {
      return value;
    }

    value = fn(...deps);
    oldDeps = deps;
    return value;
  };
};
