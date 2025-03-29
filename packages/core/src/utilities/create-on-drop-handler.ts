import { ItemInstance } from "../types/core";
import { DragTarget } from "../features/drag-and-drop/types";
import { removeItemsFromParents } from "./remove-items-from-parents";
import { insertItemsAtTarget } from "./insert-items-at-target";

export const createOnDropHandler =
  <T>(
    onChangeChildren: (item: ItemInstance<T>, newChildren: string[]) => void,
  ) =>
  async (items: ItemInstance<T>[], target: DragTarget<T>) => {
    const itemIds = items.map((item) => item.getId());
    await removeItemsFromParents(items, onChangeChildren);
    await insertItemsAtTarget(itemIds, target, onChangeChildren);
  };
