import { ItemInstance } from "../types/core";
import { DropTarget } from "../features/drag-and-drop/types";

export const insertItemsAtTarget = <T>(
  itemIds: string[],
  target: DropTarget<T>,
  onChangeChildren: (item: ItemInstance<T>, newChildrenIds: string[]) => void,
) => {
  // add moved items to new common parent, if dropped onto parent
  if (target.childIndex === null) {
    onChangeChildren(target.item, [
      ...target.item.getChildren().map((item) => item.getId()),
      ...itemIds,
    ]);
    // TODO items[0].getTree().rebuildTree();
    return;
  }

  // add moved items to new common parent, if dropped between siblings
  const oldChildren = target.item.getChildren();
  const newChildren = [
    ...oldChildren.slice(0, target.insertionIndex).map((item) => item.getId()),
    ...itemIds,
    ...oldChildren.slice(target.insertionIndex).map((item) => item.getId()),
  ];

  onChangeChildren(target.item, newChildren);

  target.item.getTree().rebuildTree();
};
