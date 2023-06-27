import { ItemInstance } from "../types/core";
import { DropTarget } from "../features/drag-and-drop/types";

export const insertItemsAtTarget = <T>(
  items: ItemInstance<T>[],
  target: DropTarget<T>,
  onChangeChildren: (
    item: ItemInstance<T>,
    newChildrenIds: ItemInstance<T>[]
  ) => void
) => {
  // TODO this technically needs to be called before removing the old items... Maybe find a way around that,
  // shouldn't it be possible to remove the items first, recompute, then insert independent of that?
  const numberOfDragItemsBeforeTarget = !target.childIndex
    ? 0
    : target.item
        .getChildren()
        .slice(0, target.childIndex)
        .filter((item) => !!item)
        .filter((child) => items.some((item) => item.getId() === child.getId()))
        .length;

  // add moved items to new common parent, if dropped onto parent
  if (target.childIndex === null) {
    onChangeChildren(target.item, [...target.item.getChildren(), ...items]);
    items[0].getTree().rebuildTree();
    return;
  }

  // add moved items to new common parent, if dropped between siblings
  const oldChildren = target.item.getChildren();
  const newChildren = [
    ...oldChildren.slice(0, target.childIndex - numberOfDragItemsBeforeTarget),
    ...items,
    ...oldChildren.slice(target.childIndex - numberOfDragItemsBeforeTarget),
  ];

  onChangeChildren(target.item, newChildren);

  target.item.getTree().rebuildTree();
};
