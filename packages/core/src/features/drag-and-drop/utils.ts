import { ItemInstance, TreeInstance } from "../../types/core";
import { DragTarget } from "./types";

export enum ItemDropCategory {
  Item,
  ExpandedFolder,
  LastInGroup,
}

enum PlacementType {
  ReorderAbove,
  ReorderBelow,
  MakeChild,
  Reparent,
}

type TargetPlacement =
  | {
      type:
        | PlacementType.ReorderAbove
        | PlacementType.ReorderBelow
        | PlacementType.MakeChild;
    }
  | {
      type: PlacementType.Reparent;
      reparentLevel: number;
    };

export const isOrderedDragTarget = <T>(dragTarget: DragTarget<T>) =>
  "childIndex" in dragTarget;

export const canDrop = (
  dataTransfer: DataTransfer | null,
  target: DragTarget<any>,
  tree: TreeInstance<any>,
) => {
  const draggedItems = tree.getState().dnd?.draggedItems;
  const config = tree.getConfig();

  if (draggedItems && !(config.canDrop?.(draggedItems, target) ?? true)) {
    return false;
  }

  if (
    draggedItems &&
    draggedItems.some(
      (draggedItem) =>
        target.item.getId() === draggedItem.getId() ||
        target.item.isDescendentOf(draggedItem.getId()),
    )
  ) {
    return false;
  }

  if (
    !draggedItems &&
    dataTransfer &&
    config.canDropForeignDragObject &&
    !config.canDropForeignDragObject(dataTransfer, target)
  ) {
    return false;
  }

  return true;
};

export const getItemDropCategory = (item: ItemInstance<any>) => {
  if (item.isExpanded()) {
    return ItemDropCategory.ExpandedFolder;
  }

  const parent = item.getParent();
  if (parent && item.getIndexInParent() === item.getItemMeta().setSize - 1) {
    return ItemDropCategory.LastInGroup;
  }

  return ItemDropCategory.Item;
};

export const getInsertionIndex = <T>(
  children: ItemInstance<T>[],
  childIndex: number,
  draggedItems: ItemInstance<T>[] | undefined,
) => {
  const numberOfDragItemsBeforeTarget =
    children
      .slice(0, childIndex)
      .reduce(
        (counter, child) =>
          child && draggedItems?.some((i) => i.getId() === child.getId())
            ? ++counter
            : counter,
        0,
      ) ?? 0;
  return childIndex - numberOfDragItemsBeforeTarget;
};

const getTargetPlacement = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>,
  canMakeChild: boolean,
): TargetPlacement => {
  const config = tree.getConfig();

  if (!config.canReorder) {
    return canMakeChild
      ? { type: PlacementType.MakeChild }
      : { type: PlacementType.ReorderBelow };
  }

  const bb = item.getElement()?.getBoundingClientRect();
  const topPercent = bb ? (e.clientY - bb.top) / bb.height : 0.5;
  const leftPixels = bb ? e.clientX - bb.left : 0;
  const targetDropCategory = getItemDropCategory(item);
  const reorderAreaPercentage = !canMakeChild
    ? 0.5
    : config.reorderAreaPercentage ?? 0.3;
  const indent = config.indent ?? 20;
  const makeChildType = canMakeChild
    ? PlacementType.MakeChild
    : PlacementType.ReorderBelow;

  if (targetDropCategory === ItemDropCategory.ExpandedFolder) {
    if (topPercent < reorderAreaPercentage) {
      return { type: PlacementType.ReorderAbove };
    }
    return { type: makeChildType };
  }

  if (targetDropCategory === ItemDropCategory.LastInGroup) {
    if (leftPixels < item.getItemMeta().level * indent) {
      if (topPercent < 0.5) {
        return { type: PlacementType.ReorderAbove };
      }
      const minLevel = item.getItemBelow()?.getItemMeta().level ?? 0;
      return {
        type: PlacementType.Reparent,
        reparentLevel: Math.max(minLevel, Math.floor(leftPixels / indent)),
      };
    }
    // if not at left of item area, treat as if it was a normal item
  }

  // targetDropCategory === ItemDropCategory.Item
  if (topPercent < reorderAreaPercentage) {
    return { type: PlacementType.ReorderAbove };
  }
  if (topPercent > 1 - reorderAreaPercentage) {
    return { type: PlacementType.ReorderBelow };
  }
  return { type: makeChildType };
};

