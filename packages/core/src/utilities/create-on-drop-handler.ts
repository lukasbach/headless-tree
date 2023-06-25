import { ItemInstance } from "../types/core";
import { DropTarget } from "../features/drag-and-drop/types";

export const createOnDropHandler =
  <T>(
    onChangeChildren: (
      item: ItemInstance<T>,
      newChildren: ItemInstance<T>[]
    ) => void
  ) =>
  (items: ItemInstance<T>[], target: DropTarget<T>) => {
    const numberOfDragItemsBeforeTarget = !target.childIndex
      ? 0
      : target.item
          .getChildren()
          .slice(0, target.childIndex)
          .filter((child) =>
            items.some((item) => item.getId() === child.getId())
          ).length;

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
      ...oldChildren.slice(
        0,
        target.childIndex - numberOfDragItemsBeforeTarget
      ),
      ...items,
      ...oldChildren.slice(target.childIndex - numberOfDragItemsBeforeTarget),
    ];

    onChangeChildren(target.item, newChildren);

    items[0].getTree().rebuildTree();
  };
