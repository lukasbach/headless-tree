import { ItemInstance, TreeInstance } from "../../types/core";
import { DropTarget, DropTargetPosition } from "./types";

export const getDragCode = ({ item, childIndex }: DropTarget<any>) =>
  `${item.getId()}__${childIndex ?? "none"}`;

export const getDropOffset = (e: any, item: ItemInstance<any>): number => {
  const bb = item.getElement()?.getBoundingClientRect();
  return bb ? (e.pageY - bb.top) / bb.height : 0.5;
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
    !draggedItems &&
    dataTransfer &&
    !config.canDropForeignDragObject?.(dataTransfer, target)
  ) {
    return false;
  }

  return true;
};

const getDropTargetPosition = (
  offset: number,
  topLinePercentage: number,
  bottomLinePercentage: number,
) => {
  if (offset < topLinePercentage) {
    return DropTargetPosition.Top;
  }
  if (offset > bottomLinePercentage) {
    return DropTargetPosition.Bottom;
  }
  return DropTargetPosition.Item;
};

export const getDropTarget = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>,
  canDropInbetween = tree.getConfig().canDropInbetween,
): DropTarget<any> => {
  console.log("gfetDropTarget", item.getItemName());
  const config = tree.getConfig();
  const draggedItems = tree.getState().dnd?.draggedItems ?? [];
  const itemTarget = { item, childIndex: null, insertionIndex: null };
  const parentTarget = {
    item: item.getParent(),
    childIndex: null,
    insertionIndex: null,
  };

  if (!canDropInbetween) {
    if (!canDrop(e.dataTransfer, parentTarget, tree)) {
      return getDropTarget(e, item.getParent(), tree, false);
    }
    return itemTarget;
  }

  const canDropInside = canDrop(e.dataTransfer, itemTarget, tree);

  const offset = getDropOffset(e, item);

  const pos = canDropInside
    ? getDropTargetPosition(
        offset,
        config.topLinePercentage ?? 0.3,
        config.bottomLinePercentage ?? 0.7,
      )
    : getDropTargetPosition(offset, 0.5, 0.5);

  if (pos === DropTargetPosition.Item) {
    return itemTarget;
  }

  if (!canDrop(e.dataTransfer, parentTarget, tree)) {
    return getDropTarget(e, item.getParent(), tree, false);
  }

  const childIndex =
    item.getIndexInParent() + (pos === DropTargetPosition.Top ? 0 : 1);

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
    childIndex,
    // TODO performance could be improved by computing this only when dragcode changed
    insertionIndex: childIndex - numberOfDragItemsBeforeTarget,
  };
};