export const getDragCode = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>,
) => {
  const placement = getTargetPlacement(e, item, tree, true);
  return [
    item.getId(),
    placement.type,
    placement.type === PlacementType.Reparent ? placement.reparentLevel : 0,
  ].join("__");
};

const getNthParent = (
  item: ItemInstance<any>,
  n: number,
): ItemInstance<any> => {
  if (n === item.getItemMeta().level) {
    return item;
  }
  return getNthParent(item.getParent()!, n);
};

/** @param item refers to the bottom-most item of the container, at which bottom is being reparented on (e.g. root-1-2-6)  */
export const getReparentTarget = <T>(
  item: ItemInstance<T>,
  reparentLevel: number,
  draggedItems: ItemInstance<T>[] | undefined,
) => {
  const itemMeta = item.getItemMeta();
  const reparentedTarget = getNthParent(item, reparentLevel - 1);
  const targetItemAbove = getNthParent(item, reparentLevel); // .getItemBelow()!;
  const targetIndex = targetItemAbove.getIndexInParent() + 1;

  return {
    item: reparentedTarget,
    childIndex: targetIndex,
    insertionIndex: getInsertionIndex(
      reparentedTarget.getChildren(),
      targetIndex,
      draggedItems,
    ),
    dragLineIndex: itemMeta.index + 1,
    dragLineLevel: reparentLevel,
  };
};

export const getDragTarget = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>,
  canReorder = tree.getConfig().canReorder,
): DragTarget<any> => {
  const draggedItems = tree.getState().dnd?.draggedItems;
  const itemMeta = item.getItemMeta();
  const parent = item.getParent();
  const itemTarget: DragTarget<any> = { item };
  const parentTarget: DragTarget<any> | null = parent ? { item: parent } : null;
  const canBecomeSibling =
    parentTarget && canDrop(e.dataTransfer, parentTarget, tree);

  const canMakeChild = canDrop(e.dataTransfer, itemTarget, tree);
  const placement = getTargetPlacement(e, item, tree, canMakeChild);

  if (
    !canReorder &&
    parent &&
    canBecomeSibling &&
    placement.type !== PlacementType.MakeChild
  ) {
    return parentTarget;
  }

  if (!canReorder && parent && !canBecomeSibling) {
    // TODO! this breaks in story DND/Can Drop. Maybe move this logic into a composable DragTargetStrategy[] ?
    return getDragTarget(e, parent, tree, false);
  }

  if (!parent) {
    // Shouldn't happen, but if dropped "next" to root item, just drop it inside
    return itemTarget;
  }

  if (placement.type === PlacementType.MakeChild) {
    return itemTarget;
  }

  if (!canBecomeSibling) {
    return getDragTarget(e, parent, tree, false);
  }

  if (placement.type === PlacementType.Reparent) {
    return getReparentTarget(item, placement.reparentLevel, draggedItems);
  }

  const maybeAddOneForBelow =
    placement.type === PlacementType.ReorderAbove ? 0 : 1;
  const childIndex = item.getIndexInParent() + maybeAddOneForBelow;

  return {
    item: parent,
    dragLineIndex: itemMeta.index + maybeAddOneForBelow,
    dragLineLevel: itemMeta.level,
    childIndex,
    // TODO performance could be improved by computing this only when dragcode changed
    insertionIndex: getInsertionIndex(
      parent.getChildren(),
      childIndex,
      draggedItems,
    ),
  };
};
