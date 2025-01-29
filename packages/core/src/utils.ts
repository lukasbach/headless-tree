import { SetStateFn, TreeState, Updater } from "./types/core";

export type NoInfer<T> = [T][T extends any ? 0 : never];

export const memo = <D extends readonly any[], P extends readonly any[], R>(
  deps: (...args: [...P]) => [...D],
  fn: (...args: [...D]) => R,
) => {
  let value: R | undefined;
  let oldDeps: D | null = null;

  return (...a: [...P]) => {
    const newDeps = deps(...a);

    if (!value) {
      value = fn(...newDeps);
      oldDeps = newDeps;
      return value;
    }

    const match =
      oldDeps &&
      oldDeps.length === newDeps.length &&
      !oldDeps.some((dep, i) => dep !== newDeps[i]);

    if (match) {
      return value;
    }

    value = fn(...newDeps);
    oldDeps = newDeps;
    return value;
  };
};

export function functionalUpdate<T>(updater: Updater<T>, input: T): T {
  return typeof updater === "function"
    ? (updater as (input: T) => T)(input)
    : updater;
}
export function makeStateUpdater<K extends keyof TreeState<any>>(
  key: K,
  instance: unknown,
): SetStateFn<TreeState<any>[K]> {
  return (updater: Updater<TreeState<any>[K]>) => {
    (instance as any).setState(<TTableState>(old: TTableState) => {
      return {
        ...old,
        [key]: functionalUpdate(updater, (old as any)[key]),
      };
    });
  };
}

export const poll = (fn: () => boolean, interval = 100, timeout = 1000) =>
  new Promise<void>((resolve) => {
    let clear: ReturnType<typeof setTimeout>;
    const i = setInterval(() => {
      if (fn()) {
        resolve();
        clearInterval(i);
        clearTimeout(clear);
      }
    }, interval);
    clear = setTimeout(() => {
      clearInterval(i);
    }, timeout);
  });
