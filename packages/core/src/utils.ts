import { ItemInstance, TreeState, Updater } from "./types/core";
import { DropTarget } from "./features/drag-and-drop/types";

export type NoInfer<T> = [T][T extends any ? 0 : never];

export const memo = <D extends readonly any[], R>(
  fn: (...args: [...D]) => R,
  deps: () => [...D]
) => {
  let value: R | undefined;
  let oldDeps: D | null = null;

  return () => {
    const newDeps = deps();

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
  instance: unknown
) {
  return (updater: Updater<TreeState<any>[K]>) => {
    (instance as any).setState(<TTableState>(old: TTableState) => {
      return {
        ...old,
        [key]: functionalUpdate(updater, (old as any)[key]),
      };
    });
  };
}

// TODO remove
export const scrollIntoView = (element: Element | undefined | null) => {
  if (!element) {
    return;
  }

  if ((element as any).scrollIntoViewIfNeeded) {
    (element as any).scrollIntoViewIfNeeded();
  } else {
    const boundingBox = element.getBoundingClientRect();
    const isElementInViewport =
      boundingBox.top >= 0 &&
      boundingBox.left >= 0 &&
      boundingBox.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      boundingBox.right <=
        (window.innerWidth || document.documentElement.clientWidth);
    if (!isElementInViewport) {
      element.scrollIntoView();
    }
  }
};

export const performItemsMove = <T>(
  items: ItemInstance<T>[],
  target: DropTarget<T>,
  onChangeChildren: (
    item: ItemInstance<T>,
    newChildren: ItemInstance<T>[]
  ) => void
) => {
  const numberOfDragItemsBeforeTarget = !target.childIndex
    ? 0
    : target.item
        .getChildren()
        .slice(0, target.childIndex)
        .filter((child) => items.some((item) => item.getId() === child.getId()))
        .length;

  // TODO bulk sibling changes together
  for (const item of items) {
    const siblings = item.getParent()?.getChildren();
    if (siblings) {
      onChangeChildren(
        item.getParent(),
        siblings.filter((sibling) => sibling.getId() !== item.getId())
      );
    }
  }

  if (target.childIndex === null) {
    onChangeChildren(target.item, [...target.item.getChildren(), ...items]);
    items[0].getTree().rebuildTree();
    return;
  }

  const oldChildren = target.item.getChildren();
  const newChildren = [
    ...oldChildren.slice(0, target.childIndex - numberOfDragItemsBeforeTarget),
    ...items,
    ...oldChildren.slice(target.childIndex - numberOfDragItemsBeforeTarget),
  ];

  onChangeChildren(target.item, newChildren);

  items[0].getTree().rebuildTree();
};

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
