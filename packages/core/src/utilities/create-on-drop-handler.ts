import { ItemInstance } from "../types/core";
import { DropTarget } from "../features/drag-and-drop/types";
import { removeItemsFromParents } from "./remove-items-from-parents";
import { insertItemsAtTarget } from "./insert-items-at-target";

export const createOnDropHandler =
  <T>(
    onChangeChildren: (item: ItemInstance<T>, newChildren: string[]) => void,
  ) =>
  (items: ItemInstance<T>[], target: DropTarget<T>) => {
    const itemIds = items.map((item) => item.getId());
    removeItemsFromParents(items, onChangeChildren);
    insertItemsAtTarget(itemIds, target, onChangeChildren);
  };
