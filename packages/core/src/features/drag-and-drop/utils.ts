import { ItemInstance, TreeInstance } from "../../types/core";
import { DropTarget } from "./types";

enum ItemDropCategory {
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

export const canDrop = (
  dataTransfer: DataTransfer | null,
  target: DropTarget<any>,
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
    !config.canDropForeignDragObject?.(dataTransfer, target)
  ) {
    return false;
  }

  return true;
};

const getItemDropCategory = (item: ItemInstance<any>) => {
  if (item.isExpanded()) {
    return ItemDropCategory.ExpandedFolder;
  }

  if (item.getIndexInParent() === item.getParent().getItemMeta().setSize - 1) {
    return ItemDropCategory.LastInGroup;
  }

  return ItemDropCategory.Item;
};

const getTargetPlacement = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>,
  canMakeChild: boolean,
): TargetPlacement => {
  const config = tree.getConfig();
  const bb = item.getElement()?.getBoundingClientRect();
  const topPercent = bb ? (e.pageY - bb.top) / bb.height : 0.5;
  const leftPixels = bb ? e.pageX - bb.left : 0;
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
      return {
        type: PlacementType.Reparent,
        reparentLevel: Math.floor(leftPixels / indent),
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
  return getNthParent(item.getParent(), n);
};

export const getDropTarget = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>,
  canDropInbetween = tree.getConfig().canDropInbetween,
): DropTarget<any> => {
  const draggedItems = tree.getState().dnd?.draggedItems ?? [];
  const itemMeta = item.getItemMeta();
  const parentMeta = item.getParent().getItemMeta();
  const itemTarget = {
    item,
    childIndex: null,
    insertionIndex: null,
    dragLineIndex: itemMeta.index,
    dragLineLevel: itemMeta.level,
  };
  const parentTarget: DropTarget<any> = {
    item: item.getParent(),
    childIndex: null,
    insertionIndex: null,
    dragLineIndex: parentMeta.index,
    dragLineLevel: parentMeta.level,
  };
  const canBecomeSibling = canDrop(e.dataTransfer, parentTarget, tree);

  if (!canDropInbetween) {
    if (!canBecomeSibling) {
      return getDropTarget(e, item.getParent(), tree, false);
    }
    return itemTarget;
  }

  const canMakeChild = canDrop(e.dataTransfer, itemTarget, tree);
  const placement = getTargetPlacement(e, item, tree, canMakeChild);

  if (placement.type === PlacementType.MakeChild) {
    return itemTarget;
  }

  if (!canBecomeSibling) {
    return getDropTarget(e, item.getParent(), tree, false);
  }

  if (placement.type === PlacementType.Reparent) {
    const reparentedTarget = getNthParent(item, placement.reparentLevel - 1);
    const targetItemAbove = getNthParent(item, placement.reparentLevel); // .getItemBelow()!;
    const targetIndex = targetItemAbove.getIndexInParent() + 1;

    // TODO possibly count items dragged out above the new target

    return {
      item: reparentedTarget,
      childIndex: targetIndex,
      insertionIndex: targetIndex,
      dragLineIndex: itemMeta.index + 1,
      dragLineLevel: placement.reparentLevel,
    };
  }

  const maybeAddOneForBelow =
    placement.type === PlacementType.ReorderAbove ? 0 : 1;
  const childIndex = item.getIndexInParent() + maybeAddOneForBelow;

  const numberOfDragItemsBeforeTarget = item
    .getParent()
    .getChildren()
    .slice(0, childIndex)
    .reduce(
      (counter, child) =>
        child && draggedItems?.some((i) => i.getId() === child.getId())
          ? ++counter
          : counter,
      0,
    );

  return {
    item: item.getParent(),
    dragLineIndex: itemMeta.index + maybeAddOneForBelow,
    dragLineLevel: itemMeta.level,
    childIndex,
    // TODO performance could be improved by computing this only when dragcode changed
    insertionIndex: childIndex - numberOfDragItemsBeforeTarget,
  };
};
