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
  tree: TreeInstance<any>
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
  bottomLinePercentage: number
) => {
  if (offset < topLinePercentage) {
    return DropTargetPosition.Top;
  }
  if (offset > bottomLinePercentage) {
    return DropTargetPosition.Bottom;
  }
  return DropTargetPosition.Item;
};

// TODO mabye just make a flow chart
export const getDropTarget = (
  e: any,
  item: ItemInstance<any>,
  tree: TreeInstance<any>
): DropTarget<any> => {
  const config = tree.getConfig();
  const offset = getDropOffset(e, item);

  const dropOnItemTarget = { item, childIndex: null };

  const pos = getDropTargetPosition(
    offset,
    config.topLinePercentage ?? 0.3,
    config.bottomLinePercentage ?? 0.7
  );
  const inbetweenPos = getDropTargetPosition(offset, 0.5, 0.5);

  if (!config.canDropInbetween) {
    // TODO canDrop!?? drop on recursive parent?
    return dropOnItemTarget;
  }

  if (!canDrop(e.dataTransfer, dropOnItemTarget, tree)) {
    // TODO parent check
    return {
      item: item.getParent(),
      childIndex:
        item.getIndexInParent() +
        (inbetweenPos === DropTargetPosition.Top ? 0 : 1),
    };
  }

  if (pos === DropTargetPosition.Item) {
    return dropOnItemTarget;
  }

  return {
    item: item.getParent(),
    childIndex:
      item.getIndexInParent() + (pos === DropTargetPosition.Top ? 0 : 1),
  };
};
